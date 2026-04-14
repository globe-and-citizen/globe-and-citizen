import { computed, onMounted, onUnmounted, ref } from 'vue'

type ExchangeKey = 'coinbase' | 'binance' | 'okx'

type ExchangeState = {
  price: number | null
  updatedAt: number | null
}

type SocketController = {
  connect: () => void
  close: () => void
}

const createMedian = (values: number[]) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[middle]
  return (sorted[middle - 1] + sorted[middle]) / 2
}

export function useExternalBtcBenchmark() {
  const prices = ref<Record<ExchangeKey, ExchangeState>>({
    coinbase: { price: null, updatedAt: null },
    binance: { price: null, updatedAt: null },
    okx: { price: null, updatedAt: null },
  })

  const controllers: SocketController[] = []

  const setPrice = (exchange: ExchangeKey, rawPrice: string | number | null | undefined) => {
    const price = Number(rawPrice)
    if (!Number.isFinite(price) || price <= 0) return
    prices.value[exchange] = {
      price,
      updatedAt: Date.now(),
    }
  }

  const connectWithReconnect = (
    createSocket: () => WebSocket,
    onOpen: (socket: WebSocket) => void,
    onMessage: (event: MessageEvent<string>) => void,
  ): SocketController => {
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let attempts = 0
    let stopped = false

    const connect = () => {
      if (stopped) return
      socket = createSocket()

      socket.onopen = () => {
        attempts = 0
        onOpen(socket as WebSocket)
      }

      socket.onmessage = (event) => {
        onMessage(event as MessageEvent<string>)
      }

      socket.onclose = () => {
        if (stopped) return
        const delay = Math.min(1000 * Math.pow(2, attempts), 15000)
        attempts += 1
        reconnectTimer = setTimeout(connect, delay)
      }

      socket.onerror = () => {
        socket?.close()
      }
    }

    const close = () => {
      stopped = true
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      socket?.close()
      socket = null
    }

    return { connect, close }
  }

  const coinbaseController = connectWithReconnect(
    () => new WebSocket('wss://ws-feed.exchange.coinbase.com'),
    (socket) => {
      socket.send(
        JSON.stringify({
          type: 'subscribe',
          product_ids: ['BTC-USD'],
          channels: ['ticker'],
        }),
      )
    },
    (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'ticker') {
          setPrice('coinbase', data.price)
        }
      } catch {
        return
      }
    },
  )

  const binanceController = connectWithReconnect(
    () => new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade'),
    () => {},
    (event) => {
      try {
        const data = JSON.parse(event.data)
        setPrice('binance', data.p)
      } catch {
        return
      }
    },
  )

  const okxController = connectWithReconnect(
    () => new WebSocket('wss://ws.okx.com:8443/ws/v5/public'),
    (socket) => {
      socket.send(
        JSON.stringify({
          op: 'subscribe',
          args: [{ channel: 'tickers', instId: 'BTC-USDT' }],
        }),
      )
    },
    (event) => {
      try {
        const data = JSON.parse(event.data)
        if (Array.isArray(data?.data) && data.data.length) {
          setPrice('okx', data.data[0]?.last)
        }
      } catch {
        return
      }
    },
  )

  controllers.push(coinbaseController, binanceController, okxController)

  onMounted(() => {
    controllers.forEach((controller) => controller.connect())
  })

  onUnmounted(() => {
    controllers.forEach((controller) => controller.close())
  })

  const activeExchangeCount = computed(() => {
    return Object.values(prices.value).filter((entry) => entry.price !== null).length
  })

  const medianPrice = computed(() => {
    const values = Object.values(prices.value)
      .map((entry) => entry.price)
      .filter((price): price is number => price !== null)
    return createMedian(values)
  })

  const lastUpdatedAt = computed(() => {
    const timestamps = Object.values(prices.value)
      .map((entry) => entry.updatedAt)
      .filter((timestamp): timestamp is number => timestamp !== null)

    if (!timestamps.length) return null
    return Math.max(...timestamps)
  })

  return {
    exchangePrices: prices,
    medianPrice,
    activeExchangeCount,
    lastUpdatedAt,
  }
}
