import { getPolymarketPricesHistory } from "@/api/polymarket";
import type { ScatterSeries } from "@/components/Charts/PriceScatterChart.vue";
import type { PolymarketSeriesRequest } from "@/lib/polymarketColumnTitles";
import {
  downsamplePolymarketHistory,
  normalizeExportFrequency,
} from "@/lib/polymarketDates";

export type PolymarketSeriesFetchOptions = {
  fromTs: number;
  toTs: number | null;
  frequency: string;
};

export function usePolymarketSeriesFetch() {
  async function fetchSeries(
    requests: PolymarketSeriesRequest[],
    options: PolymarketSeriesFetchOptions,
  ): Promise<{ series: ScatterSeries[]; failedCount: number }> {
    const results = await Promise.allSettled(
      requests.map(({ outcomeId }) =>
        getPolymarketPricesHistory({
          market: outcomeId,
          startTs: options.fromTs,
        }),
      ),
    );
    const frequency = normalizeExportFrequency(options.frequency);
    let failedCount = 0;

    const series = requests.map((request, index): ScatterSeries => {
      const result = results[index];
      if (!result || result.status === "rejected") {
        failedCount += 1;
        return { name: request.columnTitle, data: [] };
      }

      let history = Array.isArray(result.value.history)
        ? result.value.history
        : [];
      if (options.fromTs) {
        history = history.filter((point) => point.t >= options.fromTs);
      }
      if (options.toTs !== null) {
        history = history.filter((point) => point.t <= options.toTs!);
      }
      history = downsamplePolymarketHistory(history, frequency);

      return {
        name: request.columnTitle,
        data: history.map((point) => ({
          timestamp: point.t,
          price: point.p,
        })),
      };
    });

    return { series, failedCount };
  }

  return { fetchSeries };
}
