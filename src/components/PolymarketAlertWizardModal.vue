<template>
  <Dialog
    :open="isOpen"
    @update:open="(open: boolean) => !open && emit('close')"
  >
    <DialogContent
      class="w-[90vw] max-w-[750px] max-h-[85vh] overflow-y-auto border-0"
    >
      <DialogHeader>
        <DialogTitle>
          {{
            isEditMode ? "Update Polymarket Alert" : "Create Polymarket Alert"
          }}
        </DialogTitle>
        <DialogDescription>
          {{
            isEditMode
              ? "Update an existing single-outcome alert or a 2/3-market sum alert."
              : "Create a single-outcome alert or a 2/3-market sum alert."
          }}
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <!-- Step indicator -->
        <!-- <div class="text-sm text-muted-foreground">Step {{ step }} of 3</div> -->

        <!-- Step 1: Configure -->
        <div v-if="step === 1" class="grid gap-4">
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
          </div>
        </div>

        <!-- Step 3: Review -->
        <div v-else class="grid gap-3">
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
          <span v-else>{{ isEditMode ? "Update Alert" : "Create Alert" }}</span>
        </Button>
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
  type AlertOperator,
  updateAlert,
} from "@/api/polymarket";

type OutcomeOption = { id: string; name: string };
type MarketOption = { id: string; title: string; outcomes: OutcomeOption[] };

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
  marketOptions: MarketOption[];
  selectedMarketId: string;
  outcomeOptions: OutcomeOption[];
  selectedOutcomeId: string;
  selectedOutcomeName: string;
};

interface Props {
  isOpen: boolean;
  mode?: "create" | "edit";
  initialAlert?: ExistingAlert | null;
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
    marketOptions: [],
    selectedMarketId: "",
    outcomeOptions: [],
    selectedOutcomeId: "",
    selectedOutcomeName: "",
  },
]);

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
          marketOptions: [],
          selectedMarketId: "",
          outcomeOptions: [],
          selectedOutcomeId: "",
          selectedOutcomeName: "",
        }
      );
    }
    legs.value = nextLegs;
  },
  { immediate: true }
);

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return;

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
          marketOptions: [],
          selectedMarketId: "",
          outcomeOptions: [],
          selectedOutcomeId: l.outcome_id ?? "",
          selectedOutcomeName: l.outcome_name ?? "",
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
            marketOptions: [],
            selectedMarketId: alert.market_id ?? "",
            outcomeOptions: [],
            selectedOutcomeId: alert.outcome_id ?? "",
            selectedOutcomeName: alert.outcome_name ?? "",
          },
        ];
      }
    };

    if (!isEditMode.value || !props.initialAlert) {
      resetToDefaults();
      return;
    }

    applyInitialAlert(props.initialAlert);
  }
);

watch(
  () => props.initialAlert,
  (alert) => {
    if (!props.isOpen) return;
    if (!isEditMode.value) return;
    if (!alert) return;

    notifyDiscord.value = coerceBoolean(alert.notify_discord, true);
    repeat.value = coerceBoolean(alert.repeat, true);
  }
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
    const yesId = safeString(ids[0] ?? "");
    const noId = safeString(ids[1] ?? "");
    const options: OutcomeOption[] = [];
    if (yesId) options.push({ id: yesId, name: "Yes" });
    if (noId) options.push({ id: noId, name: "No" });
    return options;
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
          o?.clobTokenId ?? o?.tokenId ?? o?.outcome_id ?? o?.id
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

  return {
    id,
    title,
    outcomes,
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

  const preserveSelection = isEditMode.value;
  const prevSelectedMarketId = leg.selectedMarketId;
  const prevSelectedOutcomeId = leg.selectedOutcomeId;
  const prevSelectedOutcomeName = leg.selectedOutcomeName;

  leg.loading = true;
  leg.error = null;
  leg.title = "";
  leg.marketOptions = [];
  leg.outcomeOptions = [];

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

    const applySelectionFromOptions = (
      desiredMarketId: string,
      desiredOutcomeId: string
    ) => {
      let market: MarketOption | undefined;
      if (desiredMarketId) {
        market = options.find((m) => m.id === desiredMarketId);
      }
      if (!market && desiredOutcomeId) {
        market = options.find((m) =>
          m.outcomes.some((o) => o.id === desiredOutcomeId)
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
    if (preserveSelection && (prevSelectedMarketId || prevSelectedOutcomeId)) {
      const applied = applySelectionFromOptions(
        prevSelectedMarketId,
        prevSelectedOutcomeId
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
    } else if (firstMarket) {
      leg.selectedMarketId = firstMarket.id;
      leg.outcomeOptions = firstMarket.outcomes;
      const firstOutcome = firstMarket.outcomes[0];
      if (firstOutcome) {
        leg.selectedOutcomeId = firstOutcome.id;
        leg.selectedOutcomeName = firstOutcome.name;
      }
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
      (l) => l.marketUrl.trim() && l.selectedMarketId && l.selectedOutcomeId
    );
  }

  return true;
});

const canSubmit = computed(() => canProceed.value);

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
  if (step.value === 1) {
    emit("close");
    return;
  }
  step.value -= 1;
}

async function handleSubmit() {
  if (isSubmitting.value) return;
  submitError.value = "";

  const legsReady = legs.value.every(
    (l) => l.marketUrl.trim() && l.selectedOutcomeId && l.selectedOutcomeName
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
          existing?.market_url?.trim() || firstLeg?.marketUrl?.trim() || ""
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
