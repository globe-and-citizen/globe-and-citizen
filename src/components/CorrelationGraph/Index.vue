<template>
  <main
    class="flex w-full flex-col gap-6 px-4 py-4 md:px-6 md:py-8 lg:gap-7 xl:px-8"
  >
    <header
      class="w-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span
              class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/60"
            >
              Correlation Monitor
            </span>
          </div>
          <h1
            class="text-2xl font-semibold tracking-tight text-base-content lg:text-3xl"
          >
            Dual Market Correlation
          </h1>
          <p class="max-w-2xl text-sm leading-relaxed text-base-content/70">
            Rolling scatter of {{ selectedHistoryMinutes }} minute(s) with X =
            Market One and Y = Market Two on 0..1 axes.
          </p>
        </div>

        <div
          class="flex items-center gap-3 rounded-lg border border-base-300 bg-base-200/50 px-3 py-2 text-sm"
        >
          <label for="history-window" class="font-medium text-base-content/75"
            >History Window</label
          >
          <select
            id="history-window"
            v-model.number="selectedHistorySeconds"
            class="select select-bordered select-sm w-36 rounded-lg bg-base-100 ring-1 ring-base-300/35 focus:ring-primary/20"
          >
            <option
              v-for="option in historyWindowOptions"
              :key="option.seconds"
              :value="option.seconds"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        class="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-6"
      >
        <div class="rounded-md border border-base-300 bg-base-200/40 px-3 py-2">
          <p class="text-base-content/55">History</p>
          <p
            class="mt-1 font-mono text-[11px] font-semibold text-base-content/85"
          >
            {{ history.length }}/{{ selectedHistorySeconds }} pts
          </p>
        </div>
        <div class="rounded-md border border-base-300 bg-base-200/40 px-3 py-2">
          <p class="text-base-content/55">Visible</p>
          <p
            class="mt-1 font-mono text-[11px] font-semibold text-base-content/85"
          >
            {{ visiblePoints.length }}/{{ selectedHistorySeconds }} pts
          </p>
        </div>
        <div class="rounded-md border border-base-300 bg-base-200/40 px-3 py-2">
          <p class="text-base-content/55">Sampled</p>
          <p
            class="mt-1 font-mono text-[11px] font-semibold text-base-content/85"
          >
            {{ sampledCount }} pts
          </p>
        </div>
        <div class="rounded-md border border-base-300 bg-base-200/40 px-3 py-2">
          <p class="text-base-content/55">Skipped</p>
          <p
            class="mt-1 font-mono text-[11px] font-semibold text-base-content/85"
          >
            {{ skippedCount }} ticks
          </p>
        </div>
        <div class="rounded-md border border-base-300 bg-base-200/40 px-3 py-2">
          <p class="text-base-content/55">Regression</p>
          <p
            class="mt-1 font-mono text-[11px] font-semibold text-base-content/85"
          >
            refresh 60s
          </p>
        </div>
        <div
          class="rounded-md border px-3 py-2"
          :class="
            isActive
              ? 'border-success/50 bg-success/10 text-success'
              : 'border-base-300 bg-base-200/40 text-base-content/70'
          "
        >
          <p class="text-base-content/55">Stream</p>
          <p class="mt-1 font-mono text-[11px] font-semibold tracking-wider">
            {{ isActive ? "STREAMING" : "IDLE" }}
          </p>
        </div>
      </div>
    </header>

    <CorrelationScatterPlot
      :samples="visiblePoints"
      :newest-point-id="newestPointId"
      :history-count="history.length"
      :regression-line="regressionLine"
      :history-window-seconds="selectedHistorySeconds"
    />

    <!-- <div class="grid gap-4 lg:grid-cols-2">
      <OrderbookSnapshot
        title="Market One Snapshot"
        :subtitle="`Outcome: ${selectedOutcomeNameA}`"
        :token-id="tokenIdA"
        :book="selectedBookA"
      />
      <OrderbookSnapshot
        title="Market Two Snapshot"
        :subtitle="`Outcome: ${selectedOutcomeNameB}`"
        :token-id="tokenIdB"
        :book="selectedBookB"
      />
    </div> -->

    <div
      class="w-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6"
    >
      <MarketSelectionForm
        v-model:market-url-a="marketUrlA"
        v-model:market-url-b="marketUrlB"
        v-model:market-a="marketA"
        v-model:market-b="marketB"
        v-model:token-id-a="tokenIdA"
        v-model:token-id-b="tokenIdB"
        :markets-a="marketsA"
        :markets-b="marketsB"
        :outcomes-a="outcomesA"
        :outcomes-b="outcomesB"
        :is-active="isActive"
        @submit="onSubmit"
        @deactivate="deactivate"
      />

      <div
        class="mt-5 rounded-md border border-base-300 bg-base-200/60 px-3 py-2.5"
      >
        <p class="font-mono text-xs leading-relaxed text-base-content/70">
          {{ statusMessage }}
        </p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { usePolymarketWs } from "@/composables/trading";
import { useCorrelationSeries } from "@/composables/trading/useCorrelationSeries";
import { useMarketData } from "@/queries";
import {
  parseIfString,
  parsePolymarketUrl,
} from "@/utils/trading/useTradingUtils";
import type { PolymarketEvent, PolymarketMarket } from "@/types";
import CorrelationScatterPlot from "./CorrelationScatterPlot.vue";
import MarketSelectionForm from "./MarketSelectionForm.vue";

defineOptions({
  name: "CorrelationGraphPage",
});

interface MarketOutcome {
  name: string;
  tokenId: string;
  buyPrice: number;
}

interface HistoryWindowOption {
  label: string;
  seconds: number;
}

const isActive = ref(false);
const statusMessage = ref(
  "Select two markets and outcomes to start streaming.",
);

const marketUrlA = ref("");
const marketUrlB = ref("");
const marketA = ref<PolymarketMarket | null>(null);
const marketB = ref<PolymarketMarket | null>(null);
const tokenIdA = ref("");
const tokenIdB = ref("");

const latestPriceA = ref<number | null>(null);
const latestPriceB = ref<number | null>(null);
const latestUpdateA = ref<number | null>(null);
const latestUpdateB = ref<number | null>(null);
const logWebsocketEvents = false;
const historyWindowOptions: HistoryWindowOption[] = [
  { label: "1 minute", seconds: 60 },
  { label: "3 minutes", seconds: 180 },
  { label: "5 minutes", seconds: 300 },
];
const selectedHistorySeconds = ref<number>(180);
const selectedHistoryMinutes = computed(
  () => selectedHistorySeconds.value / 60,
);

const endpointsA = computed(() => {
  const parsed = parsePolymarketUrl(marketUrlA.value);
  if (!parsed) return null;
  return parsed.type === "market"
    ? `/markets/slug/${parsed.slug}`
    : `/events/slug/${parsed.slug}`;
});

const endpointsB = computed(() => {
  const parsed = parsePolymarketUrl(marketUrlB.value);
  if (!parsed) return null;
  return parsed.type === "market"
    ? `/markets/slug/${parsed.slug}`
    : `/events/slug/${parsed.slug}`;
});

const { data: marketDataA } = useMarketData(endpointsA, "correlation-a");
const { data: marketDataB } = useMarketData(endpointsB, "correlation-b");
const { orderBookData, subscribeToMore, unsbscribeFrom } = usePolymarketWs(
  "market",
  [],
);

const toMarketList = (
  value: PolymarketEvent | PolymarketMarket | unknown,
): PolymarketMarket[] => {
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
  const clobIds =
    (parseIfString(market.clobTokenIds) as string[] | undefined) ?? [];
  const prices =
    (parseIfString(market.outcomePrices) as string[] | undefined) ?? [];

  return names.map((name, index) => ({
    name,
    tokenId: clobIds[index] || "",
    buyPrice: parseFloat(prices[index] ?? "0") || 0,
  }));
};

const outcomesA = computed(() => toOutcomes(marketA.value));
const outcomesB = computed(() => toOutcomes(marketB.value));

const getOutcomeNameByTokenId = (
  outcomes: MarketOutcome[],
  tokenId: string,
) => {
  if (!tokenId) return "—";

  const selected = outcomes.find((outcome) => outcome.tokenId === tokenId);
  return selected?.name ?? "—";
};

const logWebsocketPriceUpdate = (
  side: "A" | "B",
  tokenId: string,
  outcomeName: string,
  book: Record<string, unknown> | undefined,
  parsedPrice: number | null,
) => {
  if (!logWebsocketEvents || !tokenId || !book) return;

  console.info(`[CorrelationWS] price-update-${side}`, {
    tokenId,
    outcomeName,
    parsedPrice,
    bestBid: Number(book.best_bid),
    bestAsk: Number(book.best_ask),
    lastTradePrice: Number(book.last_trade_price ?? book.price),
    receivedAt: Number(book._receivedAt),
  });
};

const {
  history,
  visiblePoints,
  newestPointId,
  regressionLine,
  sampledCount,
  skippedCount,
  skippedInvalidPrice,
  skippedMissingUpdateTimestamp,
  skippedStaleOrSkewed,
  lastSkipReason,
  setHistorySeconds,
  setVisiblePointsCount,
  setRegressionWindowMs,
  start: startSeries,
  stop: stopSeries,
  reset: resetSeries,
} = useCorrelationSeries(
  latestPriceA,
  latestPriceB,
  latestUpdateA,
  latestUpdateB,
  {
    historySeconds: 300,
    visiblePointsCount: 300,
    sampleIntervalMs: 1000,
    regressionIntervalMs: 60000,
    regressionWindowMs: 180000,
    logEvents: false,
  },
);

watch(
  selectedHistorySeconds,
  (seconds) => {
    setHistorySeconds(seconds);
    setVisiblePointsCount(seconds);
    setRegressionWindowMs(seconds * 1000);
  },
  { immediate: true },
);

const parseLivePrice = (
  book: Record<string, unknown> | undefined,
): number | null => {
  if (!book) return null;

  const directBestBid = Number(book.best_bid);
  const directBestAsk = Number(book.best_ask);
  const directLastTrade = Number(book.last_trade_price ?? book.price);

  if (Number.isFinite(directBestAsk) && Number.isFinite(directBestBid)) {
    return (directBestAsk + directBestBid) / 2;
  }

  if (Number.isFinite(directBestAsk)) return directBestAsk;
  if (Number.isFinite(directLastTrade)) return directLastTrade;
  return null;
};

watch(
  [marketA, outcomesA],
  () => {
    if (!marketA.value || outcomesA.value.length === 0) {
      tokenIdA.value = "";
      return;
    }

    if (
      !outcomesA.value.some((outcome) => outcome.tokenId === tokenIdA.value)
    ) {
      tokenIdA.value = outcomesA.value[0]?.tokenId || "";
    }
  },
  { immediate: true },
);

watch(
  [marketB, outcomesB],
  () => {
    if (!marketB.value || outcomesB.value.length === 0) {
      tokenIdB.value = "";
      return;
    }

    if (
      !outcomesB.value.some((outcome) => outcome.tokenId === tokenIdB.value)
    ) {
      tokenIdB.value = outcomesB.value[0]?.tokenId || "";
    }
  },
  { immediate: true },
);

watch(
  orderBookData,
  (data) => {
    if (!isActive.value) return;

    const bookA = tokenIdA.value
      ? (data[tokenIdA.value] as Record<string, unknown> | undefined)
      : undefined;
    const bookB = tokenIdB.value
      ? (data[tokenIdB.value] as Record<string, unknown> | undefined)
      : undefined;
    const outcomeNameA = getOutcomeNameByTokenId(
      outcomesA.value,
      tokenIdA.value,
    );
    const outcomeNameB = getOutcomeNameByTokenId(
      outcomesB.value,
      tokenIdB.value,
    );

    if (tokenIdA.value) {
      const parsedA = parseLivePrice(bookA);
      logWebsocketPriceUpdate(
        "A",
        tokenIdA.value,
        outcomeNameA,
        bookA,
        parsedA,
      );

      if (Number.isFinite(parsedA)) {
        latestPriceA.value = parsedA;
        const receivedA = Number(bookA?._receivedAt);
        latestUpdateA.value = Number.isFinite(receivedA)
          ? receivedA
          : Date.now();
      }
    }

    if (tokenIdB.value) {
      const parsedB = parseLivePrice(bookB);
      logWebsocketPriceUpdate(
        "B",
        tokenIdB.value,
        outcomeNameB,
        bookB,
        parsedB,
      );

      if (Number.isFinite(parsedB)) {
        latestPriceB.value = parsedB;
        const receivedB = Number(bookB?._receivedAt);
        latestUpdateB.value = Number.isFinite(receivedB)
          ? receivedB
          : Date.now();
      }
    }

    const skipReasonLabel =
      lastSkipReason.value === "invalid-price"
        ? "invalid price"
        : lastSkipReason.value === "missing-update-timestamp"
          ? "missing update timestamp"
          : lastSkipReason.value === "stale-or-skewed"
            ? "stale/skewed feed"
            : "none";

    statusMessage.value = `Market One: ${latestPriceA.value?.toFixed(4) ?? "—"} | Market Two: ${latestPriceB.value?.toFixed(4) ?? "—"} | Sampled: ${sampledCount.value} | Skipped: ${skippedCount.value} (invalid=${skippedInvalidPrice.value}, missing-ts=${skippedMissingUpdateTimestamp.value}, stale/skew=${skippedStaleOrSkewed.value}, last=${skipReasonLabel})`;
  },
  { deep: true },
);

const onSubmit = () => {
  if (!tokenIdA.value || !tokenIdB.value) {
    toast.error("Select both outcomes before starting the stream.");
    return;
  }

  if (tokenIdA.value === tokenIdB.value) {
    toast.error("Choose two different outcomes/tokens.");
    return;
  }

  subscribeToMore([tokenIdA.value, tokenIdB.value]);
  isActive.value = true;
  resetSeries();
  startSeries();
  statusMessage.value =
    "Streaming started. Waiting for first second-by-second points.";
  toast.success("Correlation stream active");
};

const deactivate = () => {
  if (tokenIdA.value) unsbscribeFrom([tokenIdA.value]);
  if (tokenIdB.value) unsbscribeFrom([tokenIdB.value]);
  stopSeries();
  isActive.value = false;
  latestPriceA.value = null;
  latestPriceB.value = null;
  latestUpdateA.value = null;
  latestUpdateB.value = null;
  resetSeries();
  statusMessage.value = "Streaming stopped.";
  toast.info("Correlation stream stopped");
};
</script>
