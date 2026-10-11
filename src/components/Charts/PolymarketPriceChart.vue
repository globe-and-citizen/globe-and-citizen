<template>
  <div
    class="min-h-[220px] overflow-hidden rounded-md border border-border bg-white"
    role="img"
    :aria-label="`${label} price history`"
  >
    <div
      v-if="isPending"
      class="flex min-h-[220px] items-center justify-center p-6"
    >
      <div class="w-full animate-pulse space-y-4" aria-label="Loading price history">
        <div class="h-3 w-24 rounded bg-slate-200"></div>
        <div class="h-32 rounded bg-slate-100"></div>
      </div>
    </div>
    <div
      v-else-if="isError"
      class="flex min-h-[220px] items-center justify-center p-6 text-center text-sm text-muted-foreground"
    >
      Price history is temporarily unavailable.
    </div>
    <div
      v-else-if="chartPoints.length === 0"
      class="flex min-h-[220px] items-center justify-center p-6 text-center text-sm text-muted-foreground"
    >
      No price history is available for this market yet.
    </div>
    <v-chart v-else class="price-chart" :option="option" autoresize />
  </div>
</template>

<script setup lang="ts">
import { getPolymarketPricesHistory } from "@/api/polymarket";
import { useQuery } from "@tanstack/vue-query";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent } from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed } from "vue";
import VChart from "vue-echarts";

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent]);

const props = withDefaults(
  defineProps<{
    tokenId: string;
    label?: string;
    accentColor?: string;
  }>(),
  {
    label: "Market",
    accentColor: "#0ea5e9",
  },
);

const tokenId = computed(() => props.tokenId.trim());
const { data, isPending, isError } = useQuery({
  queryKey: computed(() => ["polymarket-article-price-history", tokenId.value]),
  queryFn: () =>
    getPolymarketPricesHistory({
      market: tokenId.value,
      interval: "max",
    }),
  enabled: computed(() => tokenId.value.length > 0),
  staleTime: 5 * 60 * 1000,
  retry: 1,
});

const chartPoints = computed<[number, number][]>(() => {
  const history = data.value?.history ?? [];
  const normalized = history
    .map((point) => [Number(point.t) * 1000, Number(point.p)] as [number, number])
    .filter(
      ([timestamp, price]) =>
        Number.isFinite(timestamp) &&
        Number.isFinite(price) &&
        price >= 0 &&
        price <= 1,
    )
    .sort((a, b) => a[0] - b[0]);

  const maximumPoints = 750;
  if (normalized.length <= maximumPoints) return normalized;

  return Array.from({ length: maximumPoints }, (_, index) => {
    const sourceIndex = Math.round(
      (index * (normalized.length - 1)) / (maximumPoints - 1),
    );
    return normalized[sourceIndex] as [number, number];
  });
});

const option = computed(() => ({
  animationDuration: 300,
  backgroundColor: "#ffffff",
  tooltip: {
    trigger: "axis",
    confine: true,
    formatter: (params: Array<{ value: [number, number] }>) => {
      const point = params[0]?.value;
      if (!point) return "";
      const date = new Date(point[0]).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return `${date}<br/><strong>${Math.round(point[1] * 100)}%</strong>`;
    },
  },
  grid: {
    left: 14,
    right: 16,
    top: 18,
    bottom: 12,
    containLabel: true,
  },
  xAxis: {
    type: "time",
    boundaryGap: false,
    axisLine: { lineStyle: { color: "#cbd5e1" } },
    axisTick: { show: false },
    axisLabel: {
      color: "#64748b",
      fontSize: 10,
      hideOverlap: true,
      formatter: (value: number) =>
        new Date(value).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
    },
    splitLine: { show: false },
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 1,
    interval: 0.25,
    axisLine: { show: true, lineStyle: { color: "#cbd5e1" } },
    axisTick: { show: false },
    axisLabel: {
      color: "#64748b",
      fontSize: 10,
      formatter: (value: number) => `${Math.round(value * 100)}%`,
    },
    splitLine: {
      show: true,
      lineStyle: { color: "#e2e8f0", width: 1 },
    },
  },
  series: [
    {
      name: props.label,
      type: "line",
      data: chartPoints.value,
      showSymbol: chartPoints.value.length <= 2,
      symbolSize: 6,
      smooth: 0.25,
      connectNulls: true,
      lineStyle: {
        color: props.accentColor,
        width: 2.5,
      },
      itemStyle: { color: props.accentColor },
      emphasis: { disabled: true },
    },
  ],
}));
</script>

<style scoped>
.price-chart {
  width: 100%;
  height: 220px;
}

@media (min-width: 768px) {
  .price-chart {
    height: 240px;
  }
}
</style>
