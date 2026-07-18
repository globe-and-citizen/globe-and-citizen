<template>
  <div v-if="embedded" class="grid gap-6">
    <div class="grid gap-6 py-1">
      <PolymarketMarketInsightsWorkspace
        v-model:compare-from-date="compareFromDate"
        v-model:compare-to-date="compareToDate"
        v-model:compare-frequency="compareFrequency"
        v-model:compare-filename-dialog-open="compareFilenameDialogOpen"
        v-model:compare-filename-input="compareFilenameInput"
        v-model:quick-add-market-url="quickAddMarketUrl"
        v-model:market-search-dialog-open="marketSearchDialogOpen"
        v-model:market-search-query="marketSearchQuery"
        :has-insights-chart-actions="hasInsightsChartActions"
        :insights-chart-panel-title="insightsChartPanelTitle"
        :compare-min-date="compareMinDate"
        :compare-save-loading="compareSaveLoading"
        :compare-filename-error="compareFilenameError"
        :compare-can-go-to-notebooks="compareCanGoToNotebooks"
        :compare-chart-error="compareChartError"
        :compare-save-error="compareSaveError"
        :compare-save-success-path="compareSaveSuccessPath"
        :single-market-save-error="singleMarketSaveError"
        :single-market-save-success-path="singleMarketSaveSuccessPath"
        :legs="legs"
        :active-leg-index="activeLegIndex"
        :active-leg="activeLeg"
        :active-leg-loading="activeLeg?.loading ?? false"
        :can-quick-add-market="canQuickAddMarket"
        :can-add-more-insights-markets="canAddMoreInsightsMarkets"
        :market-search-loading="marketSearchLoading"
        :market-search-loading-more="marketSearchLoadingMore"
        :market-search-error="marketSearchError"
        :market-search-pagination="marketSearchPagination"
        :search-event-results="searchEventResults"
        :default-combined-compare-notebook-filename="
          defaultCombinedCompareNotebookFilename
        "
        :handle-preview-combined-data="handlePreviewCombinedData"
        :handle-download-combined-compare-csv="handleDownloadCombinedCompareCsv"
        :handle-combined-compare-notebook-action="
          handleCombinedCompareNotebookAction
        "
        :handle-compare-filename-primary-action="
          handleCompareFilenamePrimaryAction
        "
        :open-market-search-dialog="openMarketSearchDialog"
        :close-market-search-dialog="closeMarketSearchDialog"
        :handle-quick-add-market="handleQuickAddMarket"
        :select-leg="selectLeg"
        :leg-display-title="legDisplayTitle"
        :leg-status-text="legStatusText"
        :can-remove-leg="canRemoveLeg"
        :remove-leg="removeLeg"
        :set-leg-field="setLegField"
        :on-insights-outcome-selection-change="onInsightsOutcomeSelectionChange"
        :export-select-all-state="exportSelectAllState"
        :toggle-all-export-markets="toggleAllExportMarkets"
        :toggle-export-market="toggleExportMarket"
        :handle-preview-chart="handlePreviewChart"
        :handle-download-export="handleDownloadExport"
        :handle-send-single-market-to-jupyter-lite="
          handleSendSingleMarketToJupyterLite
        "
        :run-market-search="runMarketSearch"
        :handle-search-image-error="handleSearchImageError"
        :is-search-event-selected="isSearchEventSelected"
        :to-polymarket-event-url="toPolymarketEventUrl"
        :handle-remove-search-event="handleRemoveSearchEvent"
        :handle-assign-search-event="handleAssignSearchEvent"
        :load-more-market-search-results="loadMoreMarketSearchResults"
      />

    </div>
  </div>

  <Dialog
    v-else
    :open="isOpen"
    @update:open="(open: boolean) => !open && emit('close')"
  >
    <DialogContent
      class="w-[90vw] max-w-[1750px] max-h-[85vh] overflow-y-auto border-0"
    >
      <DialogHeader>
        <DialogTitle>Polymarket Market Insights</DialogTitle>
        <DialogDescription>
          Export data and generate charts for one or more markets.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <PolymarketMarketInsightsWorkspace
          v-model:compare-from-date="compareFromDate"
          v-model:compare-to-date="compareToDate"
          v-model:compare-frequency="compareFrequency"
          v-model:compare-filename-dialog-open="compareFilenameDialogOpen"
          v-model:compare-filename-input="compareFilenameInput"
          v-model:quick-add-market-url="quickAddMarketUrl"
          v-model:market-search-dialog-open="marketSearchDialogOpen"
          v-model:market-search-query="marketSearchQuery"
          :has-insights-chart-actions="hasInsightsChartActions"
          :insights-chart-panel-title="insightsChartPanelTitle"
          :compare-min-date="compareMinDate"
          :compare-save-loading="compareSaveLoading"
          :compare-filename-error="compareFilenameError"
          :compare-can-go-to-notebooks="compareCanGoToNotebooks"
          :compare-chart-error="compareChartError"
          :compare-save-error="compareSaveError"
          :compare-save-success-path="compareSaveSuccessPath"
          :single-market-save-error="singleMarketSaveError"
          :single-market-save-success-path="singleMarketSaveSuccessPath"
          :legs="legs"
          :active-leg-index="activeLegIndex"
          :active-leg="activeLeg"
          :active-leg-loading="activeLeg?.loading ?? false"
          :can-quick-add-market="canQuickAddMarket"
          :can-add-more-insights-markets="canAddMoreInsightsMarkets"
          :market-search-loading="marketSearchLoading"
          :market-search-loading-more="marketSearchLoadingMore"
          :market-search-error="marketSearchError"
          :market-search-pagination="marketSearchPagination"
          :search-event-results="searchEventResults"
          :default-combined-compare-notebook-filename="
            defaultCombinedCompareNotebookFilename
          "
          :handle-preview-combined-data="handlePreviewCombinedData"
          :handle-download-combined-compare-csv="
            handleDownloadCombinedCompareCsv
          "
          :handle-combined-compare-notebook-action="
            handleCombinedCompareNotebookAction
          "
          :handle-compare-filename-primary-action="
            handleCompareFilenamePrimaryAction
          "
          :open-market-search-dialog="openMarketSearchDialog"
          :close-market-search-dialog="closeMarketSearchDialog"
          :handle-quick-add-market="handleQuickAddMarket"
          :select-leg="selectLeg"
          :leg-display-title="legDisplayTitle"
          :leg-status-text="legStatusText"
          :can-remove-leg="canRemoveLeg"
          :remove-leg="removeLeg"
          :set-leg-field="setLegField"
          :on-insights-outcome-selection-change="
            onInsightsOutcomeSelectionChange
          "
          :export-select-all-state="exportSelectAllState"
          :toggle-all-export-markets="toggleAllExportMarkets"
          :toggle-export-market="toggleExportMarket"
          :handle-preview-chart="handlePreviewChart"
          :handle-download-export="handleDownloadExport"
          :handle-send-single-market-to-jupyter-lite="
            handleSendSingleMarketToJupyterLite
          "
          :run-market-search="runMarketSearch"
          :handle-search-image-error="handleSearchImageError"
          :is-search-event-selected="isSearchEventSelected"
          :to-polymarket-event-url="toPolymarketEventUrl"
          :handle-remove-search-event="handleRemoveSearchEvent"
          :handle-assign-search-event="handleAssignSearchEvent"
          :load-more-market-search-results="loadMoreMarketSearchResults"
        />

      </div>

      <DialogFooter class="flex-col-reverse sm:flex-row gap-2">
        <Button
          variant="outline"
          @click="emit('close')"
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="chartPreviewDialogOpen">
    <DialogContent
      class="w-[92vw] max-w-[1200px] max-h-[85vh] overflow-hidden flex flex-col"
    >
      <DialogHeader>
        <DialogTitle>{{ chartPreviewTitle }}</DialogTitle>
        <DialogDescription>
          Review the generated chart in a larger preview.
        </DialogDescription>
      </DialogHeader>

      <div class="min-h-0 overflow-auto">
        <PriceScatterChart
          v-if="chartPreviewSeries.length > 0"
          :series="chartPreviewSeries"
          :title="chartPreviewTitle"
          x-axis-name="Date"
          y-axis-name="Value"
          height="560px"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getPolymarketPricesHistory,
  type PolymarketGammaSearchEvent,
} from "@/api/polymarket";
import PriceScatterChart, {
  type ScatterSeries,
  type PriceDataPoint,
} from "@/components/Charts/PriceScatterChart.vue";
import PolymarketMarketInsightsWorkspace from "@/components/PolymarketMarketInsightsWorkspace.vue";
import { buildAlignedPolymarketCsv } from "@/lib/polymarketCsv";
import {
  buildSafeCsvFilename,
  queueTextFileForNotebooks,
  syncQueuedNotebookFilesToJupyterLite,
} from "@/composables/jupyterLiteStorage";
import {
  usePolymarketLeg,
  type PolymarketLegState,
} from "@/composables/usePolymarketLeg";
import {
  toPolymarketEventUrl,
  usePolymarketMarketSearch,
} from "@/composables/usePolymarketMarketSearch";
import {
  createPolymarketGenerationGuard,
  downloadPolymarketCsv as downloadCsv,
  normalizePolymarketCsvFilename as normalizeCsvFilename,
} from "@/composables/usePolymarketExport";
import {
  downsamplePolymarketHistory as downsampleHistory,
  formatIsoTodayUtc,
  isBeforeIsoDate,
  normalizeExportFrequency,
  unixSecondsFromDateInput,
} from "@/lib/polymarketDates";
import {
  polymarketOutcomeSelectionLabel as searchOutcomeSelectionLabel,
  selectPolymarketOutcomes,
  type PolymarketMarketOption,
  type PolymarketOutcomeOption,
  type PolymarketOutcomeSelection,
} from "@/lib/polymarketOutcomeSelection";

type OutcomeOption = PolymarketOutcomeOption;
type MarketOption = PolymarketMarketOption;

type CompareMarketInput = {
  marketUrl: string;
  marketId: string;
  label?: string;
};

type SearchOutcomeSelection = PolymarketOutcomeSelection;


type LegState = PolymarketLegState;

type MutableLegField =
  | "marketUrl"
  | "selectedMarketId"
  | "selectedOutcomeId"
  | "insightsOutcomeSelection"
  | "exportFromDate"
  | "exportToDate"
  | "exportFrequency";

const MAX_COMPARE_INSIGHTS_MARKETS = 10;

interface Props {
  isOpen: boolean;
  embedded?: boolean;
  initialMarketUrl?: string;
  initialSelectedMarketIds?: string[];
  initialCompareMarkets?: CompareMarketInput[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
}>();

const router = useRouter();
const {
  createEmptyLeg: createEmptyPolymarketLeg,
  loadLeg: loadPolymarketLeg,
} = usePolymarketLeg();

const embedded = computed(() => props.embedded === true);

const hasInitialCompareInsightsSelection = computed(
  () => (props.initialCompareMarkets?.length ?? 0) > 0,
);
const hasInsightsChartActions = computed(() => legs.value.length > 0);
const hasMultipleMarkets = computed(() => {
  return legs.value.length > 1 || hasInitialCompareInsightsSelection.value;
});
const insightsChartPanelTitle = computed(() =>
  hasMultipleMarkets.value
    ? "Combined Comparison Chart"
    : "Chart and Notebook Export",
);

const compareFromDate = ref<string>("");
const compareToDate = ref<string>("");
const compareFrequency = ref<string>("daily");
const compareChartData = ref<ScatterSeries[]>([]);
const compareChartLoading = ref<boolean>(false);
const compareChartError = ref<string | null>(null);

const compareSaveLoading = ref<boolean>(false);
const compareSaveError = ref<string | null>(null);
const compareSaveSuccessPath = ref<string>("");
const singleMarketSaveLoading = ref(false);
const singleMarketSaveError = ref<string | null>(null);
const singleMarketSaveSuccessPath = ref("");

const compareFilenameDialogOpen = ref<boolean>(false);
const compareFilenameInput = ref<string>("");
const compareFilenameError = ref<string | null>(null);
const chartPreviewDialogOpen = ref(false);
const chartPreviewTitle = ref("Generated Chart");
const chartPreviewSeries = ref<ScatterSeries[]>([]);
const activeLegIndex = ref<number>(0);
const quickAddMarketUrl = ref<string>("");

const {
  dialogOpen: marketSearchDialogOpen,
  query: marketSearchQuery,
  loading: marketSearchLoading,
  loadingMore: marketSearchLoadingMore,
  error: marketSearchError,
  pagination: marketSearchPagination,
  results: searchEventResults,
  openDialog: openMarketSearchDialog,
  closeDialog: closeMarketSearchDialog,
  reset: resetMarketSearch,
  runSearch: runMarketSearch,
  loadMore: loadMoreMarketSearchResults,
  handleImageError: handleSearchImageError,
} = usePolymarketMarketSearch();

const compareCanGoToNotebooks = computed(
  () => compareSaveSuccessPath.value.trim().length > 0,
);

const activeLeg = computed(() => legs.value[activeLegIndex.value] ?? null);
const canAddMoreInsightsMarkets = computed(
  () => legs.value.length < MAX_COMPARE_INSIGHTS_MARKETS,
);
const canQuickAddMarket = computed(() => {
  const url = quickAddMarketUrl.value.trim();
  if (!url) return false;
  return canAddMoreInsightsMarkets.value;
});

function createEmptyLeg(): LegState {
  return createEmptyPolymarketLeg();
}

function normalizeCompareInputs(): CompareMarketInput[] {
  const raw = Array.isArray(props.initialCompareMarkets)
    ? props.initialCompareMarkets
    : [];
  return raw
    .map((m) => ({
      marketUrl: String(m?.marketUrl ?? "").trim(),
      marketId: String(m?.marketId ?? "").trim(),
      label: String(m?.label ?? "").trim() || undefined,
    }))
    .filter((m) => Boolean(m.marketUrl) && Boolean(m.marketId))
    .slice(0, MAX_COMPARE_INSIGHTS_MARKETS);
}


function legDisplayTitle(leg: LegState, index: number): string {
  const explicit = (leg.compareLabel ?? "").trim();
  if (explicit) return explicit;
  if ((leg.title ?? "").trim()) {
    return leg.title.trim();
  }
  const market = leg.marketOptions.find(
    (item) => item.id === leg.selectedMarketId,
  );
  if (market?.title?.trim()) return market.title.trim();
  if ((leg.title ?? "").trim()) return leg.title.trim();
  if ((leg.marketUrl ?? "").trim()) return leg.marketUrl.trim();
  return `Leg ${index + 1}`;
}

function legStatusText(leg: LegState): string {
  if (leg.loading) return "Loading market data";
  if (leg.error) return leg.error;
  if (!leg.marketUrl.trim()) return "No market selected";
  if (!leg.selectedMarketId) return "Choose a market";
  if (!leg.selectedOutcomeId) return "Choose an outcome";
  return `Outcome: ${searchOutcomeSelectionLabel(
    leg.insightsOutcomeSelection,
  )}`;
}

function selectLeg(index: number) {
  if (index < 0 || index >= legs.value.length) return;
  activeLegIndex.value = index;
}

function createInsightsLeg(url = ""): LegState {
  const leg = createEmptyLeg();
  leg.marketUrl = url;
  leg.showChart = true;
  return leg;
}

function appendInsightsLeg(url = ""): number {
  const nextIndex = legs.value.length;
  legs.value.push(createInsightsLeg(url));
  activeLegIndex.value = nextIndex;
  return nextIndex;
}

function canRemoveLeg(index: number): boolean {
  return index >= 0 && index < legs.value.length;
}

function removeLeg(index: number) {
  if (!canRemoveLeg(index)) return;
  legs.value.splice(index, 1);
  if (legs.value.length === 0) {
    activeLegIndex.value = 0;
    return;
  }
  if (activeLegIndex.value >= legs.value.length) {
    activeLegIndex.value = legs.value.length - 1;
  }
}

function setLegField(index: number, field: MutableLegField, value: string) {
  const leg = legs.value[index];
  if (!leg) return;

  if (field === "insightsOutcomeSelection") {
    leg.insightsOutcomeSelection =
      value === "no" || value === "both" ? value : "yes";
    return;
  }

  leg[field] = value;
}

async function handleAssignSearchEvent(event: PolymarketGammaSearchEvent) {
  if (!canAddMoreInsightsMarkets.value) return;
  if (isSearchEventSelected(event)) return;

  const eventUrl = toPolymarketEventUrl(event);
  const targetIndex = appendInsightsLeg(eventUrl);
  const leg = legs.value[targetIndex];
  if (!leg) return;

  leg.compareLabel = (event.title ?? "Event").trim() || "Event";
  quickAddMarketUrl.value = eventUrl;

  await loadLeg(targetIndex);
}

async function handleQuickAddMarket() {
  const url = quickAddMarketUrl.value.trim();
  if (!url) return;

  if (!canAddMoreInsightsMarkets.value) return;
  const index = appendInsightsLeg(url);
  quickAddMarketUrl.value = "";
  await loadLeg(index);
}


function findInsightsLegIndexForEvent(event: PolymarketGammaSearchEvent) {
  const eventUrl = toPolymarketEventUrl(event);
  return legs.value.findIndex((leg) => leg.marketUrl.trim() === eventUrl);
}

function isSearchEventSelected(event: PolymarketGammaSearchEvent) {
  return findInsightsLegIndexForEvent(event) !== -1;
}

function handleRemoveSearchEvent(event: PolymarketGammaSearchEvent) {
  const legIndex = findInsightsLegIndexForEvent(event);
  if (legIndex === -1) return;
  removeLeg(legIndex);
}

function openChartPreview(title: string, series: ScatterSeries[]) {
  if (series.length === 0) return;
  chartPreviewTitle.value = title;
  chartPreviewSeries.value = series.map((item) => ({
    ...item,
    data: [...item.data],
  }));
  chartPreviewDialogOpen.value = true;
}

function openLegChartPreview(leg: LegState) {
  const marketTitle = leg.marketOptions.find(
    (item) => item.id === leg.selectedMarketId,
  )?.title;
  openChartPreview(
    `${marketTitle || leg.title || "Market"} - Price History`,
    leg.chartData,
  );
}

function openCombinedCompareChartPreview() {
  openChartPreview(
    hasMultipleMarkets.value ? "Comparison Price History" : "Price History",
    compareChartData.value,
  );
}

async function loadCompareLegs() {
  const items = normalizeCompareInputs();
  if (items.length === 0) return;

  // Build one leg per selected market.
  legs.value = items.map((item) => {
    const leg = createEmptyLeg();
    leg.marketUrl = item.marketUrl;
    leg.compareLabel = item.label;
    // Preselect the market so loadLeg() preserves it and picks outcomes.
    leg.selectedMarketId = item.marketId;
    // Preselect the checkbox in chart/export panels.
    leg.exportSelectedMarkets = [item.marketId];
    // Default compare insights to the chart tab.
    leg.showChart = true;
    leg.showExport = false;
    return leg;
  });

  // Fire-and-forget loads; each leg handles its own errors.
  void Promise.allSettled(legs.value.map((_, idx) => loadLeg(idx)));
}

const legs = ref<LegState[]>([]);

const compareMinDate = computed(() => {
  if (!hasInsightsChartActions.value) return "";
  const dates = legs.value
    .map((l) => (l.minDate ?? "").trim())
    .filter(Boolean)
    .sort();
  return dates[0] ?? "";
});

watch(
  () => compareMinDate.value,
  (min) => {
    if (!hasInsightsChartActions.value) return;
    if (!min) return;
    if (!compareFromDate.value || isBeforeIsoDate(compareFromDate.value, min)) {
      compareFromDate.value = min;
    }
    if (!compareToDate.value) {
      compareToDate.value = formatIsoTodayUtc();
    }
    if (compareToDate.value && isBeforeIsoDate(compareToDate.value, min)) {
      compareToDate.value = min;
    }
  },
  { immediate: true },
);

watch(
  () => legs.value.length,
  (length) => {
    if (length === 0) {
      activeLegIndex.value = 0;
      return;
    }
    if (activeLegIndex.value >= length) {
      activeLegIndex.value = length - 1;
    }
  },
  { immediate: true },
);

type MarketColumnInput = {
  eventName: string;
  marketId: string;
  marketName: string;
  outcomeId: string;
  outcomeName: string;
};

function assignMarketColumnTitles<T extends MarketColumnInput>(
  items: T[],
): Array<T & { columnTitle: string }> {
  const baseTitles = items.map(
    (item) => `${item.eventName} - ${item.marketName}`,
  );
  const baseTitleCounts = new Map<string, number>();
  for (const title of baseTitles) {
    baseTitleCounts.set(title, (baseTitleCounts.get(title) ?? 0) + 1);
  }

  const candidates = items.map((item, index) => {
    const baseTitle =
      baseTitles[index] ?? `${item.eventName} - ${item.marketName}`;
    return baseTitleCounts.get(baseTitle) === 1
      ? baseTitle
      : `${baseTitle} (${item.outcomeName})`;
  });
  const candidateCounts = new Map<string, number>();
  for (const candidate of candidates) {
    candidateCounts.set(candidate, (candidateCounts.get(candidate) ?? 0) + 1);
  }

  const preliminaryTitles = items.map((item, index) => {
    const candidate =
      candidates[index] ?? `${item.eventName} - ${item.marketName}`;
    return {
      item,
      title:
        candidateCounts.get(candidate) === 1
          ? candidate
          : `${candidate} [${item.marketId}]`,
    };
  });
  const preliminaryCounts = new Map<string, number>();
  for (const entry of preliminaryTitles) {
    preliminaryCounts.set(
      entry.title,
      (preliminaryCounts.get(entry.title) ?? 0) + 1,
    );
  }

  const seenTitles = new Map<string, number>();
  return preliminaryTitles.map(({ item, title }) => {
    const occurrence = (seenTitles.get(title) ?? 0) + 1;
    seenTitles.set(title, occurrence);
    const columnTitle =
      preliminaryCounts.get(title) === 1 ? title : `${title} #${occurrence}`;
    return { ...item, columnTitle };
  });
}

function eventNameForLeg(leg: LegState): string {
  return (
    (leg.compareLabel ?? "").trim() || leg.title.trim() || "Polymarket Event"
  );
}

function createMarketColumnInput(
  leg: LegState,
  market: MarketOption,
  outcome: OutcomeOption,
): MarketColumnInput {
  return {
    eventName: eventNameForLeg(leg),
    marketId: market.id,
    marketName: market.title.trim() || market.id,
    outcomeId: outcome.id,
    outcomeName: outcome.name,
  };
}

function selectOutcomesForSelection(
  market: MarketOption,
  selection: SearchOutcomeSelection,
  desiredOutcomeId: string,
  desiredOutcomeName: string,
  isActiveMarket: boolean,
): OutcomeOption[] {
  return selectPolymarketOutcomes(
    market,
    selection,
    isActiveMarket ? desiredOutcomeId : "",
    desiredOutcomeName,
  );
}

async function generateCombinedCompareData(): Promise<boolean> {
  compareChartError.value = null;
  compareChartData.value = [];
  compareSaveError.value = null;
  compareSaveSuccessPath.value = "";

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

  const frequency = normalizeExportFrequency(compareFrequency.value);

  const preparedInputs = legs.value
    .flatMap((leg) => {
      const market = leg.marketOptions.find(
        (m) => m.id === leg.selectedMarketId,
      );
      if (!market) return [];

      const selectedOutcomes = selectOutcomesForSelection(
        market,
        leg.insightsOutcomeSelection,
        (leg.selectedOutcomeId ?? "").trim(),
        (leg.selectedOutcomeName ?? "").trim(),
        true,
      );

      return selectedOutcomes.map((outcome) =>
        createMarketColumnInput(leg, market, outcome),
      );
    })
    .filter((item) => Boolean(item.outcomeId));
  const prepared = assignMarketColumnTitles(preparedInputs);

  if (prepared.length === 0) {
    compareChartError.value = "Load markets first (or check selections).";
    return false;
  }

  compareChartLoading.value = true;
  try {
    const results = await Promise.allSettled(
      prepared.map(async ({ outcomeId }) => {
        const res = await getPolymarketPricesHistory({
          market: outcomeId,
          startTs: fromTs,
        });
        return res.history ?? [];
      }),
    );

    let failedCount = 0;
    const series: ScatterSeries[] = [];

    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      const meta = prepared[i];
      if (!meta) continue;

      if (r.status === "rejected") {
        failedCount += 1;
        series.push({ name: meta.columnTitle, data: [] });
        continue;
      }

      let history = Array.isArray(r.value) ? r.value : [];
      if (fromTs) history = history.filter((pt) => pt.t >= fromTs);
      if (toTs !== null) history = history.filter((pt) => pt.t <= toTs);

      history = downsampleHistory(history, frequency);
      const data: PriceDataPoint[] = history.map((pt) => ({
        timestamp: pt.t,
        price: pt.p,
      }));

      series.push({
        name: meta.columnTitle,
        data,
      });
    }

    if (series.length === 0 || series.every((s) => s.data.length === 0)) {
      compareChartError.value =
        failedCount > 0
          ? "No data returned (some requests failed)."
          : "No data returned for the selected range.";
      return false;
    }

    compareChartData.value = series;
    if (failedCount > 0) {
      compareChartError.value = `Chart displayed, but ${failedCount} request(s) failed.`;
    }
    return true;
  } catch (err) {
    console.error("Failed to load combined compare chart:", err);
    compareChartError.value =
      err instanceof Error ? err.message : "Failed to load chart data.";
    return false;
  } finally {
    compareChartLoading.value = false;
  }
}

let combinedDataGenerationPromise: Promise<boolean> | null = null;

function ensureCombinedCompareData(): Promise<boolean> {
  if (combinedDataGenerationPromise) return combinedDataGenerationPromise;

  const generation = generateCombinedCompareData();
  combinedDataGenerationPromise = generation;
  void generation.finally(() => {
    if (combinedDataGenerationPromise === generation) {
      combinedDataGenerationPromise = null;
    }
  });
  return generation;
}

async function handlePreviewCombinedData() {
  if (!(await ensureCombinedCompareData())) return;
  openCombinedCompareChartPreview();
}

async function handleDownloadCombinedCompareCsv() {
  compareSaveError.value = null;

  if (!(await ensureCombinedCompareData())) return;

  const csvText = buildAlignedPolymarketCsv(compareChartData.value);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const prefix = hasMultipleMarkets.value
    ? "polymarket-combined-compare"
    : "polymarket-market-chart";
  downloadCsv(`${prefix}_${stamp}.csv`, csvText);
}

function defaultCombinedCompareNotebookFilename(): string {
  const prefix = hasMultipleMarkets.value
    ? "polymarket-compare"
    : "polymarket-chart";
  const base = `${prefix}-${new Date().toISOString().slice(0, 10)}`;
  return buildSafeCsvFilename(base);
}

async function performSendCombinedCompareChartToNotebooks(
  filenameInput: string,
) {
  if (compareSaveLoading.value) return;

  compareSaveError.value = null;
  compareSaveSuccessPath.value = "";

  if (compareChartData.value.length === 0) {
    compareSaveError.value = "Combined data is unavailable. Try again.";
    return;
  }

  const fallback = defaultCombinedCompareNotebookFilename();
  let filename: string;
  try {
    filename = normalizeCsvFilename(filenameInput, fallback);
  } catch (err) {
    compareFilenameError.value =
      err instanceof Error ? err.message : "Invalid filename.";
    return;
  }

  compareSaveLoading.value = true;
  try {
    const path = `data/${filename}`;

    await queueTextFileForNotebooks({
      path,
      content: buildAlignedPolymarketCsv(compareChartData.value),
      mimetype: "text/csv",
    });

    // Best-effort: if JupyterLite already initialized, sync immediately.
    // Otherwise it stays queued until the Notebooks view initializes JupyterLite.
    const sync = await syncQueuedNotebookFilesToJupyterLite();
    compareSaveSuccessPath.value = sync.skippedBecauseNotInitialized
      ? `${path} (queued)`
      : `${path}`;
  } catch (err) {
    console.error("Failed to save to JupyterLite IndexedDB:", err);
    compareSaveError.value =
      err instanceof Error ? err.message : "Failed to save to notebooks.";
  } finally {
    compareSaveLoading.value = false;
  }
}

function handleSendCombinedCompareChartToNotebooks() {
  if (compareSaveLoading.value) return;

  compareSaveError.value = null;
  compareSaveSuccessPath.value = "";

  if (compareChartData.value.length === 0) {
    compareSaveError.value = "Combined data is unavailable. Try again.";
    return;
  }

  compareFilenameError.value = null;
  compareFilenameInput.value = defaultCombinedCompareNotebookFilename();
  compareFilenameDialogOpen.value = true;
}

function goToNotebooks() {
  void router.push("/profile/jupyterlite").catch((err) => {
    console.error("Failed to navigate to JupyterLite:", err);
  });
}

async function handleCombinedCompareNotebookAction() {
  if (!(await ensureCombinedCompareData())) return;
  handleSendCombinedCompareChartToNotebooks();
}

async function handleConfirmSendCombinedCompareChartToNotebooks() {
  compareFilenameError.value = null;
  await performSendCombinedCompareChartToNotebooks(compareFilenameInput.value);
}

async function handleCompareFilenamePrimaryAction() {
  if (compareCanGoToNotebooks.value) {
    goToNotebooks();
    return;
  }
  await handleConfirmSendCombinedCompareChartToNotebooks();
}

watch(
  () => props.isOpen,
  (open) => {
    if (!open) return;

    compareFromDate.value = "";
    compareToDate.value = "";
    compareFrequency.value = "daily";
    compareChartData.value = [];
    compareChartLoading.value = false;
    compareChartError.value = null;
    compareSaveLoading.value = false;
    compareSaveError.value = null;
    compareSaveSuccessPath.value = "";
    singleMarketSaveLoading.value = false;
    singleMarketSaveError.value = null;
    singleMarketSaveSuccessPath.value = "";
    compareFilenameDialogOpen.value = false;
    compareFilenameInput.value = "";
    compareFilenameError.value = null;
    chartPreviewDialogOpen.value = false;
    chartPreviewTitle.value = "Generated Chart";
    chartPreviewSeries.value = [];
    activeLegIndex.value = 0;
    quickAddMarketUrl.value = "";
    resetMarketSearch();
    legs.value = [];

    if (hasInitialCompareInsightsSelection.value) {
      void loadCompareLegs();
      return;
    }

    const url = (props.initialMarketUrl ?? "").trim();
    if (url) {
      const index = appendInsightsLeg(url);
      void loadLeg(index);
    }
  },
  { immediate: true },
);

watch(
  () => props.initialCompareMarkets,
  () => {
    if (!props.isOpen) return;
    if (!hasInitialCompareInsightsSelection.value) return;
    // If the selected markets arrive after the modal opens (prop timing), auto-load.
    void loadCompareLegs();
  },
  { deep: true },
);

async function loadLeg(index: number) {
  const leg = legs.value[index];
  if (!leg) return;
  const initialSelectedMarketIds =
    index === 0
      ? (props.initialSelectedMarketIds ?? [])
          .map(String)
          .filter(Boolean)
          .slice(0, MAX_COMPARE_INSIGHTS_MARKETS)
      : [];
  await loadPolymarketLeg(leg, {
    initialSelectedMarketIds,
    lockExportToActiveMarket: hasMultipleMarkets.value,
    preserveInsightsTab: true,
  });
}

function onInsightsOutcomeSelectionChange(index: number) {
  const leg = legs.value[index];
  if (!leg) return;

  const selected = leg.marketOptions.find((m) => m.id === leg.selectedMarketId);
  if (!selected) return;

  const preferred = selectOutcomesForSelection(
    selected,
    leg.insightsOutcomeSelection,
    leg.selectedOutcomeId,
    leg.selectedOutcomeName,
    true,
  )[0];

  if (!preferred) return;
  leg.selectedOutcomeId = preferred.id;
  leg.selectedOutcomeName = preferred.name;
}


type CheckboxModelValue = boolean | "indeterminate";

function isAllSelected(leg: LegState): boolean {
  if (leg.marketOptions.length === 0) return false;
  // Check if every market option is selected
  return leg.marketOptions.every((m) =>
    leg.exportSelectedMarkets.includes(m.id),
  );
}

function isSomeSelected(leg: LegState): boolean {
  if (leg.marketOptions.length === 0) return false;
  return leg.marketOptions.some((m) =>
    leg.exportSelectedMarkets.includes(m.id),
  );
}

function exportSelectAllState(leg: LegState): CheckboxModelValue {
  if (isAllSelected(leg)) return true;
  if (isSomeSelected(leg)) return "indeterminate";
  return false;
}

function toggleAllExportMarkets(leg: LegState, checked: CheckboxModelValue) {
  if (checked === true || checked === "indeterminate") {
    // Select all available market options
    leg.exportSelectedMarkets = leg.marketOptions.map((m) => m.id);
  } else {
    // Deselect all
    leg.exportSelectedMarkets = [];
  }
}

function toggleExportMarket(
  leg: LegState,
  id: string,
  checked: CheckboxModelValue,
) {
  if (checked === true || checked === "indeterminate") {
    if (!leg.exportSelectedMarkets.includes(id)) {
      leg.exportSelectedMarkets.push(id);
    }
  } else {
    leg.exportSelectedMarkets = leg.exportSelectedMarkets.filter(
      (mid) => mid !== id,
    );
  }
}

function selectOutcomesForLegAndMarket(
  leg: LegState,
  market: MarketOption,
  desiredOutcomeName: string,
  desiredOutcomeIdForActiveMarket: string,
  isActiveMarket: boolean,
): OutcomeOption[] {
  if (leg.usePerMarketDefaultOutcome) {
    const outcomes = market.outcomes ?? [];
    if (outcomes.length === 0) return [];
    const defId = (market.defaultOutcomeId ?? "").trim();
    if (defId) {
      const chosen = outcomes.find((o) => o.id === defId) ?? outcomes[0];
      return chosen ? [chosen] : [];
    }
    // fallback
    const yes = outcomes.find(
      (o) => (o.name ?? "").trim().toLowerCase() === "yes",
    );
    const chosen = yes ?? outcomes[0];
    return chosen ? [chosen] : [];
  }

  return selectOutcomesForSelection(
    market,
    leg.insightsOutcomeSelection,
    desiredOutcomeIdForActiveMarket,
    desiredOutcomeName,
    isActiveMarket,
  );
}

async function handleDownloadExport(leg: LegState) {
  if (leg.exportLoading) return;

  leg.exportError = null;

  if (leg.marketOptions.length === 0) {
    leg.exportError = "Load a Polymarket URL first to get markets.";
    return;
  }

  const marketIds =
    leg.exportSelectedMarkets.length > 0
      ? leg.exportSelectedMarkets
      : leg.marketOptions.map((m) => m.id);

  if (marketIds.length === 0) {
    leg.exportError = "Select at least one market (or Select All).";
    return;
  }

  const fromTs = leg.exportFromDate
    ? unixSecondsFromDateInput(leg.exportFromDate, false)
    : 0;
  const toTs = leg.exportToDate
    ? unixSecondsFromDateInput(leg.exportToDate, true)
    : null;

  if (toTs !== null && fromTs && toTs < fromTs) {
    leg.exportError = "To date must be after From date.";
    return;
  }

  const frequency = normalizeExportFrequency(leg.exportFrequency);

  leg.exportLoading = true;
  try {
    const desiredOutcomeName = leg.selectedOutcomeName;
    const desiredOutcomeIdForActiveMarket = leg.selectedOutcomeId;

    const requestInputs: MarketColumnInput[] = [];

    let skippedCount = 0;

    for (const marketId of marketIds) {
      const market = leg.marketOptions.find((m) => m.id === marketId);
      if (!market) {
        skippedCount += 1;
        continue;
      }

      const isActiveMarket = marketId === leg.selectedMarketId;
      const outcomes = selectOutcomesForLegAndMarket(
        leg,
        market,
        desiredOutcomeName,
        desiredOutcomeIdForActiveMarket,
        isActiveMarket,
      );

      if (outcomes.length === 0) {
        skippedCount += 1;
        continue;
      }

      for (const outcome of outcomes) {
        requestInputs.push(createMarketColumnInput(leg, market, outcome));
      }
    }

    const requests = assignMarketColumnTitles(requestInputs);

    const results = await Promise.allSettled(
      requests.map(async (req) => {
        // IMPORTANT: the `market=` query param for prices-history is the CLOB token id.
        const res = await getPolymarketPricesHistory({
          market: req.outcomeId,
          startTs: fromTs,
        });
        return {
          ...req,
          history: res.history ?? [],
        };
      }),
    );

    const alignedSeries: ScatterSeries[] = requests.map((request) => ({
      name: request.columnTitle,
      data: [],
    }));

    let failedCount = 0;
    // `skippedCount` = markets where no suitable outcomes were found.

    for (let index = 0; index < results.length; index++) {
      const r = results[index];
      const targetSeries = alignedSeries[index];
      if (!r || !targetSeries) continue;

      if (r.status === "rejected") {
        failedCount += 1;
        continue;
      }

      let history = Array.isArray(r.value.history) ? r.value.history : [];
      if (fromTs) {
        history = history.filter((pt) => pt.t >= fromTs);
      }
      if (toTs !== null) {
        history = history.filter((pt) => pt.t <= toTs);
      }

      history = downsampleHistory(history, frequency);

      targetSeries.data = history.map((point) => ({
        timestamp: point.t,
        price: point.p,
      }));
    }

    if (alignedSeries.every((series) => series.data.length === 0)) {
      leg.exportError =
        failedCount > 0
          ? "No data returned (some requests failed)."
          : "No data returned for the selected range.";
      return;
    }

    const csvText = buildAlignedPolymarketCsv(alignedSeries);

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCsv(`polymarket-price-history_${stamp}.csv`, csvText);

    if (failedCount > 0 || skippedCount > 0) {
      const parts: string[] = [];
      if (failedCount > 0) parts.push(`${failedCount} request(s) failed`);
      if (skippedCount > 0)
        parts.push(
          `${skippedCount} market(s) skipped (no outcomes for ${searchOutcomeSelectionLabel(
            leg.insightsOutcomeSelection,
          )})`,
        );
      leg.exportError = `Downloaded CSV, but ${parts.join("; ")}.`;
    }
  } catch (err) {
    console.error("Failed to export price history:", err);
    leg.exportError =
      err instanceof Error ? err.message : "Failed to export price history.";
  } finally {
    leg.exportLoading = false;
  }
}

async function generateSingleMarketChartData(
  leg: LegState,
): Promise<boolean> {
  leg.chartError = null;
  leg.chartData = [];
  singleMarketSaveError.value = null;
  singleMarketSaveSuccessPath.value = "";

  if (leg.marketOptions.length === 0) {
    leg.chartError = "Load a Polymarket URL first to get markets.";
    return false;
  }

  const marketIds =
    leg.exportSelectedMarkets.length > 0
      ? leg.exportSelectedMarkets
      : leg.marketOptions.map((m) => m.id);

  if (marketIds.length === 0) {
    leg.chartError = "Select at least one market (or Select All).";
    return false;
  }

  const fromTs = leg.exportFromDate
    ? unixSecondsFromDateInput(leg.exportFromDate, false)
    : 0;
  const toTs = leg.exportToDate
    ? unixSecondsFromDateInput(leg.exportToDate, true)
    : null;

  if (toTs !== null && fromTs && toTs < fromTs) {
    leg.chartError = "To date must be after From date.";
    return false;
  }

  const frequency = normalizeExportFrequency(leg.exportFrequency);

  leg.chartLoading = true;
  try {
    const desiredOutcomeName = leg.selectedOutcomeName;
    const desiredOutcomeIdForActiveMarket = leg.selectedOutcomeId;

    const requestInputs: MarketColumnInput[] = [];

    let skippedCount = 0;

    for (const marketId of marketIds) {
      const market = leg.marketOptions.find((m) => m.id === marketId);
      if (!market) {
        skippedCount += 1;
        continue;
      }

      const isActiveMarket = marketId === leg.selectedMarketId;
      const outcomes = selectOutcomesForLegAndMarket(
        leg,
        market,
        desiredOutcomeName,
        desiredOutcomeIdForActiveMarket,
        isActiveMarket,
      );
      if (outcomes.length === 0) {
        skippedCount += 1;
        continue;
      }

      for (const outcome of outcomes) {
        requestInputs.push(createMarketColumnInput(leg, market, outcome));
      }
    }

    const requests = assignMarketColumnTitles(requestInputs);

    const results = await Promise.allSettled(
      requests.map(async (req) => {
        const res = await getPolymarketPricesHistory({
          market: req.outcomeId,
          startTs: fromTs,
        });
        return {
          ...req,
          history: res.history ?? [],
        };
      }),
    );

    const chartSeries: ScatterSeries[] = requests.map((request) => ({
      name: request.columnTitle,
      data: [],
    }));
    let failedCount = 0;

    for (let index = 0; index < results.length; index++) {
      const r = results[index];
      const targetSeries = chartSeries[index];
      if (!r || !targetSeries) continue;

      if (r.status === "rejected") {
        failedCount += 1;
        continue;
      }

      let history = Array.isArray(r.value.history) ? r.value.history : [];
      if (fromTs) {
        history = history.filter((pt) => pt.t >= fromTs);
      }
      if (toTs !== null) {
        history = history.filter((pt) => pt.t <= toTs);
      }

      history = downsampleHistory(history, frequency);

      targetSeries.data = history.map((pt) => ({
        timestamp: pt.t,
        price: pt.p,
      }));
    }

    if (
      chartSeries.length === 0 ||
      chartSeries.every((s) => s.data.length === 0)
    ) {
      leg.chartError =
        failedCount > 0
          ? "No data returned (some requests failed)."
          : "No data returned for the selected range.";
      return false;
    }

    leg.chartData = chartSeries;

    if (failedCount > 0 || skippedCount > 0) {
      const parts: string[] = [];
      if (failedCount > 0) parts.push(`${failedCount} request(s) failed`);
      if (skippedCount > 0)
        parts.push(
          `${skippedCount} market(s) skipped (no outcomes for ${searchOutcomeSelectionLabel(
            leg.insightsOutcomeSelection,
          )})`,
        );
      leg.chartError = `Chart displayed, but ${parts.join("; ")}.`;
    }
    return true;
  } catch (err) {
    console.error("Failed to load chart data:", err);
    leg.chartError =
      err instanceof Error ? err.message : "Failed to load chart data.";
    return false;
  } finally {
    leg.chartLoading = false;
  }
}

const guardSingleMarketGeneration =
  createPolymarketGenerationGuard<LegState>();

function ensureSingleMarketChartData(leg: LegState): Promise<boolean> {
  return guardSingleMarketGeneration(leg, () =>
    generateSingleMarketChartData(leg),
  );
}

async function handlePreviewChart(leg: LegState) {
  if (!(await ensureSingleMarketChartData(leg))) return;
  openLegChartPreview(leg);
}

function defaultSingleMarketNotebookFilename(leg: LegState): string {
  const selectedMarketTitle = leg.marketOptions.find(
    (market) => market.id === leg.selectedMarketId,
  )?.title;
  const label = selectedMarketTitle || leg.title || "polymarket-market";
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return buildSafeCsvFilename(`${label}-${stamp}`);
}

async function handleSendSingleMarketToJupyterLite(leg: LegState) {
  if (singleMarketSaveLoading.value) return;

  singleMarketSaveError.value = null;
  singleMarketSaveSuccessPath.value = "";

  if (!(await ensureSingleMarketChartData(leg))) {
    singleMarketSaveError.value =
      leg.chartError || "Single-market data is unavailable. Try again.";
    return;
  }

  singleMarketSaveLoading.value = true;
  try {
    const filename = defaultSingleMarketNotebookFilename(leg);
    const path = `data/${filename}`;

    await queueTextFileForNotebooks({
      path,
      content: buildAlignedPolymarketCsv(leg.chartData),
      mimetype: "text/csv",
    });

    const sync = await syncQueuedNotebookFilesToJupyterLite();
    singleMarketSaveSuccessPath.value = sync.skippedBecauseNotInitialized
      ? `${path} (queued)`
      : path;
  } catch (err) {
    console.error("Failed to save single-market data to JupyterLite:", err);
    singleMarketSaveError.value =
      err instanceof Error ? err.message : "Failed to save to JupyterLite.";
  } finally {
    singleMarketSaveLoading.value = false;
  }
}

</script>
