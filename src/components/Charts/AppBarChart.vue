<template>
  <v-chart class="chart" :option="option" autoresize />
</template>

<script setup lang="ts">
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ref, watchEffect } from "vue";
import VChart from "vue-echarts";
import type { Post } from "@/models/Posts";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
]);

const props = defineProps<{ post: Post }>();

const option = ref({});
const isMobile = window.innerWidth < 640;

watchEffect(() => {
  if (!props.post) return;

  const totalLikes = props.post.likes || 0;
  const totalDislikes = props.post.dislikes || 0;

  option.value = {
    title: {
      text: `${totalLikes} opinion likes & ${totalDislikes} opinion dislikes`,
      left: "center",
      textStyle: {
        fontSize: isMobile ? 14 : 20,
        fontWeight: "600",
        color: "rgba(14, 12, 12, 0.8)",
        fontFamily: "Lato",
      },
    },
    tooltip: { trigger: "axis" },
    legend: { data: ["Likes", "Dislikes"], bottom: "1%" },
    xAxis: {
      type: "category",
      data: ["Post Reactions"],
    },
    yAxis: { type: "value" },
    series: [
      {
        name: "Likes",
        type: "bar",
        data: [totalLikes],
        color: "#0b831e",
      },
      {
        name: "Dislikes",
        type: "bar",
        data: [totalDislikes],
        color: "#9d0c1a",
      },
    ],
  };
});
</script>

<style scoped>
.chart {
  height: 40vh;
}
</style>
