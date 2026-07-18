import { computed, type Ref } from "vue";
import type { ScatterSeries } from "@/components/Charts/PriceScatterChart.vue";
import type { PolymarketLegState } from "@/composables/usePolymarketLeg";
import { useNotebookSave } from "@/composables/useNotebookSave";
import {
  createPolymarketGenerationGuard,
  downloadPolymarketCsv,
} from "@/composables/usePolymarketExport";
import { usePolymarketSeriesFetch } from "@/composables/usePolymarketSeriesFetch";
import { buildSafeCsvFilename } from "@/composables/jupyterLiteStorage";
import { buildAlignedPolymarketCsv } from "@/lib/polymarketCsv";
import { unixSecondsFromDateInput } from "@/lib/polymarketDates";
import { buildPolymarketLegRequests } from "@/lib/polymarketLegRequests";
import { polymarketOutcomeSelectionLabel } from "@/lib/polymarketOutcomeSelection";

type LegSeriesResult = {
  series: ScatterSeries[];
  failedCount: number;
  skippedCount: number;
};

export function usePolymarketSingleMarketExport(options: {
  activeLeg: Ref<PolymarketLegState | null>;
  openPreview: (title: string, series: ScatterSeries[]) => void;
}) {
  let notebooks = new WeakMap<PolymarketLegState, NotebookSave>();
  let emptyNotebook = useNotebookSave();
  const { fetchSeries } = usePolymarketSeriesFetch();
  const guardGeneration =
    createPolymarketGenerationGuard<PolymarketLegState>();
  const activeNotebook = computed(() =>
    options.activeLeg.value
      ? notebookFor(options.activeLeg.value)
      : emptyNotebook,
  );
  const singleMarketSaveLoading = computed(
    () => activeNotebook.value.loading.value,
  );
  const singleMarketSaveError = computed(
    () => activeNotebook.value.error.value,
  );
  const singleMarketSaveSuccessPath = computed(
    () => activeNotebook.value.successPath.value,
  );

  function notebookFor(leg: PolymarketLegState): NotebookSave {
    const existing = notebooks.get(leg);
    if (existing) return existing;
    const notebook = useNotebookSave();
    notebooks.set(leg, notebook);
    return notebook;
  }

  function validateLeg(leg: PolymarketLegState): string | null {
    if (leg.marketOptions.length === 0) {
      return "Load a Polymarket URL first to get markets.";
    }
    if (selectedMarketIds(leg).length === 0) {
      return "Select at least one market (or Select All).";
    }
    const fromTs = leg.exportFromDate
      ? unixSecondsFromDateInput(leg.exportFromDate, false)
      : 0;
    const toTs = leg.exportToDate
      ? unixSecondsFromDateInput(leg.exportToDate, true)
      : null;
    return toTs !== null && fromTs && toTs < fromTs
      ? "To date must be after From date."
      : null;
  }

  async function fetchLegSeries(
    leg: PolymarketLegState,
  ): Promise<LegSeriesResult> {
    const marketIds = selectedMarketIds(leg);
    const { requests, skippedCount } = buildPolymarketLegRequests(
      leg,
      marketIds,
    );
    const fromTs = leg.exportFromDate
      ? unixSecondsFromDateInput(leg.exportFromDate, false)
      : 0;
    const toTs = leg.exportToDate
      ? unixSecondsFromDateInput(leg.exportToDate, true)
      : null;
    const result = await fetchSeries(requests, {
      fromTs,
      toTs,
      frequency: leg.exportFrequency,
    });
    return { ...result, skippedCount };
  }

  async function handleDownloadExport(leg: PolymarketLegState) {
    if (leg.exportLoading) return;
    leg.exportError = validateLeg(leg);
    if (leg.exportError) return;

    leg.exportLoading = true;
    try {
      const result = await fetchLegSeries(leg);
      if (result.series.every((series) => series.data.length === 0)) {
        leg.exportError = emptySeriesError(result.failedCount);
        return;
      }
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      downloadPolymarketCsv(
        `polymarket-price-history_${stamp}.csv`,
        buildAlignedPolymarketCsv(result.series),
      );
      leg.exportError = partialResultMessage(
        "Downloaded CSV, but",
        leg,
        result,
      );
    } catch (cause) {
      console.error("Failed to export price history:", cause);
      leg.exportError =
        cause instanceof Error
          ? cause.message
          : "Failed to export price history.";
    } finally {
      leg.exportLoading = false;
    }
  }

  async function generateSingleMarketChartData(
    leg: PolymarketLegState,
  ): Promise<boolean> {
    const notebook = notebookFor(leg);
    leg.chartError = validateLeg(leg);
    leg.chartData = [];
    notebook.error.value = null;
    notebook.successPath.value = "";
    if (leg.chartError) return false;

    leg.chartLoading = true;
    try {
      const result = await fetchLegSeries(leg);
      if (result.series.every((series) => series.data.length === 0)) {
        leg.chartError = emptySeriesError(result.failedCount);
        return false;
      }
      leg.chartData = result.series;
      leg.chartError = partialResultMessage(
        "Chart displayed, but",
        leg,
        result,
      );
      return true;
    } catch (cause) {
      console.error("Failed to load chart data:", cause);
      leg.chartError =
        cause instanceof Error ? cause.message : "Failed to load chart data.";
      return false;
    } finally {
      leg.chartLoading = false;
    }
  }

  function ensureSingleMarketChartData(
    leg: PolymarketLegState,
  ): Promise<boolean> {
    return guardGeneration(leg, () => generateSingleMarketChartData(leg));
  }

  async function handlePreviewChart(leg: PolymarketLegState) {
    if (!(await ensureSingleMarketChartData(leg))) return;
    const marketTitle = leg.marketOptions.find(
      (market) => market.id === leg.selectedMarketId,
    )?.title;
    options.openPreview(
      `${marketTitle || leg.title || "Market"} - Price History`,
      leg.chartData,
    );
  }

  async function handleSendSingleMarketToJupyterLite(
    leg: PolymarketLegState,
  ) {
    const notebook = notebookFor(leg);
    if (notebook.loading.value) return;
    notebook.error.value = null;
    notebook.successPath.value = "";
    if (!(await ensureSingleMarketChartData(leg))) {
      notebook.error.value =
        leg.chartError || "Single-market data is unavailable. Try again.";
      return;
    }
    await notebook.save(
      `data/${defaultNotebookFilename(leg)}`,
      buildAlignedPolymarketCsv(leg.chartData),
      "text/csv",
    );
  }

  function reset() {
    notebooks = new WeakMap<PolymarketLegState, NotebookSave>();
    emptyNotebook = useNotebookSave();
  }

  return {
    singleMarketSaveLoading,
    singleMarketSaveError,
    singleMarketSaveSuccessPath,
    handleDownloadExport,
    handlePreviewChart,
    handleSendSingleMarketToJupyterLite,
    reset,
  };
}

type NotebookSave = ReturnType<typeof useNotebookSave>;

function selectedMarketIds(leg: PolymarketLegState): string[] {
  return leg.exportSelectedMarkets.length > 0
    ? leg.exportSelectedMarkets
    : leg.marketOptions.map((market) => market.id);
}

function emptySeriesError(failedCount: number): string {
  return failedCount > 0
    ? "No data returned (some requests failed)."
    : "No data returned for the selected range.";
}

function partialResultMessage(
  prefix: string,
  leg: PolymarketLegState,
  result: Pick<LegSeriesResult, "failedCount" | "skippedCount">,
): string | null {
  const parts: string[] = [];
  if (result.failedCount > 0) {
    parts.push(`${result.failedCount} request(s) failed`);
  }
  if (result.skippedCount > 0) {
    parts.push(
      `${result.skippedCount} market(s) skipped (no outcomes for ${polymarketOutcomeSelectionLabel(
        leg.insightsOutcomeSelection,
      )})`,
    );
  }
  return parts.length > 0 ? `${prefix} ${parts.join("; ")}.` : null;
}

function defaultNotebookFilename(leg: PolymarketLegState): string {
  const marketTitle = leg.marketOptions.find(
    (market) => market.id === leg.selectedMarketId,
  )?.title;
  const label = marketTitle || leg.title || "polymarket-market";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return buildSafeCsvFilename(`${label}-${stamp}`);
}
