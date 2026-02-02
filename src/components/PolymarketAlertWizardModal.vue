<template>
  <Dialog
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
              ? "Export data and generate charts for a market."
              : isEditMode
                ? "Update an existing single-outcome alert or a 2/3-market sum alert."
                : "Create a single-outcome alert or a 2/3-market sum alert."
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <!-- Step indicator -->
        <!-- <div class="text-sm text-muted-foreground">Step {{ step }} of 3</div> -->

        <!-- Step 1: Configure -->
        <div v-if="!isInsightsMode && step === 1" class="grid gap-4">
          <div class="grid gap-2">
            <Label>Alert Type</Label>
            <Select v-model="legsCountString">
              <SelectTrigger>
                <SelectValue placeholder="Select alert type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="1">Single market</SelectItem>
                  <SelectItem value="2">Sum of 2 markets (dyad)</SelectItem>
                  <SelectItem value="3">Sum of 3 markets (triad)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div v-if="isSum" class="grid gap-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="grid gap-2">
                <Label>Hold</Label>
                <Input
                  v-model.number="threshold"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.95"
                />
              </div>
              <div class="grid gap-2">
                <Label>Operator</Label>
                <Select v-model="operator">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="lt">&lt;</SelectItem>
                      <SelectItem value="lte">&le;</SelectItem>
                      <SelectItem value="gt">&gt;</SelectItem>
                      <SelectItem value="gte">&ge;</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div class="grid gap-2">
                <Label>Direction</Label>
                <Select v-model="direction">
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="grid gap-2">
              <Label>Target Price</Label>
              <Input
                v-model.number="targetPrice"
                type="number"
                min="0"
                max="1"
                step="0.01"
                placeholder="0.95"
              />
            </div>

            <div class="grid gap-2">
              <Label>Operator</Label>
              <Select v-model="singleOperator">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="lt">&lt;</SelectItem>
                    <SelectItem value="lte">&le;</SelectItem>
                    <SelectItem value="gt">&gt;</SelectItem>
                    <SelectItem value="gte">&ge;</SelectItem>
                    <SelectItem value="eq">=</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div class="grid gap-2">
              <Label>Direction</Label>
              <Select v-model="direction">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="buy">Buy</SelectItem>
                    <SelectItem value="sell">Sell</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="grid gap-3">
            <div class="flex items-center gap-2">
              <Checkbox id="notify_discord" v-model="notifyDiscord" />
              <Label for="notify_discord">Notify Discord</Label>
            </div>

            <div v-if="notifyDiscord" class="grid gap-2">
              <Label>Discord Webhook (optional)</Label>
              <Input
                v-model="discordWebhook"
                type="url"
                placeholder="https://discord.com/api/webhooks/..."
              />
            </div>

            <div class="flex items-center gap-2">
              <Checkbox id="repeat" v-model="repeat" />
              <Label for="repeat">Repeat</Label>
            </div>
          </div>
        </div>

        <!-- Step 2: Select legs -->
        <div v-else-if="step === 2" class="grid gap-5">
          <div
            v-if="isCompareInsightsMode"
            class="border rounded p-4 bg-muted/10 grid gap-3"
          >
            <div class="font-semibold">Combined Comparison Chart</div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="grid gap-1">
                <Label>From date</Label>
                <Input
                  v-model="compareFromDate"
                  type="date"
                  :min="compareMinDate || undefined"
                />
              </div>
              <div class="grid gap-1">
                <Label>To date</Label>
                <Input
                  v-model="compareToDate"
                  type="date"
                  :min="compareMinDate || undefined"
                />
              </div>
              <div class="grid gap-1">
                <Label>Frequency</Label>
                <Select v-model="compareFrequency">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutely">Minutely</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div class="grid gap-2">
              <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
                <Button
                  :disabled="isCombinedCompareChartDisabled"
                  @click="handleViewCombinedCompareChart"
                >
                  <span v-if="compareChartLoading">Loading…</span>
                  <span v-else>Generate Combined Data</span>
                </Button>
                <Button
                  variant="outline"
                  :disabled="
                    compareChartLoading ||
                    compareChartData.length === 0 ||
                    compareSaveLoading
                  "
                  @click="handleSendCombinedCompareChartToNotebooks"
                >
                  <span v-if="compareSaveLoading">Sending…</span>
                  <span v-else>Save to Jupyter</span>
                </Button>
              </div>

              <Dialog v-model:open="compareFilenameDialogOpen">
                <DialogContent class="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>Save to Jupyter</DialogTitle>
                    <DialogDescription>
                      Choose a filename for the exported data.
                    </DialogDescription>
                  </DialogHeader>

                  <div class="grid gap-2">
                    <Label>Filename</Label>
                    <Input
                      v-model="compareFilenameInput"
                      type="text"
                      placeholder="polymarket-compare-YYYY-MM-DD.json"
                      :disabled="compareSaveLoading"
                    />
                    <p v-if="compareFilenameError" class="text-sm text-red-600">
                      {{ compareFilenameError }}
                    </p>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      :disabled="compareSaveLoading"
                      @click="compareFilenameDialogOpen = false"
                    >
                      Cancel
                    </Button>
                    <Button
                      :disabled="compareSaveLoading"
                      @click="handleConfirmSendCombinedCompareChartToNotebooks"
                    >
                      <span v-if="compareSaveLoading">Sending…</span>
                      <span v-else>Send</span>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <p v-if="compareChartError" class="text-sm text-red-600">
                {{ compareChartError }}
              </p>
              <p v-if="compareSaveError" class="text-sm text-red-600">
                {{ compareSaveError }}
              </p>
              <p v-if="compareSaveSuccessPath" class="text-sm text-green-700">
                Saved to JupyterLite: {{ compareSaveSuccessPath }}
              </p>
            </div>

            <div v-if="compareChartData.length > 0" class="mt-2">
              <PriceScatterChart
                :series="compareChartData"
                title="Comparison Price History"
                x-axis-name="Date"
                y-axis-name="Value"
                height="520px"
              />
            </div>
          </div>

          <div
            v-for="(leg, idx) in legs"
            :key="idx"
            class="border rounded-md p-4 grid gap-3"
          >
            <div class="font-medium">Leg {{ idx + 1 }}</div>

            <div class="grid gap-2">
              <Label>Market/Event URL</Label>
              <div class="flex gap-2">
                <Input
                  v-model="leg.marketUrl"
                  type="text"
                  placeholder="https://polymarket.com/event/... or /market/..."
                />
                <Button
                  :disabled="leg.loading || !leg.marketUrl.trim()"
                  @click="loadLeg(idx)"
                >
                  <span v-if="leg.loading">Loading…</span>
                  <span v-else>Load</span>
                </Button>
              </div>
              <p v-if="leg.error" class="text-sm text-red-600">
                {{ leg.error }}
              </p>
              <p v-if="leg.title" class="text-sm text-muted-foreground">
                {{ leg.title }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label>Market</Label>
                <Select
                  v-model="leg.selectedMarketId"
                  :disabled="getMarketSelectOptions(leg).length === 0"
                  @update:model-value="() => onMarketChange(idx)"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="m in getMarketSelectOptions(leg)"
                        :key="m.id"
                        :value="m.id"
                      >
                        {{ m.title }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid gap-2">
                <Label>Outcome</Label>
                <Select
                  v-model="leg.selectedOutcomeId"
                  :disabled="getOutcomeSelectOptions(leg).length === 0"
                  @update:model-value="() => onOutcomeChange(idx)"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="o in getOutcomeSelectOptions(leg)"
                        :key="o.id"
                        :value="o.id"
                      >
                        {{ o.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              v-if="leg.marketOptions.length > 0"
              class="flex justify-end gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                @click="leg.showChart = !leg.showChart"
              >
                {{ leg.showChart ? "Hide Chart" : "View Chart" }}
              </Button>
              <Button
                variant="outline"
                size="sm"
                @click="leg.showExport = !leg.showExport"
              >
                {{ leg.showExport ? "Hide Data Export" : "Data Export" }}
              </Button>
            </div>

            <div
              v-if="leg.showChart"
              class="border rounded p-3 bg-muted/20 grid gap-3"
            >
              <div class="font-semibold">View Price History Chart</div>
              <div class="grid grid-cols-2 gap-3">
                <div class="grid gap-1">
                  <Label>From date</Label>
                  <Input
                    v-model="leg.exportFromDate"
                    type="date"
                    :min="leg.minDate || undefined"
                  />
                </div>
                <div class="grid gap-1">
                  <Label>To date</Label>
                  <Input
                    v-model="leg.exportToDate"
                    type="date"
                    :min="leg.minDate || undefined"
                  />
                </div>
              </div>

              <div class="grid gap-1">
                <Label>Frequency</Label>
                <Select v-model="leg.exportFrequency">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutely">Minutely</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid gap-2">
                <Label>Markets to display</Label>
                <div class="flex items-center gap-2">
                  <Checkbox
                    :id="`chart-select-all-${idx}`"
                    :model-value="exportSelectAllState(leg)"
                    @update:model-value="(v) => toggleAllExportMarkets(leg, v)"
                  />
                  <Label
                    :for="`chart-select-all-${idx}`"
                    class="text-sm cursor-pointer"
                    >Select All</Label
                  >
                </div>
                <div class="grid grid-cols-2 gap-2 pl-2">
                  <div
                    v-for="(market, marketIdx) in leg.marketOptions"
                    :key="market.id"
                    class="flex items-center gap-2"
                  >
                    <Checkbox
                      :id="`chart-market-${idx}-${marketIdx}`"
                      :model-value="
                        leg.exportSelectedMarkets.includes(market.id)
                      "
                      @update:model-value="
                        (v) => toggleExportMarket(leg, market.id, v)
                      "
                    />
                    <Label
                      :for="`chart-market-${idx}-${marketIdx}`"
                      class="text-sm cursor-pointer"
                      >{{ market.title }}</Label
                    >
                  </div>
                </div>
              </div>

              <div class="grid gap-2">
                <Button
                  :disabled="leg.chartLoading"
                  @click="handleViewChart(leg)"
                >
                  <span v-if="leg.chartLoading">Loading…</span>
                  <span v-else>Generate Chart</span>
                </Button>

                <p v-if="leg.chartError" class="text-sm text-red-600">
                  {{ leg.chartError }}
                </p>
              </div>

              <div v-if="leg.chartData.length > 0" class="mt-4">
                <PriceScatterChart
                  :series="leg.chartData"
                  :title="`${leg.title || 'Market'} - Price History`"
                  height="500px"
                />
              </div>
            </div>

            <div
              v-if="leg.showExport"
              class="border rounded p-3 bg-muted/20 grid gap-3"
            >
              <div class="font-semibold">Download Price History</div>
              <div class="grid grid-cols-2 gap-3">
                <div class="grid gap-1">
                  <Label>From date</Label>
                  <Input
                    v-model="leg.exportFromDate"
                    type="date"
                    :min="leg.minDate || undefined"
                  />
                </div>
                <div class="grid gap-1">
                  <Label>To date</Label>
                  <Input
                    v-model="leg.exportToDate"
                    type="date"
                    :min="leg.minDate || undefined"
                  />
                </div>
              </div>

              <div class="grid gap-1">
                <Label>Frequency</Label>
                <Select v-model="leg.exportFrequency">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutely">Minutely</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="grid gap-2">
                <Label>Options</Label>
                <div class="flex items-center gap-2">
                  <Checkbox
                    :id="`select-all-${idx}`"
                    :model-value="exportSelectAllState(leg)"
                    @update:model-value="(v) => toggleAllExportMarkets(leg, v)"
                  />
                  <Label
                    :for="`select-all-${idx}`"
                    class="text-sm cursor-pointer"
                    >Select All</Label
                  >
                </div>
                <div class="grid grid-cols-2 gap-2 pl-2">
                  <div
                    v-for="(market, marketIdx) in leg.marketOptions"
                    :key="market.id"
                    class="flex items-center gap-2"
                  >
                    <Checkbox
                      :id="`market-${idx}-${marketIdx}`"
                      :model-value="
                        leg.exportSelectedMarkets.includes(market.id)
                      "
                      @update:model-value="
                        (v) => toggleExportMarket(leg, market.id, v)
                      "
                    />
                    <Label
                      :for="`market-${idx}-${marketIdx}`"
                      class="text-sm cursor-pointer"
                      >{{ market.title }}</Label
                    >
                  </div>
                </div>
              </div>

              <div class="grid gap-2">
                <Button
                  :disabled="leg.exportLoading"
                  @click="handleDownloadExport(leg)"
                >
                  <span v-if="leg.exportLoading">Downloading…</span>
                  <span v-else>Download (.csv)</span>
                </Button>

                <p v-if="leg.exportError" class="text-sm text-red-600">
                  {{ leg.exportError }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Review -->
        <div v-else-if="!isInsightsMode" class="grid gap-3">
          <div class="rounded-md border p-4 text-sm grid gap-2">
            <div class="font-medium">Summary</div>

            <div v-if="isSum">
              <div>Type: Sum ({{ legsCount }} legs)</div>
              <div>Direction: {{ direction.toUpperCase() }}</div>
              <div>
                Trigger: p1 + … + p{{ legsCount }} {{ operator }}
                {{ threshold }}
              </div>
            </div>
            <div v-else>
              <div>Type: Single</div>
              <div>
                Trigger: {{ direction.toUpperCase() }}
                {{ operatorSymbol(singleOperator) }}
                {{ targetPrice }}
              </div>
            </div>

            <div class="break-all">
              Notify Discord: {{ notifyDiscord ? "Yes" : "No" }}
            </div>
            <div v-if="notifyDiscord && discordWebhook" class="break-all">
              Webhook: {{ discordWebhook }}
            </div>
            <div>Repeat: {{ repeat ? "Yes" : "No" }}</div>

            <div class="pt-2">
              <div class="font-medium">Legs</div>
              <div v-for="(leg, idx) in legs" :key="idx">
                {{ idx + 1 }}. {{ leg.marketUrl }} —
                {{ leg.selectedOutcomeName || "—" }}
              </div>
            </div>
          </div>

          <p v-if="submitError" class="text-sm text-red-600">
            {{ submitError }}
          </p>
        </div>
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAlert,
  getPolymarketDataBySlug,
  getPolymarketPricesHistory,
  type PolymarketPriceHistoryPoint,
  type AlertOperator,
  updateAlert,
} from "@/api/polymarket";
import PriceScatterChart, {
  type ScatterSeries,
  type PriceDataPoint,
} from "@/components/Charts/PriceScatterChart.vue";
import {
  buildSafeJsonFilename,
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

interface Props {
  isOpen: boolean;
  mode?: "create" | "edit";
  initialAlert?: ExistingAlert | null;
  variant?: "alert" | "insights";
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
const isCompareInsightsMode = computed(() => {
  if (!isInsightsMode.value) return false;
  return (props.initialCompareMarkets?.length ?? 0) > 0;
});

const compareFromDate = ref<string>("");
const compareToDate = ref<string>("");
const compareFrequency = ref<string>("daily");
const compareChartData = ref<ScatterSeries[]>([]);
const compareChartLoading = ref<boolean>(false);
const compareChartError = ref<string | null>(null);

const compareSaveLoading = ref<boolean>(false);
const compareSaveError = ref<string | null>(null);
const compareSaveSuccessPath = ref<string>("");

const compareFilenameDialogOpen = ref<boolean>(false);
const compareFilenameInput = ref<string>("");
const compareFilenameError = ref<string | null>(null);

const isCombinedCompareChartDisabled = computed(() => {
  if (compareChartLoading.value) return true;
  if (!isCompareInsightsMode.value) return true;
  // Disable if any selected event/market is still loading or hasn't loaded yet.
  return legs.value.some(
    (leg) => leg.loading || (leg.marketOptions?.length ?? 0) === 0,
  );
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
    .slice(0, 3);
}

async function loadCompareLegs() {
  const items = normalizeCompareInputs();
  if (items.length === 0) return;

  // Build one leg per selected market.
  legsCount.value = (items.length === 3 ? 3 : items.length === 2 ? 2 : 1) as
    | 1
    | 2
    | 3;
  step.value = 2;

  legs.value = items.map((item) => {
    const leg = createEmptyLeg();
    leg.marketUrl = item.marketUrl;
    leg.compareLabel = item.label;
    // Preselect the market so loadLeg() preserves it and picks outcomes.
    leg.selectedMarketId = item.marketId;
    // Preselect the checkbox in chart/export panels.
    leg.exportSelectedMarkets = [item.marketId];
    // Convenience: open the chart/export panels immediately.
    leg.showChart = true;
    leg.showExport = true;
    return leg;
  });

  // Fire-and-forget loads; each leg handles its own errors.
  void Promise.allSettled(legs.value.map((_, idx) => loadLeg(idx)));
}

const step = ref<1 | 2 | 3>(1);
const legsCount = ref<1 | 2 | 3>(1);
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
  if (!isCompareInsightsMode.value) return "";
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
    if (!isCompareInsightsMode.value) return;
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

function buildCompareSeriesName(leg: LegState): string {
  const explicit = (leg.compareLabel ?? "").trim();
  if (explicit) return explicit;

  const market = leg.marketOptions.find((m) => m.id === leg.selectedMarketId);
  const marketTitle = (market?.title ?? "").trim();
  const eventTitle = (leg.title ?? "").trim();

  if (marketTitle && eventTitle) return `${marketTitle} — ${eventTitle}`;
  return marketTitle || eventTitle || "Market";
}

async function handleViewCombinedCompareChart() {
  if (compareChartLoading.value) return;

  compareChartError.value = null;
  compareChartData.value = [];
  compareSaveError.value = null;
  compareSaveSuccessPath.value = "";

  if (!isCompareInsightsMode.value) return;

  const fromTs = compareFromDate.value
    ? unixSecondsFromDateInput(compareFromDate.value, false)
    : 0;
  const toTs = compareToDate.value
    ? unixSecondsFromDateInput(compareToDate.value, true)
    : null;

  if (toTs !== null && fromTs && toTs < fromTs) {
    compareChartError.value = "To date must be after From date.";
    return;
  }

  const frequency = normalizeExportFrequency(compareFrequency.value);

  const prepared = legs.value
    .map((leg) => {
      const market = leg.marketOptions.find(
        (m) => m.id === leg.selectedMarketId,
      );
      if (!market) return null;
      const outcomeId = (leg.selectedOutcomeId ?? "").trim();
      const outcomeName = (leg.selectedOutcomeName ?? "").trim();
      if (!outcomeId || !outcomeName) return null;
      return {
        seriesName: buildCompareSeriesName(leg),
        outcomeId,
      };
    })
    .filter(Boolean) as Array<{ seriesName: string; outcomeId: string }>;

  if (prepared.length === 0) {
    compareChartError.value = "Load markets first (or check selections).";
    return;
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
        name: meta.seriesName,
        data,
      });
    }

    if (series.length === 0 || series.every((s) => s.data.length === 0)) {
      compareChartError.value =
        failedCount > 0
          ? "No data returned (some requests failed)."
          : "No data returned for the selected range.";
      return;
    }

    compareChartData.value = series;
    if (failedCount > 0) {
      compareChartError.value = `Chart displayed, but ${failedCount} request(s) failed.`;
    }
  } catch (err) {
    console.error("Failed to load combined compare chart:", err);
    compareChartError.value =
      err instanceof Error ? err.message : "Failed to load chart data.";
  } finally {
    compareChartLoading.value = false;
  }
}

function buildCombinedCompareExportJson(): string {
  const payload = {
    type: "polymarket_combined_compare",
    generated_at: new Date().toISOString(),
    range: {
      from_date: compareFromDate.value || null,
      to_date: compareToDate.value || null,
      frequency: compareFrequency.value || "daily",
    },
    // Store in a notebook-friendly shape.
    // Each series becomes `{ name, points: [{t,p}] }`.
    series: compareChartData.value.map((s) => ({
      name: s.name,
      points: (s.data ?? []).map((pt) => ({
        t: pt.timestamp,
        p: pt.price,
      })),
    })),
  };

  return JSON.stringify(payload, null, 2);
}

function defaultCombinedCompareNotebookFilename(): string {
  const base = `polymarket-compare-${new Date().toISOString().slice(0, 10)}`;
  return buildSafeJsonFilename(base);
}

function normalizeJsonFilename(
  input: string,
  fallbackFilename: string,
): string {
  const raw = (input ?? "").trim();
  const candidate = raw || fallbackFilename;

  // Disallow directories; keep only the last path segment.
  const justName = candidate.split(/[/\\]/).pop() ?? "";
  const noExt = justName.replace(/\.json$/i, "").trim();
  if (!noExt) throw new Error("Filename cannot be empty.");
  return buildSafeJsonFilename(noExt);
}

async function performSendCombinedCompareChartToNotebooks(
  filenameInput: string,
) {
  if (compareSaveLoading.value) return;

  compareSaveError.value = null;
  compareSaveSuccessPath.value = "";

  if (compareChartData.value.length === 0) {
    compareSaveError.value = "Generate the combined chart first.";
    return;
  }

  const fallback = defaultCombinedCompareNotebookFilename();
  let filename: string;
  try {
    filename = normalizeJsonFilename(filenameInput, fallback);
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
      content: buildCombinedCompareExportJson(),
      mimetype: "application/json",
    });

    // Best-effort: if JupyterLite already initialized, sync immediately.
    // Otherwise it stays queued until the Notebooks view initializes JupyterLite.
    const sync = await syncQueuedNotebookFilesToJupyterLite();
    compareSaveSuccessPath.value = sync.skippedBecauseNotInitialized
      ? `${path} (queued)`
      : `${path}`;

    compareFilenameDialogOpen.value = false;
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
    compareSaveError.value = "Generate the combined chart first.";
    return;
  }

  compareFilenameError.value = null;
  compareFilenameInput.value = defaultCombinedCompareNotebookFilename();
  compareFilenameDialogOpen.value = true;
}

async function handleConfirmSendCombinedCompareChartToNotebooks() {
  compareFilenameError.value = null;
  await performSendCombinedCompareChartToNotebooks(compareFilenameInput.value);
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

    const resetToDefaults = () => {
      step.value = 1;
      legsCount.value = 1;
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

      if (isCompareInsightsMode.value) {
        // Auto-load compare selection into multiple legs.
        void loadCompareLegs();
        return;
      }

      const url = (props.initialMarketUrl ?? "").trim();
      if (url) {
        legs.value[0].marketUrl = url;
        // Auto-load so chart/export can be used immediately.
        // Fire and forget; errors show on the leg.
        void loadLeg(0);
      }
      return;
    }

    if (!isEditMode.value || !props.initialAlert) {
      resetToDefaults();
      return;
    }

    applyInitialAlert(props.initialAlert);
  },
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
    if (!isCompareInsightsMode.value) return;
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
    isEditMode.value || (isCompareInsightsMode.value && !!leg.selectedMarketId);
  const prevSelectedMarketId = leg.selectedMarketId;
  const prevSelectedOutcomeId = leg.selectedOutcomeId;
  const prevSelectedOutcomeName = leg.selectedOutcomeName;

  const initialSelectedIds =
    isInsightsMode.value && index === 0
      ? (props.initialSelectedMarketIds ?? [])
          .map((v) => String(v))
          .filter(Boolean)
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
  const firstOutcome = leg.outcomeOptions[0];
  leg.selectedOutcomeId = firstOutcome?.id ?? "";
  leg.selectedOutcomeName = firstOutcome?.name ?? "";
}

function onOutcomeChange(index: number) {
  const leg = legs.value[index];
  if (!leg) return;

  const options = getOutcomeSelectOptions(leg);
  const selected = options.find((o) => o.id === leg.selectedOutcomeId);
  if (selected) {
    leg.selectedOutcomeName = selected.name;
  }
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

function csvQuote(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
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

function selectExportOutcomeForMarket(
  market: MarketOption,
  desiredOutcomeName: string,
  desiredOutcomeIdForActiveMarket: string,
  isActiveMarket: boolean,
): OutcomeOption | null {
  const outcomes = market.outcomes ?? [];
  if (outcomes.length === 0) return null;

  if (isActiveMarket && desiredOutcomeIdForActiveMarket) {
    const byId = outcomes.find((o) => o.id === desiredOutcomeIdForActiveMarket);
    if (byId) return byId;
  }

  const desiredName = normalizeOutcomeNameForMatch(desiredOutcomeName);
  if (desiredName) {
    const byName = outcomes.find(
      (o) => normalizeOutcomeNameForMatch(o.name) === desiredName,
    );
    if (byName) return byName;
  }

  // If we can't match, don't guess (avoids exporting the wrong side).
  return null;
}

function selectOutcomeForLegAndMarket(
  leg: LegState,
  market: MarketOption,
  desiredOutcomeName: string,
  desiredOutcomeIdForActiveMarket: string,
  isActiveMarket: boolean,
): OutcomeOption | null {
  if (leg.usePerMarketDefaultOutcome) {
    const outcomes = market.outcomes ?? [];
    if (outcomes.length === 0) return null;
    const defId = (market.defaultOutcomeId ?? "").trim();
    if (defId) {
      return outcomes.find((o) => o.id === defId) ?? outcomes[0];
    }
    // fallback
    const yes = outcomes.find(
      (o) => (o.name ?? "").trim().toLowerCase() === "yes",
    );
    return yes ?? outcomes[0];
  }

  return selectExportOutcomeForMarket(
    market,
    desiredOutcomeName,
    desiredOutcomeIdForActiveMarket,
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

    const tasks = marketIds
      .map((marketId) => {
        const market = leg.marketOptions.find((m) => m.id === marketId);
        if (!market) return null;

        const isActiveMarket = marketId === leg.selectedMarketId;
        const outcome = selectOutcomeForLegAndMarket(
          leg,
          market,
          desiredOutcomeName,
          desiredOutcomeIdForActiveMarket,
          isActiveMarket,
        );
        if (!outcome) return null;

        return async () => {
          // IMPORTANT: the `market=` query param for prices-history is the CLOB token id.
          const res = await getPolymarketPricesHistory({
            market: outcome.id,
            startTs: fromTs,
          });
          return {
            marketId,
            marketTitle: market.title ?? marketId,
            outcomeId: outcome.id,
            outcomeName: outcome.name,
            history: res.history ?? [],
          };
        };
      })
      .filter(Boolean) as Array<
      () => Promise<{
        marketId: string;
        marketTitle: string;
        outcomeId: string;
        outcomeName: string;
        history: PolymarketPriceHistoryPoint[];
      }>
    >;

    const skippedCount = marketIds.length - tasks.length;
    const results = await Promise.allSettled(tasks.map((t) => t()));

    // Build Polymarket-style pivot export:
    // Date (UTC), Timestamp (UTC), <Market Title 1>, <Market Title 2>, ...
    const titleByMarketId = new Map(
      leg.marketOptions.map((m) => [m.id, m.title] as const),
    );

    const desiredTitles: string[] = [];
    const used = new Map<string, number>();
    for (const mid of marketIds) {
      const base = titleByMarketId.get(mid) ?? mid;
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      desiredTitles.push(count === 1 ? base : `${base} (${mid})`);
    }

    const seriesByTitle = new Map<string, Map<number, number>>();
    const timestamps = new Set<number>();

    let failedCount = 0;
    // `skippedCount` = markets where we couldn't confidently pick the desired outcome.

    for (const r of results) {
      if (r.status === "rejected") {
        failedCount += 1;
        continue;
      }

      const { marketId, marketTitle } = r.value;

      // Column title should match UI selection order/titles; fall back safely.
      const baseTitle =
        titleByMarketId.get(marketId) ?? marketTitle ?? marketId;
      const titleIndex = marketIds.indexOf(marketId);
      const columnTitle =
        titleIndex >= 0 ? desiredTitles[titleIndex] : baseTitle;

      let history = Array.isArray(r.value.history) ? r.value.history : [];
      if (fromTs) {
        history = history.filter((pt) => pt.t >= fromTs);
      }
      if (toTs !== null) {
        history = history.filter((pt) => pt.t <= toTs);
      }

      history = downsampleHistory(history, frequency);

      let series = seriesByTitle.get(columnTitle);
      if (!series) {
        series = new Map<number, number>();
        seriesByTitle.set(columnTitle, series);
      }

      for (const pt of history) {
        // pt.t is the labeled bucket timestamp in seconds (UTC).
        timestamps.add(pt.t);
        series.set(pt.t, pt.p);
      }
    }

    if (timestamps.size === 0) {
      leg.exportError =
        failedCount > 0
          ? "No data returned (some requests failed)."
          : "No data returned for the selected range.";
      return;
    }

    const sortedTimestamps = Array.from(timestamps).sort((a, b) => a - b);

    const header = [
      csvQuote("Date (UTC)"),
      csvQuote("Timestamp (UTC)"),
      ...desiredTitles.map((t) => csvQuote(t)),
    ].join(",");

    const rows: string[] = [];
    for (const ts of sortedTimestamps) {
      const dateStr = new Date(ts * 1000)
        .toISOString()
        .replace("T", " ")
        .slice(0, 16);
      // Convert YYYY-MM-DD HH:mm -> MM-DD-YYYY HH:mm
      const mmddyyyy = `${dateStr.slice(5, 7)}-${dateStr.slice(
        8,
        10,
      )}-${dateStr.slice(0, 4)} ${dateStr.slice(11, 16)}`;

      const values = desiredTitles.map((title) => {
        const v = seriesByTitle.get(title)?.get(ts);
        return v === undefined ? "" : String(v);
      });

      rows.push(
        [
          csvQuote(mmddyyyy),
          csvQuote(String(ts)),
          ...values.map(csvQuote),
        ].join(","),
      );
    }

    const csvText = [header, ...rows].join("\n");

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCsv(`polymarket-price-history_${stamp}.csv`, csvText);

    if (failedCount > 0 || skippedCount > 0) {
      const parts: string[] = [];
      if (failedCount > 0) parts.push(`${failedCount} request(s) failed`);
      if (skippedCount > 0)
        parts.push(
          `${skippedCount} market(s) skipped (no matching outcome: ${
            desiredOutcomeName || "selected"
          })`,
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

async function handleViewChart(leg: LegState) {
  if (leg.chartLoading) return;

  leg.chartError = null;
  leg.chartData = [];

  if (leg.marketOptions.length === 0) {
    leg.chartError = "Load a Polymarket URL first to get markets.";
    return;
  }

  const marketIds =
    leg.exportSelectedMarkets.length > 0
      ? leg.exportSelectedMarkets
      : leg.marketOptions.map((m) => m.id);

  if (marketIds.length === 0) {
    leg.chartError = "Select at least one market (or Select All).";
    return;
  }

  const fromTs = leg.exportFromDate
    ? unixSecondsFromDateInput(leg.exportFromDate, false)
    : 0;
  const toTs = leg.exportToDate
    ? unixSecondsFromDateInput(leg.exportToDate, true)
    : null;

  if (toTs !== null && fromTs && toTs < fromTs) {
    leg.chartError = "To date must be after From date.";
    return;
  }

  const frequency = normalizeExportFrequency(leg.exportFrequency);

  leg.chartLoading = true;
  try {
    const desiredOutcomeName = leg.selectedOutcomeName;
    const desiredOutcomeIdForActiveMarket = leg.selectedOutcomeId;

    const tasks = marketIds
      .map((marketId) => {
        const market = leg.marketOptions.find((m) => m.id === marketId);
        if (!market) return null;

        const isActiveMarket = marketId === leg.selectedMarketId;
        const outcome = selectOutcomeForLegAndMarket(
          leg,
          market,
          desiredOutcomeName,
          desiredOutcomeIdForActiveMarket,
          isActiveMarket,
        );
        if (!outcome) return null;

        return async () => {
          const res = await getPolymarketPricesHistory({
            market: outcome.id,
            startTs: fromTs,
          });
          return {
            marketId,
            marketTitle: market.title ?? marketId,
            outcomeId: outcome.id,
            outcomeName: outcome.name,
            history: res.history ?? [],
          };
        };
      })
      .filter(Boolean) as Array<
      () => Promise<{
        marketId: string;
        marketTitle: string;
        outcomeId: string;
        outcomeName: string;
        history: PolymarketPriceHistoryPoint[];
      }>
    >;

    const skippedCount = marketIds.length - tasks.length;
    const results = await Promise.allSettled(tasks.map((t) => t()));

    const titleByMarketId = new Map(
      leg.marketOptions.map((m) => [m.id, m.title] as const),
    );

    const desiredTitles: string[] = [];
    const used = new Map<string, number>();
    for (const mid of marketIds) {
      const base = titleByMarketId.get(mid) ?? mid;
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      desiredTitles.push(count === 1 ? base : `${base} (${mid})`);
    }

    const chartSeries: ScatterSeries[] = [];
    let failedCount = 0;

    for (const r of results) {
      if (r.status === "rejected") {
        failedCount += 1;
        continue;
      }

      const { marketId, marketTitle } = r.value;

      const baseTitle =
        titleByMarketId.get(marketId) ?? marketTitle ?? marketId;
      const titleIndex = marketIds.indexOf(marketId);
      const seriesName =
        titleIndex >= 0 ? desiredTitles[titleIndex] : baseTitle;

      let history = Array.isArray(r.value.history) ? r.value.history : [];
      if (fromTs) {
        history = history.filter((pt) => pt.t >= fromTs);
      }
      if (toTs !== null) {
        history = history.filter((pt) => pt.t <= toTs);
      }

      history = downsampleHistory(history, frequency);

      const data: PriceDataPoint[] = history.map((pt) => ({
        timestamp: pt.t,
        price: pt.p,
      }));

      chartSeries.push({
        name: seriesName,
        data,
      });
    }

    if (
      chartSeries.length === 0 ||
      chartSeries.every((s) => s.data.length === 0)
    ) {
      leg.chartError =
        failedCount > 0
          ? "No data returned (some requests failed)."
          : "No data returned for the selected range.";
      return;
    }

    leg.chartData = chartSeries;

    if (failedCount > 0 || skippedCount > 0) {
      const parts: string[] = [];
      if (failedCount > 0) parts.push(`${failedCount} request(s) failed`);
      if (skippedCount > 0)
        parts.push(
          `${skippedCount} market(s) skipped (no matching outcome: ${
            desiredOutcomeName || "selected"
          })`,
        );
      leg.chartError = `Chart displayed, but ${parts.join("; ")}.`;
    }
  } catch (err) {
    console.error("Failed to load chart data:", err);
    leg.chartError =
      err instanceof Error ? err.message : "Failed to load chart data.";
  } finally {
    leg.chartLoading = false;
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
