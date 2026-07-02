<template>
  <form class="space-y-5" @submit.prevent="$emit('generate')">
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Market A -->
      <div class="space-y-4 rounded-xl border border-base-300 bg-base-200/40 p-4">
        <div
          class="flex items-center justify-between gap-2 border-b border-base-300 pb-2"
        >
          <div class="badge badge-primary badge-sm font-mono">MARKET ONE</div>
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
          <div class="badge badge-secondary badge-sm font-mono">MARKET TWO</div>
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

    <div class="grid gap-4 sm:grid-cols-2">
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

const tokenIdA = defineModel<string>("tokenIdA", { default: "" });
const tokenIdB = defineModel<string>("tokenIdB", { default: "" });
const startDate = defineModel<string>("startDate", { default: "" });
const endDate = defineModel<string>("endDate", { default: "" });

defineProps<{
  isLoading: boolean;
}>();

defineEmits(["generate"]);

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

interface MarketOutcome {
  name: string;
  tokenId: string;
  buyPrice: number;
}

const marketUrlA = ref("");
const marketUrlB = ref("");
const marketA = ref<PolymarketMarket | null>(null);
const marketB = ref<PolymarketMarket | null>(null);

const endpointsA = computed(() => {
  const parsed = parsePolymarketUrl(marketUrlA.value);
  if (!parsed) return null;
  return parsed.type === "market" ? `/markets/slug/${parsed.slug}` : `/events/slug/${parsed.slug}`;
});

const endpointsB = computed(() => {
  const parsed = parsePolymarketUrl(marketUrlB.value);
  if (!parsed) return null;
  return parsed.type === "market" ? `/markets/slug/${parsed.slug}` : `/events/slug/${parsed.slug}`;
});

const {data: marketDataA} = useMarketData(endpointsA, "historical-correlation-a");
const {data: marketDataB} = useMarketData(endpointsB, "historical-correlation-b");

const toMarketList = (value: PolymarketEvent | PolymarketMarket | unknown): PolymarketMarket[] => {
  if (!value || typeof value !== "object") return [];
  if ("markets" in value && Array.isArray((value as PolymarketEvent).markets)) {
    return (value as PolymarketEvent).markets;
  }
  const marketValue = value as PolymarketMarket;
  return marketValue.id ? [marketValue] : [];
};

const marketsA = computed(() => toMarketList(marketDataA.value));
const marketsB = computed(() => toMarketList(marketDataB.value));

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
  return selected?.name ?? "Market One";
});

const selectedOutcomeNameB = computed(() => {
  const selected = outcomesB.value.find((o) => o.tokenId === tokenIdB.value);
  return selected?.name ?? "Market Two";
});

const xAxisName = defineModel<string>("xAxisName", { default: "" });
const yAxisName = defineModel<string>("yAxisName", { default: "" });

watch(selectedOutcomeNameA, (v) => {
  xAxisName.value = v;
}, { immediate: true });

watch(selectedOutcomeNameB, (v) => {
  yAxisName.value = v;
}, { immediate: true });
// const chartTitle = computed(() => `${selectedOutcomeNameA.value} vs ${selectedOutcomeNameB.value}`);

</script>
