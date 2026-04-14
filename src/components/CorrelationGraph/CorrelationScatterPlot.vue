<template>
  <div
    class="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm lg:p-5"
  >
    <div class="mb-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-lg font-semibold tracking-tight text-base-content">
          Live Correlation Scatter
          <span class="ml-2 font-mono text-xs font-medium text-base-content/55">
            Rolling {{ historyWindowSeconds }}s
          </span>
        </h2>
        <div class="join flex gap-2">
          <button class="btn btn-sm join-item" @click="zoomOut">-</button>
          <button class="btn btn-sm join-item" @click="zoomIn">+</button>
          <button class="btn btn-sm btn-ghost join-item" @click="fitToData">
            Fit
          </button>
          <button class="btn btn-sm btn-ghost join-item" @click="resetZoom">
            Reset
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 xl:grid-cols-8">
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">X max</p>
          <p class="mt-1 font-mono font-semibold text-base-content/85">
            {{ xAxisMax.toFixed(3) }}
          </p>
        </div>
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">Y max</p>
          <p class="mt-1 font-mono font-semibold text-base-content/85">
            {{ yAxisMax.toFixed(3) }}
          </p>
        </div>
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">Data X</p>
          <p class="mt-1 font-mono font-semibold text-base-content/85">
            {{ availableXAxisMax.toFixed(3) }}
          </p>
        </div>
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">Data Y</p>
          <p class="mt-1 font-mono font-semibold text-base-content/85">
            {{ availableYAxisMax.toFixed(3) }}
          </p>
        </div>
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">Visible</p>
          <p class="mt-1 font-mono font-semibold text-base-content/85">
            {{ samples.length }}/{{ historyWindowSeconds }}
          </p>
        </div>
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">History</p>
          <p class="mt-1 font-mono font-semibold text-base-content/85">
            {{ historyCount }}
          </p>
        </div>
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">Regression</p>
          <p class="mt-1 font-mono font-semibold text-base-content/85">
            {{ regressionLine?.sampleCount ?? 0 }}
          </p>
        </div>
        <div
          class="rounded-md border border-base-300 bg-base-200/40 px-2.5 py-2"
        >
          <p class="text-base-content/55">Updated</p>
          <p class="mt-1 truncate font-mono font-semibold text-base-content/85">
            {{ regressionLine ? lastRegressionLabel : "—" }}
          </p>
        </div>
      </div>
    </div>

    <div
      ref="chartHostRef"
      class="h-[460px] w-full rounded-lg border border-base-300 bg-base-100"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { ScatterChart, LineChart, EffectScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import type {
  CorrelationSample,
  RegressionLine,
} from "@/composables/trading/useCorrelationSeries";

echarts.use([
  ScatterChart,
  LineChart,
  EffectScatterChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent,
  CanvasRenderer,
]);

const { samples, newestPointId, historyCount, regressionLine } = defineProps<{
  samples: CorrelationSample[];
  newestPointId: number | null;
  historyCount: number;
  regressionLine: RegressionLine | null;
  historyWindowSeconds: number;
}>();

const zoomStepRatio = 0.85;
const minZoomWindow = 5;

const getAxisMax = (values: number[]) => {
  if (values.length === 0) return 1;
  const rawMax = Math.max(...values);
  return rawMax > 0 ? rawMax : 1;
};

const availableXAxisMax = computed(() =>
  getAxisMax(samples.map((sample) => sample.marketOne)),
);
const availableYAxisMax = computed(() =>
  getAxisMax(samples.map((sample) => sample.marketTwo)),
);

const chartHostRef = ref<HTMLDivElement | null>(null);
let chart: echarts.EChartsType | null = null;

const xZoom = ref({ start: 0, end: 100 });
const yZoom = ref({ start: 0, end: 100 });

const clampPercent = (value: number) => {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const getWindowedZoom = (start: number, end: number, ratio: number) => {
  const currentStart = clampPercent(start);
  const currentEnd = clampPercent(end);
  const currentWindow = currentEnd - currentStart;
  const desiredWindow = Math.min(
    100,
    Math.max(minZoomWindow, currentWindow * ratio),
  );
  const center = (currentStart + currentEnd) / 2;
  let nextStart = center - desiredWindow / 2;
  let nextEnd = center + desiredWindow / 2;

  if (nextStart < 0) {
    nextEnd -= nextStart;
    nextStart = 0;
  }

  if (nextEnd > 100) {
    nextStart -= nextEnd - 100;
    nextEnd = 100;
  }

  return {
    start: clampPercent(nextStart),
    end: clampPercent(nextEnd),
  };
};

const xAxisMax = computed(() => xZoom.value.end / 100);
const yAxisMax = computed(() => yZoom.value.end / 100);

const hideAllTooltips = () => {
  if (!chart) return;
  chart.dispatchAction({ type: "hideTip" });
};

const applyZoom = (
  nextX: { start: number; end: number },
  nextY: { start: number; end: number },
) => {
  xZoom.value = nextX;
  yZoom.value = nextY;

  if (!chart) return;

  hideAllTooltips();
  chart.dispatchAction({ type: "dataZoom", dataZoomId: "xInside", ...nextX });
  chart.dispatchAction({ type: "dataZoom", dataZoomId: "xSlider", ...nextX });
  chart.dispatchAction({ type: "dataZoom", dataZoomId: "yInside", ...nextY });
  chart.dispatchAction({ type: "dataZoom", dataZoomId: "ySlider", ...nextY });
};

const zoomIn = () => {
  applyZoom(
    getWindowedZoom(xZoom.value.start, xZoom.value.end, zoomStepRatio),
    getWindowedZoom(yZoom.value.start, yZoom.value.end, zoomStepRatio),
  );
};

const zoomOut = () => {
  applyZoom(
    getWindowedZoom(xZoom.value.start, xZoom.value.end, 1 / zoomStepRatio),
    getWindowedZoom(yZoom.value.start, yZoom.value.end, 1 / zoomStepRatio),
  );
};

const fitToData = () => {
  applyZoom(
    { start: 0, end: clampPercent(availableXAxisMax.value * 100) },
    { start: 0, end: clampPercent(availableYAxisMax.value * 100) },
  );
};

const resetZoom = () => {
  applyZoom({ start: 0, end: 100 }, { start: 0, end: 100 });
};

const getThemeColor = (token: string, alpha = 1, fallback = "#9ca3af") => {
  if (!chartHostRef.value) return fallback;

  const value = getComputedStyle(chartHostRef.value)
    .getPropertyValue(token)
    .trim();
  if (!value) return fallback;
  return `hsl(${value} / ${alpha})`;
};

const clampUnit = (value: number) => {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const getRegressionSegmentInBounds = (
  slope: number,
  intercept: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
) => {
  const epsilon = 1e-9;
  const points: Array<{ x: number; y: number }> = [];

  const within = (value: number, min: number, max: number) =>
    value >= min && value <= max;

  const yAtXMin = slope * xMin + intercept;
  if (within(yAtXMin, yMin, yMax)) points.push({ x: xMin, y: yAtXMin });

  const yAtXMax = slope * xMax + intercept;
  if (within(yAtXMax, yMin, yMax)) points.push({ x: xMax, y: yAtXMax });

  if (Math.abs(slope) > epsilon) {
    const xAtYMin = (yMin - intercept) / slope;
    if (within(xAtYMin, xMin, xMax)) points.push({ x: xAtYMin, y: yMin });

    const xAtYMax = (yMax - intercept) / slope;
    if (within(xAtYMax, xMin, xMax)) points.push({ x: xAtYMax, y: yMax });
  }

  const unique = [] as Array<{ x: number; y: number }>;
  for (const point of points) {
    const exists = unique.some(
      (saved) =>
        Math.abs(saved.x - point.x) < epsilon &&
        Math.abs(saved.y - point.y) < epsilon,
    );
    if (!exists) unique.push(point);
  }

  if (unique.length < 2) return null;

  let start = unique[0];
  let end = unique[1];
  let maxDistanceSquared = -1;

  for (let left = 0; left < unique.length; left += 1) {
    for (let right = left + 1; right < unique.length; right += 1) {
      const dx = unique[left].x - unique[right].x;
      const dy = unique[left].y - unique[right].y;
      const distanceSquared = dx * dx + dy * dy;

      if (distanceSquared > maxDistanceSquared) {
        maxDistanceSquared = distanceSquared;
        start = unique[left];
        end = unique[right];
      }
    }
  }

  return { start, end };
};

const syncZoomFromChart = () => {
  if (!chart) return;
  hideAllTooltips();

  const option = chart.getOption();
  const zoomEntries = (option.dataZoom ?? []) as Array<{
    id?: string;
    start?: number;
    end?: number;
  }>;

  const xSlider = zoomEntries.find((entry) => entry.id === "xSlider");
  const ySlider = zoomEntries.find((entry) => entry.id === "ySlider");

  if (xSlider?.start != null && xSlider.end != null) {
    xZoom.value = {
      start: clampPercent(xSlider.start),
      end: clampPercent(xSlider.end),
    };
  }

  if (ySlider?.start != null && ySlider.end != null) {
    yZoom.value = {
      start: clampPercent(ySlider.start),
      end: clampPercent(ySlider.end),
    };
  }
};

const updateChart = () => {
  if (!chart) return;

  const pointColor = "#2563eb";
  const pointBorderColor = "#1d4ed8";
  const textColor = getThemeColor("--bc", 0.78, "#64748b");
  const axisColor = getThemeColor("--bc", 0.72, "#64748b");
  const gridColor = getThemeColor("--bc", 0.22, "#94a3b8");
  const regressionColor = "#dc2626";
  const highlightColor = "#3b82f6";

  const xMin = xZoom.value.start / 100;
  const xMax = xZoom.value.end / 100;
  const yMin = yZoom.value.start / 100;
  const yMax = yZoom.value.end / 100;

  const overlapCounter = new Map<string, number>();
  const scatterData = samples.map((sample, index) => {
    const key = `${sample.marketOne.toFixed(4)}:${sample.marketTwo.toFixed(4)}`;
    const seen = overlapCounter.get(key) ?? 0;
    overlapCounter.set(key, seen + 1);

    const angle = (seen * 137.5 * Math.PI) / 180;
    const radius = Math.min(seen, 10) * 0.0018;
    const jitteredX = clampUnit(sample.marketOne + Math.cos(angle) * radius);
    const jitteredY = clampUnit(sample.marketTwo + Math.sin(angle) * radius);

    return {
      id: sample.id,
      value: [jitteredX, jitteredY, sample.id],
      itemStyle: {
        opacity:
          samples.length > 0 ? 0.4 + 0.5 * ((index + 1) / samples.length) : 0.9,
        color: pointColor,
        borderColor: pointBorderColor,
        borderWidth: 1,
      },
      symbolSize: sample.id === newestPointId ? 10 : 8,
    };
  });

  const newestSpreadPoint = scatterData.find(
    (point) => point.id === newestPointId,
  );
  const newestHighlightData = newestSpreadPoint
    ? [[Number(newestSpreadPoint.value[0]), Number(newestSpreadPoint.value[1])]]
    : [];

  const clippedRegression = regressionLine
    ? getRegressionSegmentInBounds(
        regressionLine.slope,
        regressionLine.intercept,
        xMin,
        xMax,
        yMin,
        yMax,
      )
    : null;

  const regressionData = clippedRegression
    ? [
        [clippedRegression.start.x, clippedRegression.start.y],
        [clippedRegression.end.x, clippedRegression.end.y],
      ]
    : [];

  const option: EChartsOption = {
    animationDuration: 250,
    animationDurationUpdate: 200,
    grid: {
      left: 62,
      right: 86,
      top: 44,
      bottom: 74,
    },
    legend: {
      top: 8,
      textStyle: { color: textColor, fontFamily: "monospace", fontSize: 11 },
      data: ["Market pair sample", "Rolling regression"],
    },
    tooltip: {
      trigger: "item",
      confine: true,
      renderMode: "richText",
      triggerOn: "mousemove",
      alwaysShowContent: false,
      enterable: false,
      hideDelay: 0,
      transitionDuration: 0,
      formatter: (params) => {
        const datum = Array.isArray(params) ? params[0] : params;
        if (!datum || !Array.isArray(datum.value)) return "";
        const point = datum.value;
        const x = typeof point[0] === "number" ? point[0].toFixed(4) : "—";
        const y = typeof point[1] === "number" ? point[1].toFixed(4) : "—";
        return `${datum.seriesName ?? "Sample"}\nX: ${x}\nY: ${y}`;
      },
    },
    xAxis: {
      type: "value",
      name: "Market One Price (X)",
      min: 0,
      max: 1,
      nameLocation: "middle",
      nameGap: 36,
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: textColor, fontFamily: "monospace" },
      splitLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      name: "Market Two Price (Y)",
      min: 0,
      max: 1,
      nameLocation: "middle",
      nameGap: 46,
      axisLine: { lineStyle: { color: axisColor } },
      axisLabel: { color: textColor, fontFamily: "monospace" },
      splitLine: { lineStyle: { color: gridColor } },
    },
    dataZoom: [
      {
        id: "xInside",
        type: "inside",
        xAxisIndex: 0,
        start: xZoom.value.start,
        end: xZoom.value.end,
        zoomOnMouseWheel: true,
        moveOnMouseWheel: true,
        moveOnMouseMove: true,
      },
      {
        id: "xSlider",
        type: "slider",
        xAxisIndex: 0,
        height: 18,
        bottom: 24,
        start: xZoom.value.start,
        end: xZoom.value.end,
        moveHandleSize: 10,
      },
      {
        id: "yInside",
        type: "inside",
        yAxisIndex: 0,
        start: yZoom.value.start,
        end: yZoom.value.end,
        zoomOnMouseWheel: "shift",
        moveOnMouseWheel: true,
        moveOnMouseMove: true,
      },
      {
        id: "ySlider",
        type: "slider",
        yAxisIndex: 0,
        right: 24,
        width: 18,
        start: yZoom.value.start,
        end: yZoom.value.end,
        moveHandleSize: 10,
      },
    ],
    series: [
      {
        id: "samples",
        name: "Market pair sample",
        type: "scatter",
        data: scatterData,
        emphasis: {
          focus: "series",
        },
      },
      {
        id: "newest-sample-highlight",
        name: "Newest sample highlight",
        type: "effectScatter",
        data: newestHighlightData,
        silent: true,
        tooltip: { show: false },
        z: 10,
        symbolSize: 14,
        rippleEffect: {
          scale: 2.4,
          brushType: "stroke",
          period: 2.6,
        },
        itemStyle: {
          color: highlightColor,
          shadowBlur: 7,
          shadowColor: "#60a5fa",
          borderColor: "#bfdbfe",
          borderWidth: 1.2,
        },
      },
      {
        id: "rolling-regression",
        name: "Rolling regression",
        type: "line",
        data: regressionData,
        showSymbol: false,
        silent: true,
        tooltip: { show: false },
        lineStyle: {
          color: regressionColor,
          width: 2.3,
          type: "dashed",
        },
      },
    ],
  };

  hideAllTooltips();
  chart.setOption(option, {
    notMerge: false,
    replaceMerge: ["series", "dataZoom"],
    lazyUpdate: true,
  });
};

onMounted(() => {
  if (!chartHostRef.value) return;

  const chartInstance = echarts.init(chartHostRef.value);
  chart = chartInstance;
  const onGlobalOut = () => {
    hideAllTooltips();
  };
  chartInstance.on("datazoom", syncZoomFromChart);
  chartInstance.on("globalout", onGlobalOut);

  const onResize = () => chart?.resize();
  window.addEventListener("resize", onResize);

  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    chartInstance.off("datazoom", syncZoomFromChart);
    chartInstance.off("globalout", onGlobalOut);
    chartInstance.dispose();
    chart = null;
  });

  updateChart();
});

watch(
  () => [samples, regressionLine, newestPointId],
  () => {
    updateChart();
  },
);

watch(
  () => [
    xZoom.value.start,
    xZoom.value.end,
    yZoom.value.start,
    yZoom.value.end,
  ],
  () => {
    updateChart();
  },
);

const lastRegressionLabel = computed(() => {
  if (!regressionLine) return "—";
  return new Date(regressionLine.updatedAt).toLocaleTimeString();
});
</script>

<style scoped>
.echarts-tooltip {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
}
</style>
