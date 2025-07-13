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

watchEffect(() => {
  if (!props.post) return;

  const totalLikes = props.post.likes || 0;
  const totalDislikes = props.post.dislikes || 0;

  option.value = {
    title: {
      text: `${totalLikes} Likes & ${totalDislikes} Dislikes`,
      left: "center",
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
        color: "#48982a",
      },
      {
        name: "Dislikes",
        type: "bar",
        data: [totalDislikes],
        color: "#ea3423",
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
