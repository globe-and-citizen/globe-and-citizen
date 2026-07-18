<template>
  <div v-if="embedded" class="grid gap-6">
    <div class="grid gap-6 py-1">
      <!-- Step indicator -->

      <!-- Step 1: Configure -->
      <PolymarketAlertWizardConfigStep
        v-if="!isInsightsMode && step === 1"
        v-model:legs-count-string="legsCountString"
        v-model:threshold="threshold"
        v-model:operator="operator"
        v-model:direction="direction"
        v-model:target-price="targetPrice"
        v-model:single-operator="singleOperator"
        v-model:notify-discord="notifyDiscord"
        v-model:discord-webhook="discordWebhook"
        v-model:repeat="repeat"
        :is-sum="isSum"
      />

      <!-- Step 2: Select legs -->
      <PolymarketAlertWizardSelectLegsStep
        v-else-if="step === 2"
        v-model:compare-from-date="compareFromDate"
        v-model:compare-to-date="compareToDate"
        v-model:compare-frequency="compareFrequency"
        v-model:compare-filename-dialog-open="compareFilenameDialogOpen"
        v-model:compare-filename-input="compareFilenameInput"
        v-model:quick-add-market-url="quickAddMarketUrl"
        v-model:market-search-dialog-open="marketSearchDialogOpen"
        v-model:market-search-query="marketSearchQuery"
        :is-insights-mode="isInsightsMode"
        :is-compare-insights-mode="isCompareInsightsMode"
        :show-alert-outcome-mode="true"
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
        :load-leg="loadLeg"
        :get-market-select-options="getMarketSelectOptions"
        :get-outcome-select-options="getOutcomeSelectOptions"
        :on-market-change="onMarketChange"
        :on-outcome-change="onOutcomeChange"
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

      <!-- Step 3: Review -->
      <PolymarketAlertWizardReviewStep
        v-else-if="!isInsightsMode"
        :is-sum="isSum"
        :legs-count="legsCount"
        :direction="direction"
        :operator="operator"
        :single-operator="singleOperator"
        :threshold="threshold"
        :target-price="targetPrice"
        :notify-discord="notifyDiscord"
        :discord-webhook="discordWebhook"
        :repeat="repeat"
        :legs="legs"
        :submit-error="submitError"
        :operator-symbol="operatorSymbol"
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
        <DialogTitle>
          {{
            isInsightsMode
              ? "Polymarket Market Insights"
              : isEditMode
                ? "Update Polymarket Alert"
                : "Create Polymarket Alert"
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            isInsightsMode
              ? "Export data and generate charts for one or more markets."
              : isEditMode
                ? "Update an existing single-outcome alert or a 2/3-market sum alert."
                : "Create a single-outcome alert or a 2/3-market sum alert."
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <!-- Step indicator -->

        <!-- Step 1: Configure -->
        <PolymarketAlertWizardConfigStep
          v-if="!isInsightsMode && step === 1"
          v-model:legs-count-string="legsCountString"
          v-model:threshold="threshold"
          v-model:operator="operator"
          v-model:direction="direction"
          v-model:target-price="targetPrice"
          v-model:single-operator="singleOperator"
          v-model:notify-discord="notifyDiscord"
          v-model:discord-webhook="discordWebhook"
          v-model:repeat="repeat"
          :is-sum="isSum"
        />

        <!-- Step 2: Select legs -->
        <PolymarketAlertWizardSelectLegsStep
          v-else-if="step === 2"
          v-model:compare-from-date="compareFromDate"
          v-model:compare-to-date="compareToDate"
          v-model:compare-frequency="compareFrequency"
          v-model:compare-filename-dialog-open="compareFilenameDialogOpen"
          v-model:compare-filename-input="compareFilenameInput"
          v-model:quick-add-market-url="quickAddMarketUrl"
          v-model:market-search-dialog-open="marketSearchDialogOpen"
          v-model:market-search-query="marketSearchQuery"
          :is-insights-mode="isInsightsMode"
          :is-compare-insights-mode="isCompareInsightsMode"
          :show-alert-outcome-mode="false"
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
          :load-leg="loadLeg"
          :get-market-select-options="getMarketSelectOptions"
          :get-outcome-select-options="getOutcomeSelectOptions"
          :on-market-change="onMarketChange"
          :on-outcome-change="onOutcomeChange"
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

        <!-- Step 3: Review -->
        <PolymarketAlertWizardReviewStep
          v-else-if="!isInsightsMode"
          :is-sum="isSum"
          :legs-count="legsCount"
          :direction="direction"
          :operator="operator"
          :single-operator="singleOperator"
          :threshold="threshold"
          :target-price="targetPrice"
          :notify-discord="notifyDiscord"
          :discord-webhook="discordWebhook"
          :repeat="repeat"
          :legs="legs"
          :submit-error="submitError"
          :operator-symbol="operatorSymbol"
        />
      </div>

      <DialogFooter class="flex-col-reverse sm:flex-row gap-2">
        <Button
          v-if="isInsightsMode"
          variant="outline"
          :disabled="isSubmitting"
          @click="emit('close')"
        >
          Close
        </Button>

        <template v-else>
          <Button
            variant="outline"
            :disabled="isSubmitting"
            @click="handleBackOrClose"
          >
            {{ step === 1 ? "Cancel" : "Back" }}
          </Button>
          <Button
            v-if="step < 3"
            :disabled="!canProceed || isSubmitting"
            @click="step++"
          >
            Next
          </Button>
          <Button
            v-else
            :disabled="!canSubmit || isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">{{
              isEditMode ? "Updating…" : "Creating…"
            }}</span>
            <span v-else>{{
              isEditMode ? "Update Alert" : "Create Alert"
            }}</span>
          </Button>
        </template>
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
  createAlert,
  getPolymarketDataBySlug,
  getPolymarketPricesHistory,
  type PolymarketPriceHistoryPoint,
  type AlertOperator,
  searchPolymarketPublic,
  type PolymarketGammaPagination,
  type PolymarketGammaSearchEvent,
  updateAlert,
} from "@/api/polymarket";
import PriceScatterChart, {
  type ScatterSeries,
  type PriceDataPoint,
} from "@/components/Charts/PriceScatterChart.vue";
import PolymarketAlertWizardConfigStep from "@/components/PolymarketAlertWizardConfigStep.vue";
import PolymarketAlertWizardSelectLegsStep from "@/components/PolymarketAlertWizardSelectLegsStep.vue";
import PolymarketAlertWizardReviewStep from "@/components/PolymarketAlertWizardReviewStep.vue";
import { buildAlignedPolymarketCsv } from "@/lib/polymarketCsv";
import {
  buildSafeCsvFilename,
  queueTextFileForNotebooks,
  syncQueuedNotebookFilesToJupyterLite,
} from "@/composables/jupyterLiteStorage";

type OutcomeOption = { id: string; name: string };
type MarketOption = {
  id: string;
  title: string;
  outcomes: OutcomeOption[];
  // Used for cross-event comparisons where each market may have different outcomes.
  defaultOutcomeId?: string;
  defaultOutcomeName?: string;
};

type CompareMarketInput = {
  marketUrl: string;
  marketId: string;
  label?: string;
};

type SearchOutcomeSelection = "yes" | "no" | "both";

type SearchEventCardItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  event: PolymarketGammaSearchEvent;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (!value || typeof value !== "object") return null;
  return value as UnknownRecord;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes" || v === "y") return true;
    if (v === "false" || v === "0" || v === "no" || v === "n") return false;
  }
  return fallback;
}

type LegState = {
  marketUrl: string;
  loading: boolean;
  error: string | null;
  title: string;
  compareLabel?: string;
  minDate: string;
  marketOptions: MarketOption[];
  selectedMarketId: string;
  outcomeOptions: OutcomeOption[];
  selectedOutcomeId: string;
  selectedOutcomeName: string;
  insightsOutcomeSelection: SearchOutcomeSelection;
  usePerMarketDefaultOutcome: boolean;
  // Export
  showExport: boolean;
  exportFromDate: string;
  exportToDate: string;
  exportFrequency: string;
  exportSelectedMarkets: string[]; // Changed from exportSelectedOutcomes
  exportLoading: boolean;
  exportError: string | null;
  // Chart
  showChart: boolean;
  chartData: ScatterSeries[];
  chartLoading: boolean;
  chartError: string | null;
};

type LegInsightsTab = "chart" | "export";

type MutableLegField =
  | "marketUrl"
  | "selectedMarketId"
  | "selectedOutcomeId"
  | "insightsOutcomeSelection"
  | "exportFromDate"
  | "exportToDate"
  | "exportFrequency";

const MAX_COMPARE_INSIGHTS_MARKETS = 10;
const DEFAULT_FALLBACK_IMAGE =
  "https://polymarket-upload.s3.us-east-2.amazonaws.com/polymarket_logo.png";

interface Props {
  isOpen: boolean;
  mode?: "create" | "edit";
  initialAlert?: ExistingAlert | null;
  variant?: "alert" | "insights";
  embedded?: boolean;
  initialMarketUrl?: string;
  initialSelectedMarketIds?: string[];
  initialCompareMarkets?: CompareMarketInput[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "created"): void;
  (e: "updated"): void;
}>();

const router = useRouter();

const embedded = computed(() => props.embedded === true);

type ExistingAlertLeg = {
  market_url?: string;
  outcome_id?: string;
  outcome_name?: string;
};

type ExistingAlert = {
  id: string | number;

  // single
  market_url?: string;
  market_id?: string;
  outcome_id?: string;
  outcome_name?: string;
  direction?: "buy" | "sell";
  target_price?: number;

  // sum
  alert_type?: "sum";
  operator?: AlertOperator;
  threshold?: number;
  legs?: ExistingAlertLeg[];

  // notifications
  notify_discord?: boolean;
  discord_webhook?: string;
  repeat?: boolean;
};

const isEditMode = computed(() => props.mode === "edit");
const isInsightsMode = computed(() => props.variant === "insights");
const hasInitialCompareInsightsSelection = computed(
  () => (props.initialCompareMarkets?.length ?? 0) > 0,
);
const hasInsightsChartActions = computed(
  () => isInsightsMode.value && legs.value.length > 0,
);
const isCompareInsightsMode = computed(() => {
  if (!isInsightsMode.value) return false;
  return legs.value.length > 1 || hasInitialCompareInsightsSelection.value;
});
const insightsChartPanelTitle = computed(() =>
  isCompareInsightsMode.value
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

const marketSearchDialogOpen = ref(false);
const marketSearchQuery = ref("");
const marketSearchLoading = ref(false);
const marketSearchLoadingMore = ref(false);
const marketSearchError = ref<string | null>(null);
const marketSearchPagination = ref<PolymarketGammaPagination | null>(null);
const marketSearchCurrentPage = ref(1);
const marketSearchEvents = ref<PolymarketGammaSearchEvent[]>([]);

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
  if (!isInsightsMode.value) return true;
  return canAddMoreInsightsMarkets.value;
});
const searchEventResults = computed<SearchEventCardItem[]>(() => {
  const items: SearchEventCardItem[] = [];
  const seen = new Set<string>();

  for (const ev of marketSearchEvents.value ?? []) {
    if (!ev?.id || seen.has(ev.id)) continue;
    seen.add(ev.id);

    const markets = ev.markets ?? [];

    items.push({
      id: ev.id,
      title: (ev.title ?? "Untitled event").trim(),
      subtitle: `${markets.length} market${markets.length === 1 ? "" : "s"}`,
      image: (ev.icon || ev.image || DEFAULT_FALLBACK_IMAGE).toString().trim(),
      event: ev,
    });
  }

  return items;
});

function createEmptyLeg(): LegState {
  return {
    marketUrl: "",
    loading: false,
    error: null,
    title: "",
    compareLabel: undefined,
    minDate: "",
    marketOptions: [],
    selectedMarketId: "",
    outcomeOptions: [],
    selectedOutcomeId: "",
    selectedOutcomeName: "",
    insightsOutcomeSelection: "yes",
    usePerMarketDefaultOutcome: false,
    showExport: false,
    exportFromDate: "",
    exportToDate: "",
    exportFrequency: "daily",
    exportSelectedMarkets: [],
    exportLoading: false,
    exportError: null,
    showChart: false,
    chartData: [],
    chartLoading: false,
    chartError: null,
  };
}

function searchOutcomeSelectionLabel(
  selection: SearchOutcomeSelection,
): string {
  if (selection === "no") return "No";
  if (selection === "both") return "Yes and No";
  return "Yes";
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

function toPolymarketEventUrl(event: PolymarketGammaSearchEvent | null) {
  const slug = (event?.slug ?? "").trim();
  if (!slug) return "https://polymarket.com";
  return `https://polymarket.com/event/${encodeURIComponent(slug)}`;
}

function legDisplayTitle(leg: LegState, index: number): string {
  const explicit = (leg.compareLabel ?? "").trim();
  if (explicit) return explicit;
  if (isInsightsMode.value && (leg.title ?? "").trim()) {
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
  if (isInsightsMode.value) {
    return `Outcome: ${searchOutcomeSelectionLabel(
      leg.insightsOutcomeSelection,
    )}`;
  }
  return leg.selectedOutcomeName || "Ready";
}

function selectLeg(index: number) {
  if (index < 0 || index >= legs.value.length) return;
  activeLegIndex.value = index;
  const leg = legs.value[index];
  if (!isInsightsMode.value && leg?.marketUrl) {
    quickAddMarketUrl.value = leg.marketUrl;
  }
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
  if (!isInsightsMode.value) return false;
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
  if (!isInsightsMode.value || !canAddMoreInsightsMarkets.value) return;
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

  if (isInsightsMode.value) {
    if (!canAddMoreInsightsMarkets.value) return;
    const index = appendInsightsLeg(url);
    quickAddMarketUrl.value = "";
    await loadLeg(index);
    return;
  }

  const leg = activeLeg.value;
  if (!leg) return;
  leg.marketUrl = url;
  await loadLeg(activeLegIndex.value);
}

function openMarketSearchDialog() {
  marketSearchDialogOpen.value = true;
  marketSearchError.value = null;
}

function closeMarketSearchDialog() {
  marketSearchDialogOpen.value = false;
}

function findInsightsLegIndexForEvent(event: PolymarketGammaSearchEvent) {
  if (!isInsightsMode.value) return -1;
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
    isCompareInsightsMode.value ? "Comparison Price History" : "Price History",
    compareChartData.value,
  );
}

function mergeSearchEvents(
  existing: PolymarketGammaSearchEvent[],
  incoming: PolymarketGammaSearchEvent[],
) {
  const seen = new Set(existing.map((event) => event.id));
  const merged = [...existing];
  for (const event of incoming) {
    if (!event?.id || seen.has(event.id)) continue;
    seen.add(event.id);
    merged.push(event);
  }
  return merged;
}

async function fetchMarketSearchPage(opts: { page: number; append: boolean }) {
  const query = marketSearchQuery.value.trim();
  if (!query) {
    marketSearchEvents.value = [];
    marketSearchPagination.value = null;
    marketSearchCurrentPage.value = 1;
    marketSearchError.value = null;
    return;
  }

  if (opts.page === 1) {
    marketSearchLoading.value = true;
  } else {
    marketSearchLoadingMore.value = true;
  }
  marketSearchError.value = null;

  try {
    const response = await searchPolymarketPublic({
      q: query,
      limitPerType: 50,
      page: opts.page,
    });

    const nextEvents = Array.isArray(response.events) ? response.events : [];
    marketSearchEvents.value = opts.append
      ? mergeSearchEvents(marketSearchEvents.value, nextEvents)
      : nextEvents;
    marketSearchPagination.value = response.pagination ?? null;
    marketSearchCurrentPage.value = opts.page;
  } catch (err) {
    console.error("Failed to search Polymarket markets:", err);
    marketSearchError.value = "Could not load results. Try again.";
    if (!opts.append) {
      marketSearchEvents.value = [];
      marketSearchPagination.value = null;
      marketSearchCurrentPage.value = 1;
    }
  } finally {
    marketSearchLoading.value = false;
    marketSearchLoadingMore.value = false;
  }
}

async function runMarketSearch() {
  await fetchMarketSearchPage({ page: 1, append: false });
}

async function loadMoreMarketSearchResults() {
  if (marketSearchLoading.value || marketSearchLoadingMore.value) return;
  if (!marketSearchPagination.value?.hasMore) return;
  await fetchMarketSearchPage({
    page: marketSearchCurrentPage.value + 1,
    append: true,
  });
}

function handleSearchImageError(event: Event) {
  const image = event.target as HTMLImageElement | null;
  if (!image) return;
  image.src = DEFAULT_FALLBACK_IMAGE;
}

async function loadCompareLegs() {
  const items = normalizeCompareInputs();
  if (items.length === 0) return;

  // Build one leg per selected market.
  legsCount.value = items.length;
  step.value = 2;

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

const step = ref<1 | 2 | 3>(1);
const legsCount = ref<number>(1);
const operator = ref<AlertOperator>("lt");
const singleOperator = ref<AlertOperator>("gte");
const threshold = ref<number>(0.95);
const direction = ref<"buy" | "sell">("buy");
const targetPrice = ref<number>(0.95);
const notifyDiscord = ref<boolean>(true);
const discordWebhook = ref<string>("");
const repeat = ref<boolean>(true);

const isSubmitting = ref(false);
const submitError = ref<string>("");

const legs = ref<LegState[]>([
  {
    marketUrl: "",
    loading: false,
    error: null,
    title: "",
    compareLabel: undefined,
    minDate: "",
    marketOptions: [],
    selectedMarketId: "",
    outcomeOptions: [],
    selectedOutcomeId: "",
    selectedOutcomeName: "",
    insightsOutcomeSelection: "yes",
    usePerMarketDefaultOutcome: false,
    showExport: false,
    exportFromDate: "",
    exportToDate: "",
    exportFrequency: "daily",
    exportSelectedMarkets: [],
    exportLoading: false,
    exportError: null,
    showChart: false,
    chartData: [],
    chartLoading: false,
    chartError: null,
  },
]);

const compareMinDate = computed(() => {
  if (!hasInsightsChartActions.value) return "";
  const dates = legs.value
    .map((l) => (l.minDate ?? "").trim())
    .filter(Boolean)
    .sort();
  return dates[0] ?? "";
});

function formatIsoTodayUtc(): string {
  const d = new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

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

function findOutcomeByName(
  outcomes: OutcomeOption[],
  desiredName: "yes" | "no",
): OutcomeOption | null {
  return (
    outcomes.find(
      (o) => normalizeOutcomeNameForMatch(o.name) === desiredName,
    ) ?? null
  );
}

function selectOutcomesForSelection(
  market: MarketOption,
  selection: SearchOutcomeSelection,
  desiredOutcomeIdForActiveMarket: string,
  desiredOutcomeName: string,
  isActiveMarket: boolean,
): OutcomeOption[] {
  const outcomes = market.outcomes ?? [];
  if (outcomes.length === 0) return [];

  const yesOutcome = findOutcomeByName(outcomes, "yes");
  const noOutcome = findOutcomeByName(outcomes, "no");

  if (selection === "both") {
    const picked: OutcomeOption[] = [];
    if (yesOutcome) picked.push(yesOutcome);
    if (noOutcome && (!yesOutcome || noOutcome.id !== yesOutcome.id)) {
      picked.push(noOutcome);
    }
    if (picked.length > 0) return picked;

    // Fallback for non-binary markets: emit all outcomes.
    return [...outcomes];
  }

  if (selection === "no") {
    if (noOutcome) return [noOutcome];
    if (yesOutcome) return [yesOutcome];
    return [outcomes[0]];
  }

  // selection === "yes"
  if (isActiveMarket && desiredOutcomeIdForActiveMarket) {
    const byId = outcomes.find((o) => o.id === desiredOutcomeIdForActiveMarket);
    if (byId) return [byId];
  }

  const desiredName = normalizeOutcomeNameForMatch(desiredOutcomeName);
  if (desiredName) {
    const byName = outcomes.find(
      (o) => normalizeOutcomeNameForMatch(o.name) === desiredName,
    );
    if (byName) return [byName];
  }

  if (yesOutcome) return [yesOutcome];
  if (noOutcome) return [noOutcome];
  return [outcomes[0]];
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
  const prefix = isCompareInsightsMode.value
    ? "polymarket-combined-compare"
    : "polymarket-market-chart";
  downloadCsv(`${prefix}_${stamp}.csv`, csvText);
}

function defaultCombinedCompareNotebookFilename(): string {
  const prefix = isCompareInsightsMode.value
    ? "polymarket-compare"
    : "polymarket-chart";
  const base = `${prefix}-${new Date().toISOString().slice(0, 10)}`;
  return buildSafeCsvFilename(base);
}

function normalizeCsvFilename(
  input: string,
  fallbackFilename: string,
): string {
  const raw = (input ?? "").trim();
  const candidate = raw || fallbackFilename;

  // Disallow directories; keep only the last path segment.
  const justName = candidate.split(/[/\\]/).pop() ?? "";
  const noExt = justName.replace(/\.csv$/i, "").trim();
  if (!noExt) throw new Error("Filename cannot be empty.");
  return buildSafeCsvFilename(noExt);
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

const isSum = computed(() => legsCount.value !== 1);

const legsCountString = computed({
  get: () => String(legsCount.value),
  set: (v: string) => {
    const next = Number(v);
    if (next === 1 || next === 2 || next === 3) legsCount.value = next;
  },
});

watch(
  () => legsCount.value,
  (count) => {
    const nextLegs: LegState[] = [];
    for (let i = 0; i < count; i++) {
      nextLegs.push(
        legs.value[i] ?? {
          marketUrl: "",
          loading: false,
          error: null,
          title: "",
          compareLabel: undefined,
          minDate: "",
          usePerMarketDefaultOutcome: false,
          showExport: false,
          exportFromDate: "",
          exportToDate: "",
          showChart: false,
          chartData: [],
          chartLoading: false,
          chartError: null,
          exportFrequency: "daily",
          exportSelectedMarkets: [],
          exportLoading: false,
          exportError: null,
          marketOptions: [],
          selectedMarketId: "",
          outcomeOptions: [],
          selectedOutcomeId: "",
          selectedOutcomeName: "",
          insightsOutcomeSelection: "yes",
        },
      );
    }
    legs.value = nextLegs;
  },
  { immediate: true },
);

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return;

    compareFromDate.value = "";
    compareToDate.value = "";
    compareFrequency.value = "daily";
    compareChartData.value = [];
    compareChartLoading.value = false;
    compareChartError.value = null;
    chartPreviewDialogOpen.value = false;
    chartPreviewTitle.value = "Generated Chart";
    chartPreviewSeries.value = [];
    const resetToDefaults = () => {
      step.value = 1;
      legsCount.value = 1;
      activeLegIndex.value = 0;
      quickAddMarketUrl.value = "";
      marketSearchDialogOpen.value = false;
      marketSearchQuery.value = "";
      marketSearchLoading.value = false;
      marketSearchLoadingMore.value = false;
      marketSearchError.value = null;
      marketSearchPagination.value = null;
      marketSearchCurrentPage.value = 1;
      marketSearchEvents.value = [];
      operator.value = "lt";
      singleOperator.value = "gte";
      threshold.value = 0.95;
      direction.value = "buy";
      targetPrice.value = 0.95;
      notifyDiscord.value = true;
      discordWebhook.value = "";
      repeat.value = true;
      legs.value = [
        {
          marketUrl: "",
          loading: false,
          error: null,
          title: "",
          compareLabel: undefined,
          minDate: "",
          usePerMarketDefaultOutcome: false,
          showExport: false,
          exportFromDate: "",
          exportToDate: "",
          showChart: false,
          chartData: [],
          chartLoading: false,
          chartError: null,
          exportFrequency: "daily",
          exportSelectedMarkets: [],
          exportLoading: false,
          exportError: null,
          marketOptions: [],
          selectedMarketId: "",
          outcomeOptions: [],
          selectedOutcomeId: "",
          selectedOutcomeName: "",
          insightsOutcomeSelection: "yes",
        },
      ];

      submitError.value = "";
      isSubmitting.value = false;
    };

    const applyInitialAlert = (alert: ExistingAlert) => {
      step.value = 1;
      submitError.value = "";
      isSubmitting.value = false;

      notifyDiscord.value = coerceBoolean(alert.notify_discord, true);
      discordWebhook.value = alert.discord_webhook ?? "";
      repeat.value = coerceBoolean(alert.repeat, true);

      const isSumExisting =
        alert.alert_type === "sum" || (alert.legs?.length ?? 0) > 0;

      if (isSumExisting) {
        const count = (alert.legs?.length ?? 2) === 3 ? 3 : 2;
        legsCount.value = count;
        operator.value = (alert.operator ?? "lt") as AlertOperator;
        threshold.value =
          typeof alert.threshold === "number" ? alert.threshold : 0.95;
        direction.value = (alert.direction ?? "buy") as "buy" | "sell";

        legs.value = (alert.legs ?? []).slice(0, count).map((l) => ({
          marketUrl: l.market_url ?? "",
          loading: false,
          error: null,
          title: "",
          minDate: "",
          marketOptions: [],
          selectedMarketId: "",
          outcomeOptions: [],
          selectedOutcomeId: l.outcome_id ?? "",
          selectedOutcomeName: l.outcome_name ?? "",
          insightsOutcomeSelection: "yes",
          usePerMarketDefaultOutcome: false,
          showExport: false,
          exportFromDate: "",
          exportToDate: "",
          showChart: false,
          chartData: [],
          chartLoading: false,
          chartError: null,
          exportFrequency: "daily",
          exportSelectedMarkets: [],
          exportLoading: false,
          exportError: null,
        }));
      } else {
        legsCount.value = 1;
        direction.value = (alert.direction ?? "buy") as "buy" | "sell";
        singleOperator.value = (alert.operator ?? "gte") as AlertOperator;
        targetPrice.value =
          typeof alert.target_price === "number" ? alert.target_price : 0.95;

        legs.value = [
          {
            marketUrl: alert.market_url ?? "",
            loading: false,
            error: null,
            title: "",
            minDate: "",
            marketOptions: [],
            selectedMarketId: alert.market_id ?? "",
            outcomeOptions: [],
            selectedOutcomeId: alert.outcome_id ?? "",
            showChart: false,
            chartData: [],
            chartLoading: false,
            chartError: null,
            selectedOutcomeName: alert.outcome_name ?? "",
            insightsOutcomeSelection: "yes",
            usePerMarketDefaultOutcome: false,
            showExport: false,
            exportFromDate: "",
            exportToDate: "",
            exportFrequency: "daily",
            exportSelectedMarkets: [],
            exportLoading: false,
            exportError: null,
          },
        ];
      }
    };

    if (isInsightsMode.value) {
      resetToDefaults();
      legsCount.value = 1;
      step.value = 2;
      legs.value = [];

      if (isCompareInsightsMode.value) {
        // Auto-load compare selection into multiple legs.
        void loadCompareLegs();
        return;
      }

      const url = (props.initialMarketUrl ?? "").trim();
      if (url) {
        const index = appendInsightsLeg(url);
        // Auto-load so chart/export can be used immediately.
        // Fire and forget; errors show on the leg.
        void loadLeg(index);
      }
      return;
    }

    if (!isEditMode.value || !props.initialAlert) {
      resetToDefaults();
      return;
    }

    applyInitialAlert(props.initialAlert);
  },
  { immediate: true },
);

watch(
  () => props.initialAlert,
  (alert) => {
    if (!props.isOpen) return;
    if (!isEditMode.value) return;
    if (!alert) return;

    notifyDiscord.value = coerceBoolean(alert.notify_discord, true);
    repeat.value = coerceBoolean(alert.repeat, true);
  },
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

function parsePolymarketUrl(input: string): {
  type: "events" | "markets";
  slug: string;
} {
  const url = new URL(input);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const typeFromUrl = pathParts[0];
  const slug = pathParts[1];

  const type =
    typeFromUrl === "event"
      ? "events"
      : typeFromUrl === "market"
        ? "markets"
        : null;

  if (!type || !slug) {
    throw new Error("Invalid Polymarket URL.");
  }

  return { type, slug };
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatDateInputValue(dateLike: unknown): string {
  if (dateLike === null || dateLike === undefined) return "";

  let d: Date;

  if (typeof dateLike === "number") {
    const ms = dateLike > 1e12 ? dateLike : dateLike * 1000;
    d = new Date(ms);
  } else {
    const raw = safeString(dateLike).trim();
    if (!raw) return "";

    if (/^\d+$/.test(raw)) {
      const n = Number(raw);
      const ms = n > 1e12 ? n : n * 1000;
      d = new Date(ms);
    } else {
      d = new Date(raw);
    }
  }

  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function extractEventStartDateMin(data: unknown): string {
  const r = asRecord(data);
  if (!r) return "";

  const candidates: string[] = [];
  // Prefer explicit event-level timestamps.
  candidates.push(formatDateInputValue(r.startDate));
  candidates.push(formatDateInputValue(r.creationDate));
  candidates.push(formatDateInputValue(r.createdAt));

  // Fallbacks: some payloads may be market-centric.
  const markets = Array.isArray(r.markets) ? r.markets : [];
  if (markets.length > 0) {
    const m0 = asRecord(markets[0]);
    if (m0) {
      candidates.push(formatDateInputValue(m0.startDate));
      candidates.push(formatDateInputValue(m0.createdAt));
    }
  }

  const filtered = candidates.filter(Boolean);
  if (filtered.length === 0) return "";
  // ISO YYYY-MM-DD strings sort lexicographically by date.
  return filtered.sort()[0];
}

function isBeforeIsoDate(a: string, b: string): boolean {
  const aa = (a ?? "").trim();
  const bb = (b ?? "").trim();
  if (!aa || !bb) return false;
  return aa < bb;
}

function operatorSymbol(op: AlertOperator): string {
  switch (op) {
    case "lt":
      return "<";
    case "lte":
      return "≤";
    case "gt":
      return ">";
    case "gte":
      return "≥";
    case "eq":
      return "=";
    default:
      return String(op);
  }
}

function parseClobTokenIds(clobTokenIds: unknown): OutcomeOption[] {
  try {
    const ids =
      typeof clobTokenIds === "string"
        ? JSON.parse(clobTokenIds)
        : clobTokenIds;
    if (!Array.isArray(ids)) return [];

    return ids
      .map((id, index) => {
        const sid = safeString(id);
        if (!sid) return null;
        let name = `Outcome ${index + 1}`;
        // Binary fallback convention: [0]=Yes, [1]=No
        if (ids.length === 2) {
          if (index === 0) name = "Yes";
          if (index === 1) name = "No";
        }
        return { id: sid, name };
      })
      .filter(Boolean) as OutcomeOption[];
  } catch {
    return [];
  }
}

function normalizeMarket(market: unknown): MarketOption | null {
  const m = asRecord(market);
  const id = safeString(m?.id ?? m?.market_id ?? m?.marketId);
  const title =
    safeString(m?.groupItemTitle ?? m?.title ?? m?.name) ||
    (id ? `Market ${id}` : "Market");

  let outcomes: OutcomeOption[] = [];

  if (Array.isArray(m?.outcomes)) {
    outcomes = asArray(m.outcomes)
      .map((outcome) => {
        const o = asRecord(outcome);
        const outcomeId = safeString(
          o?.clobTokenId ?? o?.tokenId ?? o?.outcome_id ?? o?.id,
        );
        const outcomeName = safeString(o?.name ?? o?.title ?? o?.outcome_name);
        if (!outcomeId || !outcomeName) return null;
        return { id: outcomeId, name: outcomeName };
      })
      .filter(Boolean) as OutcomeOption[];
  }

  if (outcomes.length === 0 && m?.clobTokenIds) {
    outcomes = parseClobTokenIds(m.clobTokenIds);
  }

  if (!id) return null;

  const defaultOutcome = (() => {
    if (outcomes.length === 0) return null;
    const yes = outcomes.find(
      (o) => (o.name ?? "").trim().toLowerCase() === "yes",
    );
    return yes ?? outcomes[0];
  })();

  return {
    id,
    title,
    outcomes,
    defaultOutcomeId: defaultOutcome?.id,
    defaultOutcomeName: defaultOutcome?.name,
  };
}

function normalizePolymarketToMarketOptions(data: unknown): MarketOption[] {
  if (!data) return [];

  const d = asRecord(data);
  const markets = d?.markets;
  if (Array.isArray(markets)) {
    return markets.map(normalizeMarket).filter(Boolean) as MarketOption[];
  }

  const single = normalizeMarket(data);
  return single ? [single] : [];
}

function getMarketSelectOptions(leg: LegState): MarketOption[] {
  if (leg.marketOptions.length > 0) return leg.marketOptions;

  if (!isEditMode.value) return [];
  if (!leg.selectedMarketId) return [];

  const title = `Market ${leg.selectedMarketId}`;
  const outcomes = getOutcomeSelectOptions(leg);
  return [{ id: leg.selectedMarketId, title, outcomes }];
}

function getOutcomeSelectOptions(leg: LegState): OutcomeOption[] {
  if (leg.outcomeOptions.length > 0) return leg.outcomeOptions;

  if (!isEditMode.value) return [];
  if (!leg.selectedOutcomeId || !leg.selectedOutcomeName) return [];
  return [{ id: leg.selectedOutcomeId, name: leg.selectedOutcomeName }];
}

async function loadLeg(index: number) {
  const leg = legs.value[index];
  if (!leg) return;

  const url = leg.marketUrl.trim();
  if (!url) return;

  const preserveSelection =
    isEditMode.value || !!leg.selectedMarketId || !!leg.selectedOutcomeId;
  const prevSelectedMarketId = leg.selectedMarketId;
  const prevSelectedOutcomeId = leg.selectedOutcomeId;
  const prevSelectedOutcomeName = leg.selectedOutcomeName;
  const prevExportSelectedMarkets = [...leg.exportSelectedMarkets];
  const prevInsightsTab = getLegInsightsTab(leg);

  const initialSelectedIds =
    isInsightsMode.value && index === 0
      ? (props.initialSelectedMarketIds ?? [])
          .map((v) => String(v))
          .filter(Boolean)
          .slice(0, MAX_COMPARE_INSIGHTS_MARKETS)
      : [];

  leg.loading = true;
  leg.showChart = false;
  leg.chartData = [];
  leg.chartLoading = false;
  leg.chartError = null;
  leg.error = null;
  leg.title = "";
  leg.minDate = "";
  leg.marketOptions = [];
  leg.outcomeOptions = [];
  leg.showExport = false;
  leg.exportSelectedMarkets = [];
  leg.exportLoading = false;
  leg.exportError = null;

  if (!preserveSelection) {
    leg.selectedMarketId = "";
    leg.selectedOutcomeId = "";
    leg.selectedOutcomeName = "";
  }

  try {
    const { type, slug } = parsePolymarketUrl(url);
    const data = await getPolymarketDataBySlug(type, slug);

    const record = asRecord(data);
    leg.title = safeString(record?.title ?? record?.name ?? "");

    const options = normalizePolymarketToMarketOptions(data);
    leg.marketOptions = options;

    // Constrain chart/export date pickers so users can't select earlier than the event start.
    const minDate = extractEventStartDateMin(data);
    leg.minDate = minDate;
    if (!leg.exportToDate) {
      leg.exportToDate = formatIsoTodayUtc();
    }
    if (minDate) {
      if (!leg.exportFromDate || isBeforeIsoDate(leg.exportFromDate, minDate)) {
        leg.exportFromDate = minDate;
      }
      if (leg.exportToDate && isBeforeIsoDate(leg.exportToDate, minDate)) {
        leg.exportToDate = minDate;
      }
    }

    const applyInitialExportSelection = () => {
      if (initialSelectedIds.length === 0) return;
      const available = new Set(options.map((m) => m.id));
      const filtered = initialSelectedIds.filter((id) => available.has(id));
      if (filtered.length > 0) {
        leg.exportSelectedMarkets = filtered;
      }
    };

    const applyPreviousExportSelection = () => {
      if (prevExportSelectedMarkets.length === 0) return;
      const available = new Set(options.map((m) => m.id));
      const filtered = prevExportSelectedMarkets.filter((id) =>
        available.has(id),
      );
      if (filtered.length > 0) {
        leg.exportSelectedMarkets = filtered;
      }
    };

    const applySelectionFromOptions = (
      desiredMarketId: string,
      desiredOutcomeId: string,
    ) => {
      let market: MarketOption | undefined;
      if (desiredMarketId) {
        market = options.find((m) => m.id === desiredMarketId);
      }
      if (!market && desiredOutcomeId) {
        market = options.find((m) =>
          m.outcomes.some((o) => o.id === desiredOutcomeId),
        );
      }
      if (!market) return false;

      leg.selectedMarketId = market.id;
      leg.outcomeOptions = market.outcomes;

      if (desiredOutcomeId) {
        const outcome = market.outcomes.find((o) => o.id === desiredOutcomeId);
        if (outcome) {
          leg.selectedOutcomeId = outcome.id;
          leg.selectedOutcomeName = outcome.name;
          return true;
        }
      }

      const firstOutcome = market.outcomes[0];
      if (firstOutcome) {
        leg.selectedOutcomeId = firstOutcome.id;
        leg.selectedOutcomeName = firstOutcome.name;
      }
      return true;
    };

    const firstMarket = options[0];

    // In insights mode we sometimes open from a pre-selection (compare flow).
    // Prefer the first selected market as the active market so outcome matching is consistent.
    const preferredActiveMarketId = initialSelectedIds[0];
    const preferredActiveMarket = preferredActiveMarketId
      ? options.find((m) => m.id === preferredActiveMarketId)
      : undefined;

    if (preserveSelection && (prevSelectedMarketId || prevSelectedOutcomeId)) {
      const applied = applySelectionFromOptions(
        prevSelectedMarketId,
        prevSelectedOutcomeId,
      );
      if (!applied && firstMarket) {
        leg.selectedMarketId = firstMarket.id;
        leg.outcomeOptions = firstMarket.outcomes;
        const firstOutcome = firstMarket.outcomes[0];
        if (firstOutcome) {
          leg.selectedOutcomeId = firstOutcome.id;
          leg.selectedOutcomeName = firstOutcome.name;
        }
      }
    } else if (preferredActiveMarket) {
      leg.selectedMarketId = preferredActiveMarket.id;
      leg.outcomeOptions = preferredActiveMarket.outcomes;
      const firstOutcome = preferredActiveMarket.outcomes[0];
      if (firstOutcome) {
        leg.selectedOutcomeId = firstOutcome.id;
        leg.selectedOutcomeName = firstOutcome.name;
      }
    } else if (firstMarket) {
      leg.selectedMarketId = firstMarket.id;
      leg.outcomeOptions = firstMarket.outcomes;
      const firstOutcome = firstMarket.outcomes[0];
      if (firstOutcome) {
        leg.selectedOutcomeId = firstOutcome.id;
        leg.selectedOutcomeName = firstOutcome.name;
      }
    }

    applyInitialExportSelection();
    applyPreviousExportSelection();

    if (
      leg.selectedMarketId &&
      !leg.exportSelectedMarkets.includes(leg.selectedMarketId)
    ) {
      leg.exportSelectedMarkets = [
        leg.selectedMarketId,
        ...leg.exportSelectedMarkets,
      ];
    }

    // In compare insights mode, each leg represents a single selected market.
    // Keep that checkbox selected by default.
    if (isCompareInsightsMode.value && leg.selectedMarketId) {
      leg.exportSelectedMarkets = [leg.selectedMarketId];
    }

    if (
      preserveSelection &&
      !leg.selectedOutcomeName &&
      prevSelectedOutcomeName
    ) {
      leg.selectedOutcomeName = prevSelectedOutcomeName;
    }

    if (leg.marketOptions.length === 0) {
      leg.error = "No markets found for this URL.";
    } else if (isInsightsMode.value) {
      setLegInsightsTab(leg, prevInsightsTab ?? "chart");
    }
  } catch (err) {
    console.error("Failed to load Polymarket leg:", err);
    leg.error =
      err instanceof Error ? err.message : "Could not load market data.";
  } finally {
    leg.loading = false;
  }
}

function onMarketChange(index: number) {
  const leg = legs.value[index];
  if (!leg) return;

  // In edit mode we may render fallback options (no fetched markets yet).
  // Avoid wiping a preselected outcome until real options are loaded.
  if (leg.marketOptions.length === 0) return;

  const selected = leg.marketOptions.find((m) => m.id === leg.selectedMarketId);
  leg.outcomeOptions = selected?.outcomes ?? [];
  const selectedOutcomes = selected
    ? selectOutcomesForSelection(
        selected,
        leg.insightsOutcomeSelection,
        leg.selectedOutcomeId,
        leg.selectedOutcomeName,
        true,
      )
    : [];
  const preferredOutcome = selectedOutcomes[0] ?? leg.outcomeOptions[0];
  leg.selectedOutcomeId = preferredOutcome?.id ?? "";
  leg.selectedOutcomeName = preferredOutcome?.name ?? "";

  if (
    leg.selectedMarketId &&
    !leg.exportSelectedMarkets.includes(leg.selectedMarketId)
  ) {
    leg.exportSelectedMarkets = [
      leg.selectedMarketId,
      ...leg.exportSelectedMarkets.filter((id) => id !== leg.selectedMarketId),
    ];
  }
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

function onOutcomeChange(index: number) {
  const leg = legs.value[index];
  if (!leg) return;

  const options = getOutcomeSelectOptions(leg);
  const selected = options.find((o) => o.id === leg.selectedOutcomeId);
  if (selected) {
    leg.selectedOutcomeName = selected.name;
    const normalized = normalizeOutcomeNameForMatch(selected.name);
    if (normalized === "yes") {
      leg.insightsOutcomeSelection = "yes";
    } else if (normalized === "no") {
      leg.insightsOutcomeSelection = "no";
    }
  }
}

function getLegInsightsTab(leg: LegState): LegInsightsTab | null {
  if (leg.showExport) return "export";
  if (leg.showChart) return "chart";
  return null;
}

function setLegInsightsTab(leg: LegState, tab: LegInsightsTab) {
  leg.showChart = tab === "chart";
  leg.showExport = tab === "export";
}

const canProceed = computed(() => {
  if (step.value === 1) {
    if (isSum.value) {
      return Number.isFinite(threshold.value) && threshold.value > 0;
    }
    return (
      Number.isFinite(targetPrice.value) &&
      targetPrice.value >= 0 &&
      targetPrice.value <= 1
    );
  }

  if (step.value === 2) {
    return legs.value.every(
      (l) => l.marketUrl.trim() && l.selectedMarketId && l.selectedOutcomeId,
    );
  }

  return true;
});

const canSubmit = computed(() => canProceed.value);

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

type ExportFrequency = "minutely" | "hourly" | "daily" | "weekly" | "monthly";

function normalizeExportFrequency(value: string): ExportFrequency {
  const v = (value ?? "").toLowerCase().trim();
  if (v === "minutely") return "minutely";
  if (v === "hourly") return "hourly";
  if (v === "daily") return "daily";
  if (v === "weekly") return "weekly";
  if (v === "monthly") return "monthly";
  return "daily";
}

function unixSecondsFromDateInput(dateStr: string, endOfDay: boolean): number {
  const raw = (dateStr ?? "").trim();
  if (!raw) return 0;

  // Interpret as UTC date to avoid local timezone shifting.
  const [year, month, day] = raw.split("-").map((p) => Number(p));
  if (!year || !month || !day) return 0;

  const ms = endOfDay
    ? Date.UTC(year, month - 1, day, 23, 59, 59)
    : Date.UTC(year, month - 1, day, 0, 0, 0);

  return Math.floor(ms / 1000);
}

function downloadCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function bucketBySeconds(
  points: PolymarketPriceHistoryPoint[],
  bucketSeconds: number,
): PolymarketPriceHistoryPoint[] {
  const lastByBucket = new Map<number, PolymarketPriceHistoryPoint>();
  for (const pt of points) {
    const bucket = Math.floor(pt.t / bucketSeconds);
    lastByBucket.set(bucket, pt);
  }
  return Array.from(lastByBucket.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucket, pt]) => ({
      // Label the bucket at the *end* (next boundary) to match Polymarket export.
      t: (bucket + 1) * bucketSeconds,
      p: pt.p,
    }));
}

function downsampleHistory(
  history: PolymarketPriceHistoryPoint[],
  frequency: ExportFrequency,
): PolymarketPriceHistoryPoint[] {
  const points = [...history].sort((a, b) => a.t - b.t);
  if (points.length === 0) return points;

  if (frequency === "minutely") return bucketBySeconds(points, 60);
  if (frequency === "hourly") return bucketBySeconds(points, 60 * 60);
  if (frequency === "daily") return bucketBySeconds(points, 60 * 60 * 24);
  if (frequency === "weekly") return bucketBySeconds(points, 60 * 60 * 24 * 7);

  // monthly: calendar-month grouping in UTC
  const lastByMonth = new Map<
    string,
    { year: number; monthIndex: number; pt: PolymarketPriceHistoryPoint }
  >();
  for (const pt of points) {
    const d = new Date(pt.t * 1000);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
      2,
      "0",
    )}`;
    lastByMonth.set(key, {
      year: d.getUTCFullYear(),
      monthIndex: d.getUTCMonth(),
      pt,
    });
  }
  return Array.from(lastByMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, { year, monthIndex, pt }]) => ({
      // Label month bucket at the start of next month (UTC)
      t: Math.floor(Date.UTC(year, monthIndex + 1, 1, 0, 0, 0) / 1000),
      p: pt.p,
    }));
}

function normalizeOutcomeNameForMatch(value: string): string {
  return (value ?? "").trim().toLowerCase();
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

const singleMarketGenerationPromises = new WeakMap<
  LegState,
  Promise<boolean>
>();

function ensureSingleMarketChartData(leg: LegState): Promise<boolean> {
  const existing = singleMarketGenerationPromises.get(leg);
  if (existing) return existing;

  const generation = generateSingleMarketChartData(leg);
  singleMarketGenerationPromises.set(leg, generation);
  void generation.finally(() => {
    if (singleMarketGenerationPromises.get(leg) === generation) {
      singleMarketGenerationPromises.delete(leg);
    }
  });
  return generation;
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

function stripPolymarketEventUrl(input: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";

  const toAbsolute = (value: string) => {
    if (value.startsWith("/")) return `https://polymarket.com${value}`;
    if (value.startsWith("http://") || value.startsWith("https://"))
      return value;
    if (value.startsWith("polymarket.com/")) return `https://${value}`;
    return value;
  };

  const absolute = toAbsolute(raw);

  try {
    const url = new URL(absolute);
    if (!/polymarket\.com$/i.test(url.hostname)) return raw;

    // Desired canonical form: https://polymarket.com/event/<event-slug>/
    const parts = url.pathname.split("/").filter(Boolean);
    const eventIdx = parts.indexOf("event");
    if (eventIdx === -1 || !parts[eventIdx + 1]) return raw;

    const eventSlug = parts[eventIdx + 1];
    return `https://polymarket.com/event/${eventSlug}`;
  } catch {
    return raw;
  }
}

function handleBackOrClose() {
  if (isInsightsMode.value || step.value === 1) {
    emit("close");
    return;
  }
  step.value -= 1;
}

async function handleSubmit() {
  if (isSubmitting.value) return;
  submitError.value = "";

  const legsReady = legs.value.every(
    (l) => l.marketUrl.trim() && l.selectedOutcomeId && l.selectedOutcomeName,
  );

  if (!legsReady) {
    submitError.value = "Please complete all legs.";
    return;
  }

  try {
    isSubmitting.value = true;

    if (isEditMode.value) {
      const alertId = props.initialAlert?.id;
      if (alertId === undefined || alertId === null || alertId === "") {
        throw new Error("Missing alert id");
      }

      if (isSum.value) {
        const firstLeg = legs.value[0];
        const existing = props.initialAlert;

        const topMarketUrl = stripPolymarketEventUrl(
          existing?.market_url?.trim() || firstLeg?.marketUrl?.trim() || "",
        );
        const topMarketId = existing?.market_id || "sum";
        const topOutcomeId =
          existing?.outcome_id || firstLeg?.selectedOutcomeId || "";
        const topOutcomeName =
          existing?.outcome_name || firstLeg?.selectedOutcomeName || "";

        await updateAlert(alertId, {
          alert_type: "sum",
          operator: operator.value,
          threshold: threshold.value,
          direction: direction.value,
          market_url: topMarketUrl,
          market_id: topMarketId,
          outcome_id: topOutcomeId,
          outcome_name: topOutcomeName,
          target_price: threshold.value,
          legs: legs.value.map((l) => ({
            market_url: stripPolymarketEventUrl(l.marketUrl.trim()),
            outcome_id: l.selectedOutcomeId,
            outcome_name: l.selectedOutcomeName,
          })),
          notify_discord: notifyDiscord.value,
          discord_webhook: discordWebhook.value || undefined,
          repeat: repeat.value,
        });
      } else {
        const l = legs.value[0];
        await updateAlert(alertId, {
          alert_type: "single",
          market_url: stripPolymarketEventUrl(l.marketUrl.trim()),
          market_id: l.selectedMarketId || undefined,
          outcome_id: l.selectedOutcomeId,
          outcome_name: l.selectedOutcomeName,
          direction: direction.value,
          operator: singleOperator.value,
          threshold: targetPrice.value,
          target_price: targetPrice.value,
          notify_discord: notifyDiscord.value,
          discord_webhook: discordWebhook.value || undefined,
          repeat: repeat.value,
        });
      }

      emit("updated");
      emit("close");
      return;
    }

    if (isSum.value) {
      await createAlert({
        alert_type: "sum",
        operator: operator.value,
        threshold: threshold.value,
        direction: direction.value,
        legs: legs.value.map((l) => ({
          market_url: stripPolymarketEventUrl(l.marketUrl.trim()),
          outcome_id: l.selectedOutcomeId,
          outcome_name: l.selectedOutcomeName,
        })),
        notify_discord: notifyDiscord.value,
        discord_webhook: discordWebhook.value || undefined,
        repeat: repeat.value,
      });
    } else {
      const l = legs.value[0];
      await createAlert({
        market_url: stripPolymarketEventUrl(l.marketUrl.trim()),
        market_id: l.selectedMarketId || undefined,
        outcome_id: l.selectedOutcomeId,
        outcome_name: l.selectedOutcomeName,
        direction: direction.value,
        operator: singleOperator.value,
        target_price: targetPrice.value,
        notify_discord: notifyDiscord.value,
        threshold: targetPrice.value,
        discord_webhook: discordWebhook.value || undefined,
        repeat: repeat.value,
      });
    }

    emit("created");
    emit("close");
  } catch (err) {
    console.error("Failed to create alert:", err);
    submitError.value =
      err instanceof Error
        ? err.message
        : isEditMode.value
          ? "Failed to update alert."
          : "Failed to create alert.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>
