<template>
  <form class="space-y-5" @submit.prevent="handleGenerate">
    <!-- Error banner -->
    <div
      v-if="errorMsg"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      <strong>Error:</strong>
      <div class="whitespace-pre-wrap break-words mt-1">{{ errorMsg }}</div>
    </div>

    <div class="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div>
        <div class="text-sm font-semibold text-foreground">
          Select 2 Markets
        </div>
        <p class="text-xs text-muted-foreground mt-1">
          Paste Polymarket URLs or open search.
        </p>
      </div>

      <Button variant="outline" @click="openMarketSearchDialog">
        Open Search
      </Button>
    </div>

    <SearchDialog
      v-model:open="openSearchDialog"
      v-model:select-market-options="marketOptions"
    />

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Market A -->
      <div class="space-y-4 rounded-xl border border-base-300 bg-base-200/40 p-4">
        <div
          class="flex items-center justify-between gap-2 border-b border-base-300 pb-2"
        >
          <div class="badge badge-primary badge-sm font-mono">MARKET A</div>
          <span
            class="text-[11px] font-medium uppercase tracking-[0.18em] text-base-content/45"
          >
            X axis
          </span>
        </div>

        <div class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Event or market URL
          </label>
          <input
            v-model="marketUrlA"
            :disabled="isLoading"
            placeholder="https://polymarket.com/event/..."
            class="input input-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          />
        </div>

        <div v-if="marketsA?.length > 0" class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select market
          </label>
          <select
            v-model="marketA"
            :disabled="isLoading"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option v-for="market in marketsA" :key="market.id" :value="market">
              {{ market.question }}
            </option>
          </select>
        </div>

        <div v-if="outcomesA?.length > 0" class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select outcome
          </label>
          <select
            v-model="tokenIdA"
            :disabled="isLoading"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option
              v-for="outcome in outcomesA"
              :key="outcome.tokenId"
              :value="outcome.tokenId"
            >
              {{ outcome.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Market B -->
      <div class="space-y-4 rounded-xl border border-base-300 bg-base-200/40 p-4">
        <div
          class="flex items-center justify-between gap-2 border-b border-base-300 pb-2"
        >
          <div class="badge badge-secondary badge-sm font-mono">MARKET B</div>
          <span
            class="text-[11px] font-medium uppercase tracking-[0.18em] text-base-content/45"
          >
            Y axis
          </span>
        </div>

        <div class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Event or market URL
          </label>
          <input
            v-model="marketUrlB"
            :disabled="isLoading"
            placeholder="https://polymarket.com/event/..."
            class="input input-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          />
        </div>

        <div v-if="marketsB?.length > 0" class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select market
          </label>
          <select
            v-model="marketB"
            :disabled="isLoading"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option v-for="market in marketsB" :key="market.id" :value="market">
              {{ market.question }}
            </option>
          </select>
        </div>

        <div v-if="outcomesB?.length > 0" class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select outcome
          </label>
          <select
            v-model="tokenIdB"
            :disabled="isLoading"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option
              v-for="outcome in outcomesB"
              :key="outcome.tokenId"
              :value="outcome.tokenId"
            >
              {{ outcome.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-4">
      <div class="field-group flex flex-col gap-1.5">
        <label
          class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
        >
          Begin date
        </label>
        <input
          v-model="startDate"
          :disabled="isLoading"
          type="date"
          class="input input-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border px-2"
        />
      </div>

      <div class="field-group flex flex-col gap-1.5">
        <label
          class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
        >
          End date
        </label>
        <input
          v-model="endDate"
          :disabled="isLoading"
          type="date"
          class="input input-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border px-2"
        />
      </div>

      <div class="field-group flex flex-col gap-1.5">
        <label
          class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
        >
          Interval
        </label>
        <select
          v-model="interval"
          :disabled="isLoading"
          class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
        >
          <option
            v-for="opt in allowedIntervals"
            :key="opt"
            :value="opt"
          >
            {{ opt }}
          </option>
        </select>
      </div>

      <div class="field-group flex flex-col gap-1.5">
        <label
          class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
        >
          Fidelity
        </label>
        <input
          v-model="fidelity"
          :disabled="isLoading"
          type="number"
          step="1"
          class="input input-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border px-2"
        />
      </div>
    </div>

    <div class="space-y-2">
      <button
        type="submit"
        :disabled="!canGenerate || isLoading"
        :aria-disabled="!canGenerate || isLoading"
        class="btn h-11 w-full text-sm font-semibold tracking-wide transition-all duration-200"
        :class="
          canGenerate && !isLoading
            ? 'btn-primary shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30'
            : 'btn-ghost border border-base-300 bg-base-200/80 text-base-content/55'
        "
      >
        {{ isLoading ? "GENERATING..." : "GENERATE HISTORICAL CORRELATION" }}
      </button>

      <p class="text-xs text-base-content/60">
        {{
          canGenerate
            ? "Ready to fetch historical snapshots and compute correlation."
            : "Pick 2 outcomes and a valid start/end date."
        }}
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type {PolymarketEvent, PolymarketMarket} from "@/types";
import {parseIfString, parsePolymarketUrl} from "@/utils/trading/useTradingUtils.ts";
import {useMarketData} from "@/queries";
import {Button} from "@/components/ui/button";
import type {PolymarketGammaSearchEvent, SelectMarketOption} from "@/api/polymarket.ts";
import SearchDialog from "@/components/HistoricalCorrelation/SearchDialog.vue";

const tokenIdA = defineModel<string>("tokenIdA", {default: ""});
const tokenIdB = defineModel<string>("tokenIdB", {default: ""});
const startDate = defineModel<string>("startDate", {default: ""});
const endDate = defineModel<string>("endDate", {default: ""});
const interval = defineModel<string>("interval", {default: "1h"});
const allowedIntervals = ["1h", "6h", "1d", "1w", "1m", "all", "max"];
const fidelity = ref<number>(1);

defineProps<{
  isLoading: boolean;
}>();

const emit = defineEmits(["generate", "update:chartTitle", "update:fidelity"]);

const canGenerate = computed(() => {
  if (
    !marketA.value ||
    !marketB.value ||
    !tokenIdA.value ||
    !tokenIdB.value ||
    !startDate.value ||
    !endDate.value
  ) {
    return false;
  }

  const start = new Date(startDate.value).getTime();
  const end = new Date(endDate.value).getTime();
  return Number.isFinite(start) && Number.isFinite(end) && start <= end;
});

function handleGenerate() {
  emit('generate')
  emit("update:fidelity", fidelity.value);
}

interface MarketOutcome {
  name: string;
  tokenId: string;
  buyPrice: number;
}

const marketUrlA = ref("");
const marketUrlB = ref("");
const marketA = ref<PolymarketMarket | null>(null);
const marketB = ref<PolymarketMarket | null>(null);

const marketsA = ref<PolymarketMarket[]>([]);
const marketsB = ref<PolymarketMarket[]>([]);
const errorMsg = ref<string | null>(null);

function computeEndpointFromUrl(url: string): string | null {
  errorMsg.value = null;
  if (!url) return null;

  const parsed = parsePolymarketUrl(url);
  if (!parsed) {
    errorMsg.value = "Invalid Polymarket URL" + url;
    console.error("Failed to parse polymarket URL:", url);
    return null
  }

  return parsed.type === "market" ? `/markets/slug/${parsed.slug}` : `/events/slug/${parsed.slug}`;
}

const endpointsA = computed(() => {
  return computeEndpointFromUrl(marketUrlA.value);
});

const endpointsB = computed(() => {
  return computeEndpointFromUrl(marketUrlB.value);
});

const {data: marketDataA, error: marketErrorA} = useMarketData(endpointsA, "historical-correlation-a");
const {data: marketDataB, error: marketErrorB} = useMarketData(endpointsB, "historical-correlation-b");

// нормализатор ошибки в строку
function toMessage(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return "Failed to fetch data: " + err;
  if (err instanceof Error) return "Failed to fetch data: " + err.message || String(err);
  try {
    return "Failed to fetch data: " + String(err);
  } catch {
    return "";
  }
}

watch(marketErrorA, (err) => {
  errorMsg.value = toMessage(err);
});

watch(marketErrorB, (err) => {
  errorMsg.value = toMessage(err);
});

const toMarketList = (value: PolymarketEvent | PolymarketMarket | unknown): PolymarketMarket[] => {
  if (!value || typeof value !== "object") return [];
  if ("markets" in value && Array.isArray((value as PolymarketEvent).markets)) {
    return (value as PolymarketEvent).markets;
  }
  const marketValue = value as PolymarketMarket;
  return marketValue.id ? [marketValue] : [];
};

watch(marketDataA, (value) => {
  marketsA.value = toMarketList(value);
}, {immediate: true});

watch(marketDataB, (value) => {
  marketsB.value = toMarketList(value);
}, {immediate: true});

watch(marketsA, (markets) => {
  if (!marketA.value) return;

  marketA.value =
    markets.find(m => m.id === marketA.value!.id) ?? null;
});

watch(marketsB, (markets) => {
  if (!marketB.value) return;

  marketB.value =
    markets.find(m => m.id === marketB.value!.id) ?? null;
});

const toOutcomes = (market: PolymarketMarket | null): MarketOutcome[] => {
  if (!market) return [];
  const names = (parseIfString(market.outcomes) as string[] | undefined) ?? [];
  const clobIds = (parseIfString(market.clobTokenIds) as string[] | undefined) ?? [];
  const prices = (parseIfString(market.outcomePrices) as string[] | undefined) ?? [];

  return names.map((name, index) => ({
    name,
    tokenId: clobIds[index] || "",
    buyPrice: parseFloat(prices[index] ?? "0") || 0,
  }));
};

const outcomesA = computed(() => toOutcomes(marketA.value));
const outcomesB = computed(() => toOutcomes(marketB.value));

watch([marketA, outcomesA], () => {
  if (!marketA.value || outcomesA.value.length === 0) {
    tokenIdA.value = "";
    return;
  }
  if (!outcomesA.value.some((o) => o.tokenId === tokenIdA.value)) {
    tokenIdA.value = outcomesA.value[0]?.tokenId || "";
  }
}, {immediate: true});

watch([marketB, outcomesB], () => {
  if (!marketB.value || outcomesB.value.length === 0) {
    tokenIdB.value = "";
    return;
  }
  if (!outcomesB.value.some((o) => o.tokenId === tokenIdB.value)) {
    tokenIdB.value = outcomesB.value[0]?.tokenId || "";
  }
}, {immediate: true});

const selectedOutcomeNameA = computed(() => {
  const selected = outcomesA.value.find((o) => o.tokenId === tokenIdA.value);
  return selected?.name ?? "Market A";
});

const selectedOutcomeNameB = computed(() => {
  const selected = outcomesB.value.find((o) => o.tokenId === tokenIdB.value);
  return selected?.name ?? "Market B";
});

const xAxisName = defineModel<string>("xAxisName", {default: ""});
const yAxisName = defineModel<string>("yAxisName", {default: ""});

watch(selectedOutcomeNameA, (v) => {
  xAxisName.value = v;
}, {immediate: true});

watch(selectedOutcomeNameB, (v) => {
  yAxisName.value = v;
}, {immediate: true});

const chartTitle = computed(() => {
  if (!marketA.value || !marketB.value) return "";
  return `${selectedOutcomeNameA.value.toUpperCase()} - ${marketA.value?.question} vs ${selectedOutcomeNameB.value.toUpperCase()} - ${marketB.value?.question}`;
})

watch(chartTitle, (v) => emit("update:chartTitle", v), {immediate: true});

/// Search
const openSearchDialog = ref(false);
const marketOptions = ref<SelectMarketOption[]>([
  {
    name: "Market A",
    event: null,
    market: null,
    isSelected: false,
  },
  {
    name: "Market B",
    event: null,
    market: null,
    isSelected: false,
  },
]);

function openMarketSearchDialog() {
  openSearchDialog.value = true;
}

function toPolymarketEventUrl(event: PolymarketGammaSearchEvent | null) {
  const slug = (event?.slug ?? "").trim();
  if (!slug) return "https://polymarket.com";
  return `https://polymarket.com/event/${encodeURIComponent(slug)}`;
}

watch(marketOptions, (opts) => {
  const a = opts.find(o => o.name === "Market A");
  const b = opts.find(o => o.name === "Market B");
  if (a?.isSelected) {
    marketUrlA.value = toPolymarketEventUrl(a.event)
    marketsA.value = a.event?.markets as PolymarketMarket[] ?? [];
    marketA.value = marketsA.value.find(m => m.id === a.market?.id) ?? null;
  } else if (marketUrlA.value !== "" && marketA.value !== null && marketsA.value.length > 0) {
    marketUrlA.value = "";
    marketA.value = null;
    marketsA.value = [];
  }

  if (b?.isSelected) {
    marketUrlB.value = toPolymarketEventUrl(b.event)
    marketsB.value = b.event?.markets as PolymarketMarket[] ?? [];
    marketB.value = marketsB.value.find(m => m.id === b.market?.id) ?? null;
  } else if (marketUrlB.value !== "" && marketB.value !== null && marketsB.value.length > 0) {
    marketUrlB.value = "";
    marketB.value = null;
    marketsB.value = [];
  }
}, {immediate: true, deep: true})
</script>
