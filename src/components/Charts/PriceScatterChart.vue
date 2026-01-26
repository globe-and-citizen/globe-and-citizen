<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed } from "vue";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  ScatterChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
]);

export interface PriceDataPoint {
  timestamp: number; // Unix timestamp in seconds
  price: number;
}

export interface ScatterSeries {
  name: string;
  data: PriceDataPoint[];
  color?: string;
}

interface Props {
  series: ScatterSeries[];
  title?: string;
  showLegend?: boolean;
  height?: string;
  xAxisName?: string;
  yAxisName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Market Price History",
  showLegend: true,
  height: "400px",
  xAxisName: "Timestamp",
  yAxisName: "Price",
});

const isMobile = window.innerWidth < 640;

const option = computed(() => {
  const showLegend = props.showLegend && props.series.length > 1;

  // Layout tuning (px) so legend + zoom never get clipped.
  const legendBottomPadding = isMobile ? 8 : 10;
  const legendApproxHeight = showLegend ? (isMobile ? 52 : 40) : 0;
  const zoomHeight = 20;
  const zoomGap = isMobile ? 8 : 10;

  const truncateLegendLabel = (label: string) => {
    const maxChars = isMobile ? 14 : 22;
    if (!label) return "";
    return label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;
  };

  const seriesConfig = props.series.map((s) => {
    // Convert timestamp + price to [timestamp, price] format for scatter
    const scatterData = s.data.map((pt) => [pt.timestamp * 1000, pt.price]);

    return {
      name: s.name,
      type: "scatter",
      data: scatterData,
      symbolSize: isMobile ? 6 : 8,
      itemStyle: {
        color: s.color || undefined,
      },
      emphasis: {
        itemStyle: {
          borderColor: "#333",
          borderWidth: 1,
        },
      },
    };
  });

  return {
    title: {
      text: props.title,
      left: "center",
      top: "2%",
      textStyle: {
        fontSize: isMobile ? 14 : 18,
        fontWeight: "600",
        color: "rgba(14, 12, 12, 0.8)",
        fontFamily: "Lato",
        overflow: "break",
        width: isMobile ? 280 : 600,
      },
    },
    tooltip: {
      trigger: "item",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const date = new Date(params.value[0]);
        const dateStr = date.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const price = params.value[1].toFixed(4);
        return `${params.seriesName}<br/>${dateStr}<br/>Price: ${price}`;
      },
    },
    legend: {
      show: showLegend,
      type: "scroll",
      left: "center",
      width: "92%",
      bottom: legendBottomPadding,
      itemGap: isMobile ? 10 : 16,
      data: props.series.map((s) => s.name),
      formatter: truncateLegendLabel,
      tooltip: {
        show: true,
      },
      textStyle: {
        fontSize: isMobile ? 10 : 12,
      },
    },
    grid: {
      left: isMobile ? "12%" : "10%",
      right: isMobile ? "8%" : "10%",
      bottom:
        zoomHeight +
        zoomGap +
        legendApproxHeight +
        legendBottomPadding +
        zoomGap,
      top: isMobile ? "20%" : "18%",
      containLabel: true,
    },
    xAxis: {
      type: "time",
      name: props.xAxisName,
      nameLocation: "middle",
      nameGap: 30,
      axisLabel: {
        fontSize: isMobile ? 10 : 12,
        formatter: (value: number) => {
          const date = new Date(value);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        },
      },
    },
    yAxis: {
      type: "value",
      name: props.yAxisName,
      nameLocation: "middle",
      nameGap: isMobile ? 40 : 50,
      min: 0,
      max: 1,
      axisLabel: {
        fontSize: isMobile ? 10 : 12,
        formatter: (value: number) => value.toFixed(2),
      },
    },
    dataZoom: [
      {
        type: "slider",
        show: true,
        xAxisIndex: [0],
        start: 0,
        end: 100,
        height: 20,
        bottom: legendApproxHeight + legendBottomPadding + zoomGap,
      },
      {
        type: "inside",
        xAxisIndex: [0],
        start: 0,
        end: 100,
      },
    ],
    series: seriesConfig,
  };
});
</script>

<style scoped>
.chart {
  height: v-bind(height);
  width: 100%;
}
</style>
