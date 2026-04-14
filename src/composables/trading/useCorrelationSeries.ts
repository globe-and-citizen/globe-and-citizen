import { computed, onUnmounted, ref, type Ref } from 'vue'

export interface CorrelationSample {
  id: number
  timestamp: number
  marketOne: number
  marketTwo: number
}

export interface RegressionLine {
  slope: number
  intercept: number
  start: { x: number; y: number }
  end: { x: number; y: number }
  sampleCount: number
  updatedAt: number
}

interface UseCorrelationSeriesOptions {
  historySeconds?: number
  visiblePointsCount?: number
  sampleIntervalMs?: number
  regressionIntervalMs?: number
  regressionWindowMs?: number
  maxPairSkewMs?: number
  maxFeedAgeMs?: number
  logEvents?: boolean
}

type SampleSkipReason = 'invalid-price' | 'missing-update-timestamp' | 'stale-or-skewed'

const clampHistoryPoints = (value: number) => {
  const normalized = Number.isFinite(value) ? Math.round(value) : 180
  if (normalized < 60) return 60
  if (normalized > 300) return 300
  return normalized
}

const clampVisibleCount = (value: number, maxHistoryPoints: number) => {
  const normalized = Number.isFinite(value) ? Math.round(value) : 60
  if (normalized < 1) return 1
  if (normalized > maxHistoryPoints) return maxHistoryPoints
  return normalized
}

const clampRegressionWindowMs = (value: number) => {
  const normalized = Number.isFinite(value) ? Math.round(value) : 60000
  if (normalized < 1000) return 1000
  return normalized
}

const clampUnit = (value: number) => {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

const isWithinUnit = (value: number) => value >= 0 && value <= 1

const dedupePoints = (points: Array<{ x: number; y: number }>) => {
  const epsilon = 1e-9
  const unique: Array<{ x: number; y: number }> = []

  for (const point of points) {
    const exists = unique.some(
      (saved) => Math.abs(saved.x - point.x) < epsilon && Math.abs(saved.y - point.y) < epsilon,
    )

    if (!exists) unique.push(point)
  }

  return unique
}

const getRegressionSegmentInUnitSquare = (slope: number, intercept: number) => {
  const epsilon = 1e-9
  const candidates: Array<{ x: number; y: number }> = []

  const yAtX0 = intercept
  if (isWithinUnit(yAtX0)) candidates.push({ x: 0, y: yAtX0 })

  const yAtX1 = slope + intercept
  if (isWithinUnit(yAtX1)) candidates.push({ x: 1, y: yAtX1 })

  if (Math.abs(slope) > epsilon) {
    const xAtY0 = -intercept / slope
    if (isWithinUnit(xAtY0)) candidates.push({ x: xAtY0, y: 0 })

    const xAtY1 = (1 - intercept) / slope
    if (isWithinUnit(xAtY1)) candidates.push({ x: xAtY1, y: 1 })
  }

  const uniqueCandidates = dedupePoints(candidates)
  if (uniqueCandidates.length < 2) {
    return {
      start: { x: 0, y: clampUnit(yAtX0) },
      end: { x: 1, y: clampUnit(yAtX1) },
    }
  }

  let start = uniqueCandidates[0]
  let end = uniqueCandidates[1]
  let maxDistanceSquared = -1

  for (let left = 0; left < uniqueCandidates.length; left += 1) {
    for (let right = left + 1; right < uniqueCandidates.length; right += 1) {
      const dx = uniqueCandidates[left].x - uniqueCandidates[right].x
      const dy = uniqueCandidates[left].y - uniqueCandidates[right].y
      const distanceSquared = dx * dx + dy * dy

      if (distanceSquared > maxDistanceSquared) {
        maxDistanceSquared = distanceSquared
        start = uniqueCandidates[left]
        end = uniqueCandidates[right]
      }
    }
  }

  return { start, end }
}

export const useCorrelationSeries = (
  marketOnePrice: Ref<number | null>,
  marketTwoPrice: Ref<number | null>,
  marketOneUpdatedAt?: Ref<number | null>,
  marketTwoUpdatedAt?: Ref<number | null>,
  options: UseCorrelationSeriesOptions = {},
) => {
  const maxHistoryPoints = ref(clampHistoryPoints(options.historySeconds ?? 180))
  const visiblePointsCount = ref(
    clampVisibleCount(options.visiblePointsCount ?? 60, maxHistoryPoints.value),
  )
  const sampleIntervalMs = options.sampleIntervalMs ?? 1000
  const regressionIntervalMs = options.regressionIntervalMs ?? 60000
  const regressionWindowMs = ref(clampRegressionWindowMs(options.regressionWindowMs ?? 60000))
  const maxPairSkewMs = options.maxPairSkewMs ?? 3000
  const maxFeedAgeMs = options.maxFeedAgeMs ?? 15000
  const logEvents = options.logEvents ?? false

  const history = ref<CorrelationSample[]>([])
  const newestPointId = ref<number | null>(null)
  const regressionLine = ref<RegressionLine | null>(null)
  const lastRegressionAt = ref<number | null>(null)
  const sampledCount = ref(0)
  const skippedCount = ref(0)
  const skippedInvalidPrice = ref(0)
  const skippedMissingUpdateTimestamp = ref(0)
  const skippedStaleOrSkewed = ref(0)
  const lastSkipReason = ref<SampleSkipReason | null>(null)

  let sampleTimer: number | null = null
  let regressionTimer: number | null = null
  let pointId = 0

  const visiblePoints = computed(() => history.value.slice(-visiblePointsCount.value))

  const logEvent = (message: string, payload?: Record<string, unknown>) => {
    if (!logEvents) return

    if (payload) {
      console.info(`[CorrelationSeries] ${message}`, payload)
      return
    }

    console.info(`[CorrelationSeries] ${message}`)
  }

  const markSkipped = (reason: SampleSkipReason) => {
    skippedCount.value += 1
    lastSkipReason.value = reason

    if (reason === 'invalid-price') {
      skippedInvalidPrice.value += 1
      logEvent('sample-skipped', {
        reason,
        skippedCount: skippedCount.value,
      })
      return
    }

    if (reason === 'missing-update-timestamp') {
      skippedMissingUpdateTimestamp.value += 1
      logEvent('sample-skipped', {
        reason,
        skippedCount: skippedCount.value,
      })
      return
    }

    skippedStaleOrSkewed.value += 1
    logEvent('sample-skipped', {
      reason,
      skippedCount: skippedCount.value,
    })
  }

  const addSample = () => {
    const marketOneRaw = marketOnePrice.value
    const marketTwoRaw = marketTwoPrice.value

    if (!Number.isFinite(marketOneRaw) || !Number.isFinite(marketTwoRaw)) {
      markSkipped('invalid-price')
      return
    }

    if (marketOneUpdatedAt && marketTwoUpdatedAt) {
      const updateA = marketOneUpdatedAt.value
      const updateB = marketTwoUpdatedAt.value

      if (!Number.isFinite(updateA) || !Number.isFinite(updateB)) {
        markSkipped('missing-update-timestamp')
        return
      }

      const now = Date.now()
      const ageA = now - Number(updateA)
      const ageB = now - Number(updateB)
      const skew = Math.abs(Number(updateA) - Number(updateB))

      if (ageA > maxFeedAgeMs || ageB > maxFeedAgeMs || skew > maxPairSkewMs) {
        markSkipped('stale-or-skewed')
        return
      }
    }

    const sample: CorrelationSample = {
      id: pointId,
      timestamp: Date.now(),
      marketOne: clampUnit(Number(marketOneRaw)),
      marketTwo: clampUnit(Number(marketTwoRaw)),
    }

    pointId += 1
    history.value.push(sample)
    newestPointId.value = sample.id
    sampledCount.value += 1

    logEvent('sample-added', {
      sampleId: sample.id,
      x: sample.marketOne,
      y: sample.marketTwo,
      sampledCount: sampledCount.value,
      visibleCount: visiblePoints.value.length,
      historyCount: history.value.length,
    })

    if (history.value.length > maxHistoryPoints.value) {
      history.value.splice(0, history.value.length - maxHistoryPoints.value)
    }
  }

  const recalculateRegression = () => {
    const now = Date.now()
    const regressionWindowStart = now - regressionWindowMs.value
    const samples = history.value.filter((sample) => sample.timestamp >= regressionWindowStart)

    if (samples.length < 2) {
      regressionLine.value = null
      lastRegressionAt.value = now
      logEvent('regression-skipped', {
        reason: 'insufficient-samples',
        sampleCount: samples.length,
        windowMs: regressionWindowMs.value,
      })
      return
    }

    const n = samples.length
    const sumX = samples.reduce((acc, sample) => acc + sample.marketOne, 0)
    const sumY = samples.reduce((acc, sample) => acc + sample.marketTwo, 0)
    const sumXY = samples.reduce((acc, sample) => acc + sample.marketOne * sample.marketTwo, 0)
    const sumXX = samples.reduce((acc, sample) => acc + sample.marketOne * sample.marketOne, 0)
    const denominator = n * sumXX - sumX * sumX

    const slope =
      Math.abs(denominator) > Number.EPSILON ? (n * sumXY - sumX * sumY) / denominator : 0
    const intercept = (sumY - slope * sumX) / n

    const segment = getRegressionSegmentInUnitSquare(slope, intercept)

    regressionLine.value = {
      slope,
      intercept,
      start: segment.start,
      end: segment.end,
      sampleCount: n,
      updatedAt: now,
    }
    lastRegressionAt.value = now

    logEvent('regression-updated', {
      slope,
      intercept,
      sampleCount: n,
      windowMs: regressionWindowMs.value,
      updatedAt: now,
    })
  }

  const start = () => {
    if (sampleTimer !== null) return

    logEvent('series-started', {
      sampleIntervalMs,
      regressionIntervalMs,
      regressionWindowMs: regressionWindowMs.value,
      maxHistoryPoints: maxHistoryPoints.value,
      visiblePointsCount: visiblePointsCount.value,
      maxFeedAgeMs,
      maxPairSkewMs,
    })

    sampleTimer = window.setInterval(addSample, sampleIntervalMs)
    addSample()

    if (regressionTimer !== null) {
      clearInterval(regressionTimer)
      regressionTimer = null
    }

    recalculateRegression()
    regressionTimer = window.setInterval(recalculateRegression, regressionIntervalMs)
  }

  const stop = () => {
    if (sampleTimer !== null) {
      clearInterval(sampleTimer)
      sampleTimer = null
    }

    if (regressionTimer !== null) {
      clearInterval(regressionTimer)
      regressionTimer = null
    }

    logEvent('series-stopped', {
      sampledCount: sampledCount.value,
      skippedCount: skippedCount.value,
    })
  }

  const reset = () => {
    history.value = []
    newestPointId.value = null
    regressionLine.value = null
    lastRegressionAt.value = null
    pointId = 0
    sampledCount.value = 0
    skippedCount.value = 0
    skippedInvalidPrice.value = 0
    skippedMissingUpdateTimestamp.value = 0
    skippedStaleOrSkewed.value = 0
    lastSkipReason.value = null

    logEvent('series-reset')
  }

  const setHistorySeconds = (seconds: number) => {
    maxHistoryPoints.value = clampHistoryPoints(seconds)
    visiblePointsCount.value = clampVisibleCount(visiblePointsCount.value, maxHistoryPoints.value)

    if (history.value.length > maxHistoryPoints.value) {
      history.value.splice(0, history.value.length - maxHistoryPoints.value)
    }

    logEvent('history-window-updated', {
      historySeconds: maxHistoryPoints.value,
    })
  }

  const setVisiblePointsCount = (count: number) => {
    visiblePointsCount.value = clampVisibleCount(count, maxHistoryPoints.value)

    logEvent('visible-points-window-updated', {
      visiblePointsCount: visiblePointsCount.value,
    })
  }

  const setRegressionWindowMs = (windowMs: number) => {
    regressionWindowMs.value = clampRegressionWindowMs(windowMs)
    recalculateRegression()

    logEvent('regression-window-updated', {
      regressionWindowMs: regressionWindowMs.value,
    })
  }

  onUnmounted(() => {
    stop()
  })

  return {
    history,
    visiblePoints,
    newestPointId,
    regressionLine,
    lastRegressionAt,
    sampledCount,
    skippedCount,
    skippedInvalidPrice,
    skippedMissingUpdateTimestamp,
    skippedStaleOrSkewed,
    lastSkipReason,
    maxHistoryPoints,
    visiblePointsCount,
    regressionWindowMs,
    setHistorySeconds,
    setVisiblePointsCount,
    setRegressionWindowMs,
    start,
    stop,
    reset,
  }
}
