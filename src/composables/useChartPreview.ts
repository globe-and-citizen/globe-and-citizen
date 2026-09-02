import { ref } from "vue";
import type { ScatterSeries } from "@/components/Charts/PriceScatterChart.vue";

export function useChartPreview() {
  const dialogOpen = ref(false);
  const title = ref("Generated Chart");
  const series = ref<ScatterSeries[]>([]);

  function open(nextTitle: string, nextSeries: ScatterSeries[]) {
    if (nextSeries.length === 0) return;
    title.value = nextTitle;
    series.value = nextSeries.map((item) => ({
      ...item,
      data: [...item.data],
    }));
    dialogOpen.value = true;
  }

  function reset() {
    dialogOpen.value = false;
    title.value = "Generated Chart";
    series.value = [];
  }

  return { dialogOpen, title, series, open, reset };
}
