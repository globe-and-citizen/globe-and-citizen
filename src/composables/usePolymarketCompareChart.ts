import {
  computed,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";
import type { ScatterSeries } from "@/components/Charts/PriceScatterChart.vue";
import type { PolymarketLegState } from "@/composables/usePolymarketLeg";
import { useNotebookSave } from "@/composables/useNotebookSave";
import {
  downloadPolymarketCsv,
  normalizePolymarketCsvFilename,
} from "@/composables/usePolymarketExport";
import { usePolymarketSeriesFetch } from "@/composables/usePolymarketSeriesFetch";
import {
  assignPolymarketColumnTitles,
  createPolymarketColumnInput,
} from "@/lib/polymarketColumnTitles";
import { buildAlignedPolymarketCsv } from "@/lib/polymarketCsv";
import {
  formatIsoTodayUtc,
  isBeforeIsoDate,
  unixSecondsFromDateInput,
} from "@/lib/polymarketDates";
import { selectPolymarketOutcomes } from "@/lib/polymarketOutcomeSelection";
import { buildSafeCsvFilename } from "@/composables/jupyterLiteStorage";

export function usePolymarketCompareChart(options: {
  legs: Ref<PolymarketLegState[]>;
  hasMultipleMarkets: MaybeRefOrGetter<boolean>;
  openPreview: (title: string, series: ScatterSeries[]) => void;
  goToNotebooks: () => void;
}) {
  const compareFromDate = ref("");
  const compareToDate = ref("");
  const compareFrequency = ref("daily");
  const compareChartData = ref<ScatterSeries[]>([]);
  const compareChartLoading = ref(false);
  const compareChartError = ref<string | null>(null);
  const compareFilenameDialogOpen = ref(false);
  const compareFilenameInput = ref("");
  const compareFilenameError = ref<string | null>(null);
  const notebook = useNotebookSave();
  const { fetchSeries } = usePolymarketSeriesFetch();
  const hasInsightsChartActions = computed(() => options.legs.value.length > 0);
  const compareMinDate = computed(() => {
    if (!hasInsightsChartActions.value) return "";
    return (
      options.legs.value
        .map((leg) => leg.minDate.trim())
        .filter(Boolean)
        .sort()[0] ?? ""
    );
  });
  const compareCanGoToNotebooks = computed(
    () => notebook.successPath.value.trim().length > 0,
  );
  let generationPromise: Promise<boolean> | null = null;

  watch(
    compareMinDate,
    (minimum) => {
      if (!minimum) return;
      if (
        !compareFromDate.value ||
        isBeforeIsoDate(compareFromDate.value, minimum)
      ) {
        compareFromDate.value = minimum;
      }
      if (!compareToDate.value) compareToDate.value = formatIsoTodayUtc();
      if (isBeforeIsoDate(compareToDate.value, minimum)) {
        compareToDate.value = minimum;
      }
    },
    { immediate: true },
  );

  async function generateCombinedCompareData(): Promise<boolean> {
    compareChartError.value = null;
    compareChartData.value = [];
    notebook.error.value = null;
    notebook.successPath.value = "";
    if (!hasInsightsChartActions.value) return false;

    const fromTs = compareFromDate.value
      ? unixSecondsFromDateInput(compareFromDate.value, false)
      : 0;
    const toTs = compareToDate.value
      ? unixSecondsFromDateInput(compareToDate.value, true)
      : null;
    if (toTs !== null && fromTs && toTs < fromTs) {
      compareChartError.value = "To date must be after From date.";
      return false;
    }

    const inputs = options.legs.value.flatMap((leg) => {
      const market = leg.marketOptions.find(
        (item) => item.id === leg.selectedMarketId,
      );
      if (!market) return [];
      return selectPolymarketOutcomes(
        market,
        leg.insightsOutcomeSelection,
        leg.selectedOutcomeId.trim(),
        leg.selectedOutcomeName.trim(),
      ).map((outcome) => createPolymarketColumnInput(leg, market, outcome));
    });
    const requests = assignPolymarketColumnTitles(inputs);
    if (requests.length === 0) {
      compareChartError.value = "Load markets first (or check selections).";
      return false;
    }

    compareChartLoading.value = true;
    try {
      const result = await fetchSeries(requests, {
        fromTs,
        toTs,
        frequency: compareFrequency.value,
      });
      if (result.series.every((series) => series.data.length === 0)) {
        compareChartError.value =
          result.failedCount > 0
            ? "No data returned (some requests failed)."
            : "No data returned for the selected range.";
        return false;
      }
      compareChartData.value = result.series;
      if (result.failedCount > 0) {
        compareChartError.value = `Chart displayed, but ${result.failedCount} request(s) failed.`;
      }
      return true;
    } catch (cause) {
      console.error("Failed to load combined compare chart:", cause);
      compareChartError.value =
        cause instanceof Error ? cause.message : "Failed to load chart data.";
      return false;
    } finally {
      compareChartLoading.value = false;
    }
  }

  function ensureCombinedCompareData(): Promise<boolean> {
    if (generationPromise) return generationPromise;
    const pending = generateCombinedCompareData();
    generationPromise = pending;
    void pending.finally(() => {
      if (generationPromise === pending) generationPromise = null;
    });
    return pending;
  }

  async function handlePreviewCombinedData() {
    if (!(await ensureCombinedCompareData())) return;
    options.openPreview(
      toValue(options.hasMultipleMarkets)
        ? "Comparison Price History"
        : "Price History",
      compareChartData.value,
    );
  }

  async function handleDownloadCombinedCompareCsv() {
    notebook.error.value = null;
    if (!(await ensureCombinedCompareData())) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const prefix = toValue(options.hasMultipleMarkets)
      ? "polymarket-combined-compare"
      : "polymarket-market-chart";
    downloadPolymarketCsv(
      `${prefix}_${stamp}.csv`,
      buildAlignedPolymarketCsv(compareChartData.value),
    );
  }

  function defaultCombinedCompareNotebookFilename(): string {
    const prefix = toValue(options.hasMultipleMarkets)
      ? "polymarket-compare"
      : "polymarket-chart";
    return buildSafeCsvFilename(
      `${prefix}-${new Date().toISOString().slice(0, 10)}`,
    );
  }

  async function handleCombinedCompareNotebookAction() {
    if (!(await ensureCombinedCompareData())) return;
    compareFilenameError.value = null;
    compareFilenameInput.value = defaultCombinedCompareNotebookFilename();
    compareFilenameDialogOpen.value = true;
  }

  async function handleCompareFilenamePrimaryAction() {
    if (compareCanGoToNotebooks.value) {
      options.goToNotebooks();
      return;
    }
    compareFilenameError.value = null;
    let filename: string;
    try {
      filename = normalizePolymarketCsvFilename(
        compareFilenameInput.value,
        defaultCombinedCompareNotebookFilename(),
      );
    } catch (cause) {
      compareFilenameError.value =
        cause instanceof Error ? cause.message : "Invalid filename.";
      return;
    }
    await notebook.save(
      `data/${filename}`,
      buildAlignedPolymarketCsv(compareChartData.value),
      "text/csv",
    );
  }

  function reset() {
    compareFromDate.value = "";
    compareToDate.value = "";
    compareFrequency.value = "daily";
    compareChartData.value = [];
    compareChartLoading.value = false;
    compareChartError.value = null;
    compareFilenameDialogOpen.value = false;
    compareFilenameInput.value = "";
    compareFilenameError.value = null;
    generationPromise = null;
    notebook.reset();
  }

  return {
    compareFromDate,
    compareToDate,
    compareFrequency,
    compareChartData,
    compareChartLoading,
    compareChartError,
    compareMinDate,
    compareFilenameDialogOpen,
    compareFilenameInput,
    compareFilenameError,
    compareSaveLoading: notebook.loading,
    compareSaveError: notebook.error,
    compareSaveSuccessPath: notebook.successPath,
    compareCanGoToNotebooks,
    hasInsightsChartActions,
    defaultCombinedCompareNotebookFilename,
    handlePreviewCombinedData,
    handleDownloadCombinedCompareCsv,
    handleCombinedCompareNotebookAction,
    handleCompareFilenamePrimaryAction,
    reset,
  };
}
