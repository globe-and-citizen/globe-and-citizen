<template>
  <PolymarketInsightsShell
    :embedded="embedded"
    :is-open="props.isOpen"
    @close="emit('close')"
  >
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
  </PolymarketInsightsShell>

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
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import PriceScatterChart from "@/components/Charts/PriceScatterChart.vue";
import PolymarketInsightsShell from "@/components/PolymarketInsightsShell.vue";
import PolymarketMarketInsightsWorkspace from "@/components/PolymarketMarketInsightsWorkspace.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChartPreview } from "@/composables/useChartPreview";
import { usePolymarketCompareChart } from "@/composables/usePolymarketCompareChart";
import {
  usePolymarketLegsManager,
  type PolymarketCompareMarketInput,
} from "@/composables/usePolymarketLegsManager";
import {
  toPolymarketEventUrl,
  usePolymarketMarketSearch,
} from "@/composables/usePolymarketMarketSearch";
import { usePolymarketSingleMarketExport } from "@/composables/usePolymarketSingleMarketExport";

const MAX_COMPARE_INSIGHTS_MARKETS = 10;

const props = defineProps<{
  isOpen: boolean;
  embedded?: boolean;
  initialMarketUrl?: string;
  initialSelectedMarketIds?: string[];
  initialCompareMarkets?: PolymarketCompareMarketInput[];
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

const router = useRouter();
const embedded = computed(() => props.embedded === true);
const normalizedCompareInputs = computed(() =>
  (props.initialCompareMarkets ?? [])
    .map((item) => ({
      marketUrl: String(item?.marketUrl ?? "").trim(),
      marketId: String(item?.marketId ?? "").trim(),
      label: String(item?.label ?? "").trim() || undefined,
    }))
    .filter((item) => item.marketUrl && item.marketId)
    .slice(0, MAX_COMPARE_INSIGHTS_MARKETS),
);
const hasInitialCompareSelection = computed(
  () => normalizedCompareInputs.value.length > 0,
);

const {
  legs,
  activeLegIndex,
  activeLeg,
  quickAddMarketUrl,
  canAddMoreInsightsMarkets,
  canQuickAddMarket,
  appendInsightsLeg,
  selectLeg,
  canRemoveLeg,
  removeLeg,
  setLegField,
  legDisplayTitle,
  legStatusText,
  loadLeg,
  handleQuickAddMarket,
  handleAssignSearchEvent,
  isSearchEventSelected,
  handleRemoveSearchEvent,
  onInsightsOutcomeSelectionChange,
  loadCompareLegs,
  exportSelectAllState,
  toggleAllExportMarkets,
  toggleExportMarket,
  reset: resetLegs,
} = usePolymarketLegsManager({
  initialSelectedMarketIds: () => props.initialSelectedMarketIds,
  lockExportToActiveMarket: hasInitialCompareSelection,
  maxLegs: MAX_COMPARE_INSIGHTS_MARKETS,
});

const hasMultipleMarkets = computed(
  () => legs.value.length > 1 || hasInitialCompareSelection.value,
);
const insightsChartPanelTitle = computed(() =>
  hasMultipleMarkets.value
    ? "Combined Comparison Chart"
    : "Chart and Notebook Export",
);

const {
  dialogOpen: chartPreviewDialogOpen,
  title: chartPreviewTitle,
  series: chartPreviewSeries,
  open: openChartPreview,
  reset: resetChartPreview,
} = useChartPreview();

function goToNotebooks() {
  void router.push("/profile/jupyterlite").catch((error) => {
    console.error("Failed to navigate to JupyterLite:", error);
  });
}

const {
  compareFromDate,
  compareToDate,
  compareFrequency,
  compareChartError,
  compareMinDate,
  compareFilenameDialogOpen,
  compareFilenameInput,
  compareFilenameError,
  compareSaveLoading,
  compareSaveError,
  compareSaveSuccessPath,
  compareCanGoToNotebooks,
  hasInsightsChartActions,
  defaultCombinedCompareNotebookFilename,
  handlePreviewCombinedData,
  handleDownloadCombinedCompareCsv,
  handleCombinedCompareNotebookAction,
  handleCompareFilenamePrimaryAction,
  reset: resetCompareChart,
} = usePolymarketCompareChart({
  legs,
  hasMultipleMarkets,
  openPreview: openChartPreview,
  goToNotebooks,
});

const {
  singleMarketSaveError,
  singleMarketSaveSuccessPath,
  handleDownloadExport,
  handlePreviewChart,
  handleSendSingleMarketToJupyterLite,
  reset: resetSingleMarketExport,
} = usePolymarketSingleMarketExport({
  activeLeg,
  openPreview: openChartPreview,
});

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

function resetInsights() {
  resetCompareChart();
  resetSingleMarketExport();
  resetChartPreview();
  resetMarketSearch();
  resetLegs();
}

function initializeInsights() {
  resetInsights();
  if (hasInitialCompareSelection.value) {
    loadCompareLegs(normalizedCompareInputs.value);
    return;
  }
  const url = props.initialMarketUrl?.trim();
  if (url) {
    const index = appendInsightsLeg(url);
    void loadLeg(index);
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) initializeInsights();
  },
  { immediate: true },
);

watch(
  () => props.initialCompareMarkets,
  () => {
    if (props.isOpen && hasInitialCompareSelection.value) {
      loadCompareLegs(normalizedCompareInputs.value);
    }
  },
  { deep: true },
);
</script>
