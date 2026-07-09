<template>
  <div
    class="rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6"
  >
    <!-- Error -->
    <div
      v-if="chartError"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      <strong>Error:</strong>
      <div class="whitespace-pre-wrap break-words mt-1">{{ chartError }}</div>
    </div>

    <!-- Header -->
    <div class="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-base-content">
          Correlation Scatter
        </h2>

        <p class="mt-1 text-sm text-base-content/70">
          Historical price correlation based on aligned timestamps
        </p>
      </div>

      <div class="join">
        <button
          class="btn btn-sm join-item"
          @click="zoomOut"
        >
          −
        </button>

        <button
          class="btn btn-sm join-item"
          @click="zoomIn"
        >
          +
        </button>

        <button
          class="btn btn-sm btn-ghost join-item"
          @click="fitToData"
        >
          Fit
        </button>

        <button
          class="btn btn-sm btn-ghost join-item"
          @click="resetZoom"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div
      class="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8"
    >
      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          Samples
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ statistics?.sampleCount ?? 0 }}
        </div>
      </div>

      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          Pearson r
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ statistics ? statistics.correlation.toFixed(4) : "-" }}
        </div>
      </div>

      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          R²
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ statistics ? statistics.rSquared.toFixed(4) : "-" }}
        </div>
      </div>

      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          Slope
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ statistics ? statistics.slope.toFixed(4) : "-" }}
        </div>
      </div>

      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          Intercept
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ statistics ? statistics.intercept.toFixed(4) : "-" }}
        </div>
      </div>

      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          X Range
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ xRangeLabel }}
        </div>
      </div>

      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          Y Range
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ yRangeLabel }}
        </div>
      </div>

      <div
        class="rounded-lg border border-base-300 bg-base-200/40 px-3 py-2"
      >
        <div class="text-xs text-base-content/60">
          Match Rate
        </div>

        <div class="mt-1 font-mono text-sm font-semibold">
          {{ matchedLabel }}
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div
      ref="chartRef"
      class="h-[620px] w-full rounded-lg border border-base-300"
    />

    <!-- Footer -->
    <div
      class="mt-4 rounded-lg border border-base-300 bg-base-200/30 px-4 py-3"
    >
      <div class="flex flex-wrap gap-x-8 gap-y-2 text-xs">
        <div>
          <span class="font-semibold">X Axis:</span>
          {{ xLabel }}
        </div>

        <div>
          <span class="font-semibold">Y Axis:</span>
          {{ yLabel }}
        </div>

        <div>
          <span class="font-semibold">Alignment:</span>
          nearest timestamp (±{{ props.tolerance }} min)
        </div>

        <div>
          <span class="font-semibold">Regression:</span>
          Ordinary Least Squares
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, onUnmounted, ref, watch} from "vue";
import * as echarts from "echarts/core";

import {ScatterChart, LineChart} from "echarts/charts";

import {
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";

import {CanvasRenderer} from "echarts/renderers";

import type {EChartsOption} from "echarts";
import type {PolymarketPriceHistoryPoint} from "@/api/polymarket.ts";

echarts.use([
  ScatterChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent,
  CanvasRenderer,
  TitleComponent,
]);

interface ScatterPoint {
  timestamp: number;
  x: number;
  y: number;
}

interface Statistics {
  sampleCount: number;
  correlation: number;
  rSquared: number;
  slope: number;
  intercept: number;
}

const props = withDefaults(
  defineProps<{
    title?: string;
    xLabel?: string;
    yLabel?: string;
    tolerance?: number;

    xHistory: PolymarketPriceHistoryPoint[];
    yHistory: PolymarketPriceHistoryPoint[];
  }>(),
  {
    title: "",
    xLabel: "Market A",
    yLabel: "Market B",
    tolerance: 1, // по умолчанию ±1 minute
  },
);

const chartError = ref<string | null>(null);

const toleranceSeconds = computed(() => (props.tolerance ?? 1) * 60);

const chartRef = ref<HTMLDivElement | null>(null);

let chart: echarts.EChartsType | null = null;

const xZoom = ref({
  start: 0,
  end: 100,
});

const yZoom = ref({
  start: 0,
  end: 100,
});

/**
 * Align two histories using nearest timestamp.
 *
 * Поведение:
 * - Если у одной серии нет данных — возвращается пустой набор.
 * - Для каждой точки из X ищется ближайшая точка Y.
 * - Пара принимается только если разница по времени <= tolerance (minutes converted to seconds).
 * - Тем самым не совпадающие данные отбрасываются и остаются только точек перекрытия.
 *
 * Complexity: O(n)
 */
const samples = computed<ScatterPoint[]>(() => {
  const xHistory = [...props.xHistory].sort((a, b) => a.t - b.t);
  const yHistory = [...props.yHistory].sort((a, b) => a.t - b.t);

  if (!xHistory.length || !yHistory.length) {
    return [];
  }

  const result: ScatterPoint[] = [];

  let j = 0;

  for (const x of xHistory) {
    while (j + 1 < yHistory.length && yHistory[j + 1].t <= x.t) {
      j++;
    }

    let best = yHistory[j];

    if (
      j + 1 < yHistory.length &&
      Math.abs(yHistory[j + 1].t - x.t) < Math.abs(best.t - x.t)
    ) {
      best = yHistory[j + 1];
    }

    if (Math.abs(best.t - x.t) <= toleranceSeconds.value) {
      result.push({
        timestamp: x.t,
        x: x.p,
        y: best.p,
      });
    }
  }

  return result;
});

const pairedSamplesCount = defineModel<number>("pairedSamplesCount", {
  default: 0,
});

watch(samples, (v) => {
  pairedSamplesCount.value = v.length;
}, {immediate: true});


const scatterData = computed(() =>
  samples.value.map((sample) => ({
    value: [sample.x, sample.y],
    timestamp: sample.timestamp,
  }))
);

const latestSample = computed<ScatterPoint | null>(() => {
  const pts = samples.value;
  if (!pts.length) return null;
  return pts.reduce((best: ScatterPoint | null, cur) =>
      best === null || cur.timestamp > best.timestamp ? cur : best,
    null);
});

const latestData = computed(() =>
  latestSample.value
    ? [
      {
        value: [latestSample.value.x, latestSample.value.y],
        timestamp: latestSample.value.timestamp,
      },
    ]
    : []
);

const xValues = computed(() => samples.value.map((p) => p.x));

const yValues = computed(() => samples.value.map((p) => p.y));

const xRange = computed(() => {
  if (!xValues.value.length) {
    return {
      min: 0,
      max: 1,
    };
  }

  return {
    min: Math.min(...xValues.value),
    max: Math.max(...xValues.value),
  };
});

const yRange = computed(() => {
  if (!yValues.value.length) {
    return {
      min: 0,
      max: 1,
    };
  }

  return {
    min: Math.min(...yValues.value),
    max: Math.max(...yValues.value),
  };
});

const xRangeLabel = computed(
  () => `${xRange.value.min.toFixed(3)} → ${xRange.value.max.toFixed(3)}`
);

const yRangeLabel = computed(
  () => `${yRange.value.min.toFixed(3)} → ${yRange.value.max.toFixed(3)}`
);

const matchedLabel = computed(() => {
  const total = Math.max(props.xHistory.length, props.yHistory.length);

  if (total === 0) {
    return "-";
  }

  return `${samples.value.length}/${total}`;
});

const statistics = computed<Statistics | null>(() => {
  const points = samples.value;

  if (points.length < 2) {
    return null;
  }

  const n = points.length;

  let sumX = 0;
  let sumY = 0;

  for (const point of points) {
    sumX += point.x;
    sumY += point.y;
  }

  const meanX = sumX / n;
  const meanY = sumY / n;

  let ssXX = 0;
  let ssYY = 0;
  let ssXY = 0;

  for (const point of points) {
    const dx = point.x - meanX;
    const dy = point.y - meanY;

    ssXX += dx * dx;
    ssYY += dy * dy;
    ssXY += dx * dy;
  }

  if (ssXX === 0 || ssYY === 0) {
    return null;
  }

  const slope = ssXY / ssXX;

  const intercept = meanY - slope * meanX;

  const correlation = ssXY / Math.sqrt(ssXX * ssYY);

  return {
    sampleCount: n,
    correlation,
    rSquared: correlation * correlation,
    slope,
    intercept,
  };
});

const regressionLine = computed(() => {
  if (!statistics.value) {
    return [];
  }

  const {slope, intercept} = statistics.value;

  return [
    [xRange.value.min, slope * xRange.value.min + intercept],
    [xRange.value.max, slope * xRange.value.max + intercept],
  ];
});

const zoomStep = 0.85;

const clampPercent = (value: number) => {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
};

const nextZoomWindow = (start: number, end: number, ratio: number) => {
  const current = end - start;

  const desired = Math.max(5, Math.min(100, current * ratio));

  const center = (start + end) / 2;

  let nextStart = center - desired / 2;
  let nextEnd = center + desired / 2;

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

const applyZoom = (
  nextX: {
    start: number;
    end: number;
  },
  nextY: {
    start: number;
    end: number;
  }
) => {
  xZoom.value = nextX;
  yZoom.value = nextY;

  if (!chart) return;

  chart.dispatchAction({
    type: "dataZoom",
    dataZoomId: "xInside",
    ...nextX,
  });

  chart.dispatchAction({
    type: "dataZoom",
    dataZoomId: "xSlider",
    ...nextX,
  });

  chart.dispatchAction({
    type: "dataZoom",
    dataZoomId: "yInside",
    ...nextY,
  });

  chart.dispatchAction({
    type: "dataZoom",
    dataZoomId: "ySlider",
    ...nextY,
  });
};

const zoomIn = () => {
  applyZoom(
    nextZoomWindow(xZoom.value.start, xZoom.value.end, zoomStep),
    nextZoomWindow(yZoom.value.start, yZoom.value.end, zoomStep)
  );
};

const zoomOut = () => {
  applyZoom(
    nextZoomWindow(xZoom.value.start, xZoom.value.end, 1 / zoomStep),
    nextZoomWindow(yZoom.value.start, yZoom.value.end, 1 / zoomStep)
  );
};

const resetZoom = () => {
  applyZoom(
    {
      start: 0,
      end: 100,
    },
    {
      start: 0,
      end: 100,
    }
  );
};

const fitToData = () => {
  resetZoom();
};

const regressionEquation = computed(() => {
  if (!statistics.value) {
    return "";
  }

  const {slope, intercept} = statistics.value;

  const sign = intercept >= 0 ? "+" : "-";

  return `y = ${slope.toFixed(4)}x ${sign} ${Math.abs(intercept).toFixed(4)}`;
});

const tooltipFormatter = (params: unknown) => {
  const p = params as {
    value?: [number, number];
    data?: { timestamp: number };
  };

  const value = p.value ?? [NaN, NaN];
  const timestamp = p.data?.timestamp ?? 0;

  return [
    `<b>${new Date(timestamp * 1000).toLocaleString()}</b>`,
    "",
    `${props.xLabel}: ${Number(value[0]).toFixed(4)}`,
    `${props.yLabel}: ${Number(value[1]).toFixed(4)}`,
    "",
    regressionEquation.value,
  ].join("<br/>");
};

const updateChart = () => {
  try {
    if (!chart) return;

    // очистка предыдущих ошибок перед обновлением
    chartError.value = null;

    const hasTitle = !!props.title;
    const titleTop = 10;
    const legendTop = hasTitle ? 42 : 12;
    const gridTop = hasTitle ? 80 : 50;

    const option: EChartsOption = {
      animation: false,

      title: hasTitle
        ? {
          text: props.title,
          left: "center",
          top: titleTop,
          textStyle: {
            fontSize: 14,
            fontWeight: 600,
            color: "#111827",
          },
        }
        : undefined,

      grid: {
        left: 70,
        right: 70,
        top: gridTop,
        bottom: 70,
      },

      legend: {
        top: legendTop,
        data: ["Samples", "Regression"],
      },

      tooltip: {
        trigger: "item",
        formatter: tooltipFormatter,
      },

      xAxis: {
        type: "value",
        name: props.xLabel,
        nameLocation: "middle",
        nameGap: 40,
        splitNumber: 10,
        min: 0,
        max: 1,
      },

      yAxis: {
        type: "value",
        name: props.yLabel,
        nameLocation: "middle",
        nameGap: 55,
        splitNumber: 10,
        min: 0,
        max: 1,
      },

      dataZoom: [
        {
          id: "xInside",
          type: "inside",
          xAxisIndex: 0,
          start: xZoom.value.start,
          end: xZoom.value.end,
        },
        {
          id: "xSlider",
          type: "slider",
          xAxisIndex: 0,
          start: xZoom.value.start,
          end: xZoom.value.end,
          bottom: 25,
          height: 18,
        },
        {
          id: "yInside",
          type: "inside",
          yAxisIndex: 0,
          start: yZoom.value.start,
          end: yZoom.value.end,
        },
        {
          id: "ySlider",
          type: "slider",
          yAxisIndex: 0,
          start: yZoom.value.start,
          end: yZoom.value.end,
          right: 20,
          width: 18,
        },
      ],

      series: [
        {
          name: "Samples",
          type: "scatter",
          symbolSize: 8,
          itemStyle: {color: "#2563eb"},
          data: scatterData.value,
        },
        {
          name: "Latest",
          type: "scatter",
          symbolSize: 8,
          itemStyle: {color: "#dc2626"}, // красный
          data: latestData.value,
          label: {
            show: !!latestSample.value,
            formatter: "latest",
            position: "top",
            fontWeight: 500,
            // color: "#dc2626",
          },
          // рисуется поверх основных точек
          z: 10,
        },
        {
          name: "Regression",
          type: "line",
          showSymbol: false,
          smooth: false,
          silent: true,
          lineStyle: {color: "#dc2626", width: 2, type: "dashed"},
          data: regressionLine.value,
        },
      ],
    };

    chart.setOption(option);
  } catch (err) {
    chartError.value = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
    console.error("Chart render error:", err);
  }
};

const syncZoom = () => {
  if (!chart) return;

  const option = chart.getOption();

  const zooms = (option.dataZoom ?? []) as Array<{
    id?: string;
    start?: number;
    end?: number;
  }>;

  const xSlider = zooms.find((z) => z.id === "xSlider");
  const ySlider = zooms.find((z) => z.id === "ySlider");

  if (
    xSlider &&
    typeof xSlider.start === "number" &&
    typeof xSlider.end === "number"
  ) {
    xZoom.value = {
      start: xSlider.start,
      end: xSlider.end,
    };
  }

  if (
    ySlider &&
    typeof ySlider.start === "number" &&
    typeof ySlider.end === "number"
  ) {
    yZoom.value = {
      start: ySlider.start,
      end: ySlider.end,
    };
  }
};

onMounted(() => {
  if (!chartRef.value) return;

  try {
    chart = echarts.init(chartRef.value);

    chart.on("datazoom", syncZoom);

    updateChart();

    const resize = () => chart?.resize();

    window.addEventListener("resize", resize);

    onUnmounted(() => {
      window.removeEventListener("resize", resize);

      chart?.dispose();

      chart = null;
      chartError.value = null;
    });
  } catch (err) {
    chartError.value = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
    console.error("Chart init error:", err);
  }
});

watch(
  () => scatterData.value,
  () => {
    updateChart();
  },
  {
    deep: true,
  }
);

watch(
  () => regressionLine.value,
  () => {
    updateChart();
  },
  {
    deep: true,
  }
);

watch(
  () => [xZoom.value.start, xZoom.value.end, yZoom.value.start, yZoom.value.end],
  () => {
    updateChart();
  }
);
</script>
