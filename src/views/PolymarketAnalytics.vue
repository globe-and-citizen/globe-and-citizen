<template>
  <div class="w-full min-w-0">
    <!-- Title Row -->
    <div class="flex items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-gray-800">Polymarket Analytics</h1>

      <div class="text-sm text-gray-500">
        Search Polymarket markets by keyword
      </div>
    </div>

    <!-- Search Controls -->
    <div class="mt-4 flex flex-col md:flex-row gap-3 md:items-center">
      <div class="flex-1 min-w-0">
        <input
          v-model="query"
          type="text"
          placeholder="Search markets... (e.g. election)"
          class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          @keydown.enter.prevent="runSearchNow"
        />
      </div>

      <div class="flex items-center gap-4">
        <!-- <label
          class="flex items-center gap-2 text-sm text-gray-700 select-none"
        >
          <input
            v-model="includeClosed"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Include closed markets
        </label> -->

        <button
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isLoading || !query.trim()"
          @click="runSearchNow"
        >
          {{ isLoading ? "Searching..." : "Search" }}
        </button>
      </div>
    </div>

    <!-- Status / Errors -->
    <div class="mt-3">
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <p v-else-if="query.trim() && !isLoading" class="text-sm text-gray-500">
        Showing {{ eventResults.length }} of
        {{ pagination?.totalResults ?? eventResults.length }} result{{
          (pagination?.totalResults ?? eventResults.length) === 1 ? "" : "s"
        }}
      </p>
    </div>

    <!-- Cross-event compare bar -->
    <div
      v-if="selectedCompareMarkets.length > 0"
      class="mt-4 border border-gray-200 rounded-xl bg-white p-4"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <div class="text-sm font-semibold text-gray-900">
            Selected for comparison
            <span class="text-gray-500">
              ({{ selectedCompareMarkets.length }}/3)
            </span>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            You can pick markets from different events.
          </p>

          <div class="mt-3 flex flex-wrap gap-2">
            <div
              v-for="m in selectedCompareMarkets"
              :key="m.marketId"
              class="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs"
            >
              <span class="font-medium text-gray-800 truncate max-w-[260px]">
                {{ m.marketTitle }}
              </span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-500 truncate max-w-[180px]">
                {{ m.eventTitle }}
              </span>
              <button
                type="button"
                class="ml-1 text-gray-500 hover:text-gray-900"
                aria-label="Remove"
                @click="removeCompareMarket(m.marketId)"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-2 flex-none">
          <Button variant="outline" size="sm" @click="clearCompareSelection">
            Clear
          </Button>
          <Button size="sm" @click="openCompareInsights">
            Compare charts & export
          </Button>
        </div>
      </div>

      <p v-if="compareSelectError" class="mt-2 text-sm text-red-600">
        {{ compareSelectError }}
      </p>
    </div>

    <!-- Results -->
    <div class="mt-4">
      <div
        v-if="isLoading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div
          v-for="n in 6"
          :key="n"
          class="border border-gray-200 rounded-xl p-4 bg-white animate-pulse"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-lg bg-gray-200" />
            <div class="flex-1">
              <div class="h-4 bg-gray-200 rounded w-3/4" />
              <div class="h-3 bg-gray-200 rounded w-1/3 mt-2" />
            </div>
          </div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          v-for="item in eventResults"
          :key="item.id"
          type="button"
          class="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow text-left"
          @click="openEventModal(item.event)"
        >
          <div class="flex items-start gap-3">
            <img
              :src="item.image"
              :alt="item.title"
              class="w-12 h-12 rounded-lg object-cover flex-none border border-gray-100"
              @error="(e) => handleImageError(e)"
            />

            <div class="min-w-0 flex-1">
              <div class="text-sm font-semibold text-gray-900 line-clamp-2">
                {{ item.title }}
              </div>

              <div class="mt-2 flex items-center justify-between gap-3">
                <div class="text-xs text-gray-500 truncate">
                  {{ item.subtitle }}
                </div>

                <div class="text-sm font-bold text-gray-900 whitespace-nowrap">
                  {{ item.chanceText }}
                </div>
              </div>

              <div class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  class="h-full bg-blue-600"
                  :style="{ width: item.chancePct + '%' }"
                />
              </div>
            </div>
          </div>
        </button>

        <div
          v-if="query.trim() && eventResults.length === 0"
          class="col-span-full text-center text-gray-500 italic py-10"
        >
          No results.
        </div>
      </div>

      <div
        v-if="query.trim() && !isLoading && pagination?.hasMore"
        class="mt-6 flex justify-center"
      >
        <Button :disabled="isLoadingMore" @click="loadMore">
          {{ isLoadingMore ? "Loading..." : "Load more" }}
        </Button>
      </div>
    </div>

    <Dialog
      :open="isEventModalOpen"
      @update:open="(open: boolean) => !open && closeEventModal()"
    >
      <DialogContent
        class="w-[90vw] max-w-[900px] max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {{ selectedEvent?.title ?? "Event" }}
          </DialogTitle>
          <DialogDescription>
            {{ selectedEvent?.markets?.length ?? 0 }} market{{
              (selectedEvent?.markets?.length ?? 0) === 1 ? "" : "s"
            }}
          </DialogDescription>
        </DialogHeader>

        <div class="mt-4">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm text-gray-600">
              Select up to 3 markets to compare.
              <span class="font-semibold">
                ({{ selectedCompareMarkets.length }}/3)
              </span>
            </div>
            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                :disabled="selectedCompareMarkets.length === 0"
                @click="clearCompareSelection"
              >
                Clear
              </Button>
              <Button
                size="sm"
                :disabled="selectedCompareMarkets.length === 0"
                @click="openCompareInsights"
              >
                Compare ({{ selectedCompareMarkets.length }}/3)
              </Button>
            </div>
          </div>

          <p v-if="compareSelectError" class="mt-2 text-sm text-red-600">
            {{ compareSelectError }}
          </p>

          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="m in selectedEvent?.markets ?? []"
              :key="m.id"
              class="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div class="flex items-start gap-3">
                <img
                  :src="
                    (
                      m.icon ||
                      m.image ||
                      selectedEvent?.icon ||
                      selectedEvent?.image ||
                      DEFAULT_FALLBACK_IMAGE
                    ).toString()
                  "
                  :alt="m.question ?? m.groupItemTitle ?? 'Market'"
                  class="w-10 h-10 rounded-lg object-cover flex-none border border-gray-100"
                  @error="(e) => handleImageError(e)"
                />

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div
                        class="text-sm font-semibold text-gray-900 line-clamp-2"
                      >
                        {{
                          (m.groupItemTitle ?? "").trim() ||
                          (m.question ?? "Untitled market")
                        }}
                      </div>
                      <div class="text-xs text-gray-500 line-clamp-2 mt-1">
                        {{ (m.groupItemTitle ?? "").trim() ? m.question : "" }}
                      </div>
                    </div>

                    <div class="flex items-center gap-2 flex-none">
                      <input
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        :checked="isMarketSelectedForCompare(m)"
                        @change="toggleMarketSelection(m)"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        @click="openMarketInsights(m)"
                      >
                        Insights
                      </Button>
                    </div>
                  </div>

                  <div class="mt-2 flex items-center justify-between gap-3">
                    <div class="text-xs text-gray-500 truncate">
                      {{ computeChance(m).subtitle }}
                    </div>
                    <div
                      class="text-sm font-bold text-gray-900 whitespace-nowrap"
                    >
                      {{ computeChance(m).text }}
                    </div>
                  </div>

                  <div
                    class="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden"
                  >
                    <div
                      class="h-full bg-blue-600"
                      :style="{ width: computeChance(m).pct + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="mt-4">
          <Button @click="closeEventModal">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <PolymarketAlertWizardModal
      :is-open="isInsightsModalOpen"
      variant="insights"
      :initial-market-url="insightsMarketUrl"
      @close="closeMarketInsights"
    />

    <PolymarketAlertWizardModal
      :is-open="isCompareModalOpen"
      variant="insights"
      :initial-compare-markets="compareSelectedMarkets"
      @close="closeCompareInsights"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  searchPolymarketPublic,
  type PolymarketGammaSearchEvent,
  type PolymarketGammaSearchMarket,
  type PolymarketGammaPagination,
} from "@/api/polymarket";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PolymarketAlertWizardModal from "@/components/PolymarketAlertWizardModal.vue";

const DEFAULT_FALLBACK_IMAGE =
  "https://polymarket-upload.s3.us-east-2.amazonaws.com/polymarket_logo.png";

const query = ref("");
const includeClosed = ref(false);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const error = ref<string | null>(null);

type EventCardItem = {
  id: string;
  title: string;
  subtitle: string;
  chancePct: number; // 0-100
  chanceText: string;
  image: string;
  event: PolymarketGammaSearchEvent;
};

const rawEvents = ref<PolymarketGammaSearchEvent[]>([]);
const rawMarkets = ref<PolymarketGammaSearchMarket[]>([]);

const pagination = ref<PolymarketGammaPagination | null>(null);
const currentPage = ref(1);

const isEventModalOpen = ref(false);
const selectedEvent = ref<PolymarketGammaSearchEvent | null>(null);

type CompareMarket = {
  marketId: string;
  marketUrl: string;
  marketTitle: string;
  eventId: string;
  eventTitle: string;
  eventUrl: string;
};

const selectedCompareMarkets = ref<CompareMarket[]>([]);
const compareSelectError = ref<string | null>(null);

const isInsightsModalOpen = ref(false);
const insightsMarketUrl = ref<string>("");

const isCompareModalOpen = ref(false);

const compareSelectedMarkets = ref<
  Array<{ marketUrl: string; marketId: string; label?: string }>
>([]);

const safeJsonArray = (value?: string) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const computeChance = (market: PolymarketGammaSearchMarket) => {
  const directPriceCandidates = [
    market.lastTradePrice,
    market.bestBid,
    market.bestAsk,
  ].filter(
    (v) => Number.isFinite(v) && (v as number) >= 0 && (v as number) <= 1,
  ) as number[];

  const preferred =
    directPriceCandidates.length > 0 ? directPriceCandidates[0] : null;

  const pricesRaw = safeJsonArray(market.outcomePrices);
  const outcomesRaw = safeJsonArray(market.outcomes);

  const prices = (pricesRaw ?? [])
    .map((p) => Number(p))
    .filter((p) => Number.isFinite(p) && p >= 0 && p <= 1);

  const outcomes = (outcomesRaw ?? []).filter(
    (o) => typeof o === "string",
  ) as string[];

  const yesIdx = outcomes.findIndex((o) => o.trim().toLowerCase() === "yes");
  const yesPrice =
    yesIdx >= 0 && Number.isFinite(prices[yesIdx]) ? prices[yesIdx] : null;

  const chosen =
    preferred ??
    yesPrice ??
    (prices.length > 0
      ? prices.reduce((max, v) => (v > max ? v : max), prices[0])
      : null);

  const groupTitle = (market.groupItemTitle ?? "").trim();

  if (chosen === null) {
    return { pct: 0, text: "—", subtitle: groupTitle };
  }

  const pct = Math.round(chosen * 100);
  const subtitle = groupTitle || (yesIdx >= 0 ? "Yes" : "");
  return { pct, text: `${pct}%`, subtitle };
};

const toPolymarketMarketUrl = (market: PolymarketGammaSearchMarket) => {
  const slug = (market.slug ?? "").trim();
  if (!slug) return "https://polymarket.com";
  return `https://polymarket.com/market/${encodeURIComponent(slug)}`;
};

const toPolymarketEventUrl = (ev: PolymarketGammaSearchEvent | null) => {
  const slug = (ev?.slug ?? "").trim();
  if (!slug) return "https://polymarket.com";
  return `https://polymarket.com/event/${encodeURIComponent(slug)}`;
};

const eventResults = computed<EventCardItem[]>(() => {
  const items: EventCardItem[] = [];
  const seen = new Set<string>();

  for (const ev of rawEvents.value ?? []) {
    if (!ev?.id || seen.has(ev.id)) continue;
    seen.add(ev.id);

    const markets = ev.markets ?? [];
    let best = { pct: 0, text: "—" };
    for (const m of markets) {
      const c = computeChance(m);
      if (c.text !== "—" && c.pct >= best.pct) {
        best = { pct: c.pct, text: c.text };
      }
    }

    const marketCount = markets.length;
    items.push({
      id: ev.id,
      title: (ev.title ?? "Untitled event").trim(),
      subtitle: `${marketCount} market${marketCount === 1 ? "" : "s"}`,
      chancePct: best.text === "—" ? 0 : best.pct,
      chanceText: best.text,
      image: (ev.icon || ev.image || DEFAULT_FALLBACK_IMAGE).toString().trim(),
      event: ev,
    });
  }

  return items;
});

const openEventModal = (ev: PolymarketGammaSearchEvent) => {
  selectedEvent.value = ev;
  compareSelectError.value = null;
  isEventModalOpen.value = true;
};

const closeEventModal = () => {
  isEventModalOpen.value = false;
  selectedEvent.value = null;
  compareSelectError.value = null;
};

const openMarketInsights = (market: PolymarketGammaSearchMarket) => {
  insightsMarketUrl.value = toPolymarketMarketUrl(market);
  isInsightsModalOpen.value = true;
  closeEventModal();
};

const closeMarketInsights = () => {
  isInsightsModalOpen.value = false;
  insightsMarketUrl.value = "";
};

const clearCompareSelection = () => {
  selectedCompareMarkets.value = [];
  compareSelectError.value = null;
};

const removeCompareMarket = (marketId: string) => {
  selectedCompareMarkets.value = selectedCompareMarkets.value.filter(
    (m) => m.marketId !== marketId,
  );
};

const isMarketSelectedForCompare = (market: PolymarketGammaSearchMarket) => {
  const id = String(market.id ?? "").trim();
  if (!id) return false;
  return selectedCompareMarkets.value.some((m) => m.marketId === id);
};

const toggleMarketSelection = (market: PolymarketGammaSearchMarket) => {
  const id = String(market.id ?? "").trim();
  if (!id) return;

  compareSelectError.value = null;

  if (selectedCompareMarkets.value.some((m) => m.marketId === id)) {
    selectedCompareMarkets.value = selectedCompareMarkets.value.filter(
      (m) => m.marketId !== id,
    );
    return;
  }

  if (selectedCompareMarkets.value.length >= 3) {
    compareSelectError.value = "You can compare at most 3 markets.";
    return;
  }

  const ev = selectedEvent.value;
  const eventId = String(ev?.id ?? "").trim();
  const eventTitle = (ev?.title ?? "Event").trim();
  const eventUrl = toPolymarketEventUrl(ev);
  const marketTitle =
    (market.groupItemTitle ?? "").trim() ||
    (market.question ?? "Market").trim() ||
    `Market ${id}`;

  selectedCompareMarkets.value = [
    ...selectedCompareMarkets.value,
    {
      marketId: id,
      marketUrl: toPolymarketMarketUrl(market),
      marketTitle,
      eventId,
      eventTitle,
      eventUrl,
    },
  ];
};

const openCompareInsights = () => {
  if (selectedCompareMarkets.value.length === 0) return;

  compareSelectedMarkets.value = selectedCompareMarkets.value.map((m) => ({
    // Preload the event for each selected market.
    marketUrl: m.eventUrl,
    marketId: m.marketId,
    label: `${m.marketTitle} — ${m.eventTitle}`,
  }));
  isCompareModalOpen.value = true;
  closeEventModal();
};

const closeCompareInsights = () => {
  isCompareModalOpen.value = false;
  compareSelectedMarkets.value = [];
};

const doSearch = async () => {
  await fetchSearchPage({ page: 1, append: false });
};

const mergeEvents = (
  existing: PolymarketGammaSearchEvent[],
  incoming: PolymarketGammaSearchEvent[],
) => {
  const seen = new Set(existing.map((e) => e.id));
  const merged = [...existing];
  for (const ev of incoming) {
    if (!ev?.id || seen.has(ev.id)) continue;
    seen.add(ev.id);
    merged.push(ev);
  }
  return merged;
};

const fetchSearchPage = async (opts: { page: number; append: boolean }) => {
  const q = query.value.trim();
  if (!q) {
    rawEvents.value = [];
    rawMarkets.value = [];
    pagination.value = null;
    currentPage.value = 1;
    error.value = null;
    return;
  }

  const isFirstPage = opts.page === 1;
  if (isFirstPage) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }
  error.value = null;

  try {
    const res = await searchPolymarketPublic({
      q,
      keepClosedMarkets: includeClosed.value ? true : undefined,
      limitPerType: 50,
      page: opts.page,
    });

    const nextEvents = Array.isArray(res.events) ? res.events : [];
    rawEvents.value = opts.append
      ? mergeEvents(rawEvents.value, nextEvents)
      : nextEvents;

    rawMarkets.value = Array.isArray(res.markets) ? res.markets : [];
    pagination.value = res.pagination ?? null;
    currentPage.value = opts.page;
  } catch (e) {
    console.error(e);
    error.value = "Could not load results. Try again.";
    if (!opts.append) {
      rawEvents.value = [];
      rawMarkets.value = [];
      pagination.value = null;
      currentPage.value = 1;
    }
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

const loadMore = async () => {
  if (isLoading.value || isLoadingMore.value) return;
  if (!pagination.value?.hasMore) return;
  await fetchSearchPage({ page: currentPage.value + 1, append: true });
};

let debounceHandle: number | null = null;
watch(
  [query, includeClosed],
  () => {
    if (debounceHandle) window.clearTimeout(debounceHandle);
    debounceHandle = window.setTimeout(() => {
      doSearch();
    }, 350);
  },
  { immediate: false },
);

const runSearchNow = async () => {
  if (debounceHandle) window.clearTimeout(debounceHandle);
  await doSearch();
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement | null;
  if (!img) return;
  img.src = DEFAULT_FALLBACK_IMAGE;
};
</script>

<!-- Response example: -->
<!-- {
    "events": [
        {
            "id": "902823",
            "ticker": "mississippi-gubernatorial-election-presley-d-vs-reeves-r",
            "slug": "mississippi-gubernatorial-election-presley-d-vs-reeves-r",
            "title": "Mississippi gubernatorial election: Presley (D) vs. Reeves (R)",
            "description": "This market will resolve to \"Presley\" if Brandon Presley (D) wins the 2023 Mississippi gubernatorial election, scheduled for November 7, 2023. This market will resolve to \"Reeves\" if Tate Reeves (R) wins.\n\nDetermination of the winner of the 2023 U.S. Gubernatorial election for Mississippi will be based on a consensus of credible reporting, or if there is ambiguity, the final state election authority certification or other final official determination of the 2023 election results.\n",
            "resolutionSource": "",
            "startDate": "2023-11-06T16:28:08.892Z",
            "creationDate": "2023-11-06T16:29:08.874Z",
            "endDate": "2023-11-07T00:00:00Z",
            "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
            "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
            "active": true,
            "closed": true,
            "archived": false,
            "new": false,
            "featured": false,
            "restricted": true,
            "liquidity": 0,
            "volume": 60047.36,
            "openInterest": 0,
            "sortBy": "ascending",
            "published_at": "2023-11-06 15:52:14.532+00",
            "createdAt": "2023-11-06T15:52:14.553Z",
            "updatedAt": "2024-03-22T02:05:00.039465Z",
            "commentsEnabled": false,
            "competitive": 0,
            "volume24hr": 0,
            "volume1wk": 0,
            "volume1mo": 0,
            "volume1yr": 0,
            "enableOrderBook": true,
            "liquidityAmm": 0,
            "liquidityClob": 0,
            "commentCount": 17,
            "markets": [
                {
                    "id": "252944",
                    "question": "Mississippi gubernatorial election: Presley (D) vs. Reeves (R)",
                    "conditionId": "0xf14e0571c287e3c5eeec66870481433a44c5e3cb8f58a65949ea5c2741e76bd1",
                    "slug": "mississippi-gubernatorial-election-presley-d-vs-reeves-r",
                    "resolutionSource": "",
                    "endDate": "2023-11-07T00:00:00Z",
                    "liquidity": "0",
                    "startDate": "2023-11-06T16:28:08.892Z",
                    "fee": "20000000000000000",
                    "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
                    "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
                    "description": "This market will resolve to \"Presley\" if Brandon Presley (D) wins the 2023 Mississippi gubernatorial election, scheduled for November 7, 2023. This market will resolve to \"Reeves\" if Tate Reeves (R) wins.\n\nDetermination of the winner of the 2023 U.S. Gubernatorial election for Mississippi will be based on a consensus of credible reporting, or if there is ambiguity, the final state election authority certification or other final official determination of the 2023 election results.\n",
                    "outcomes": "[\"Presley\", \"Reeves\"]",
                    "outcomePrices": "[\"0\", \"1\"]",
                    "volume": "60047.359488999995",
                    "active": true,
                    "marketType": "normal",
                    "closed": true,
                    "marketMakerAddress": "0x6727477E334D408ABb296aa77849E93EDDb0C7a3",
                    "createdAt": "2023-11-06T15:52:14.432Z",
                    "updatedAt": "2023-11-09T07:37:06.065Z",
                    "closedTime": "2023-11-08 07:31:57+00",
                    "wideFormat": false,
                    "new": false,
                    "featured": false,
                    "submitted_by": "0x91430CaD2d3975766499717fA0D66A78D814E5c5",
                    "archived": false,
                    "resolvedBy": "0x6A9D222616C90FcA5754cd1333cFD9b7fb6a4F74",
                    "restricted": true,
                    "groupItemTitle": "",
                    "groupItemThreshold": "1",
                    "questionID": "0x922f8ecc497e1acd2a8bdf73480b49dc1bc01698bf7629fc0456a36abf7a3f73",
                    "umaEndDate": "2023-11-08 07:31:57+00",
                    "enableOrderBook": true,
                    "orderPriceMinTickSize": 0.001,
                    "orderMinSize": 15,
                    "umaResolutionStatus": "resolved",
                    "volumeNum": 60047.36,
                    "liquidityNum": 0,
                    "endDateIso": "2023-11-07",
                    "hasReviewedDates": true,
                    "commentsEnabled": false,
                    "volume24hr": 0,
                    "volume1wk": 0,
                    "volume1mo": 0,
                    "volume1yr": 0,
                    "secondsDelay": 0,
                    "clobTokenIds": "[\"43735023623900024791146956633079370045432897358751435677478808157851759523429\", \"12941124133417887652930382933598877689007346826929399000183212708140674229827\"]",
                    "umaBond": "500.0",
                    "umaReward": "5.0",
                    "fpmmLive": true,
                    "volume24hrAmm": 0,
                    "volume1wkAmm": 0,
                    "volume1moAmm": 0,
                    "volume1yrAmm": 0,
                    "volume24hrClob": 0,
                    "volume1wkClob": 0,
                    "volume1moClob": 0,
                    "volume1yrClob": 0,
                    "volumeAmm": 0,
                    "volumeClob": 60047.36,
                    "liquidityAmm": 0,
                    "liquidityClob": 0,
                    "makerBaseFee": 0,
                    "takerBaseFee": 0,
                    "customLiveness": 0,
                    "acceptingOrders": true,
                    "notificationsEnabled": true,
                    "creator": "",
                    "ready": false,
                    "funded": false,
                    "cyom": false,
                    "competitive": 0,
                    "pagerDutyNotificationEnabled": false,
                    "approved": true,
                    "rewardsMinSize": 0,
                    "rewardsMaxSpread": 0,
                    "spread": 1,
                    "oneDayPriceChange": 0,
                    "oneHourPriceChange": 0,
                    "oneWeekPriceChange": 0,
                    "oneMonthPriceChange": 0,
                    "oneYearPriceChange": 0,
                    "lastTradePrice": 0,
                    "bestBid": 0,
                    "bestAsk": 1,
                    "clearBookOnStart": true,
                    "manualActivation": false,
                    "negRiskOther": false,
                    "umaResolutionStatuses": "[]",
                    "pendingDeployment": false,
                    "deploying": false,
                    "rfqEnabled": false,
                    "holdingRewardsEnabled": false,
                    "feesEnabled": false,
                    "requiresTranslation": false
                }
            ],
            "tags": [
                {
                    "id": "2",
                    "label": "Politics",
                    "slug": "politics",
                    "forceShow": false,
                    "publishedAt": "2023-10-25 18:55:50.674+00",
                    "updatedBy": 13,
                    "createdAt": "2023-10-25T18:55:50.681Z",
                    "updatedAt": "2025-12-18T02:24:23.994313Z",
                    "forceHide": true,
                    "requiresTranslation": false
                },
                {
                    "id": "339",
                    "label": "election",
                    "slug": "election",
                    "publishedAt": "2023-11-02 21:58:12.334+00",
                    "updatedBy": 15,
                    "createdAt": "2023-11-02T21:58:12.348Z",
                    "updatedAt": "2025-12-18T02:43:57.885753Z",
                    "forceHide": true,
                    "requiresTranslation": false
                },
                {
                    "id": "460",
                    "label": "mississippi",
                    "slug": "mississippi",
                    "publishedAt": "2023-11-06 15:52:26.608+00",
                    "createdAt": "2023-11-06T15:52:26.623Z",
                    "updatedAt": "2025-12-18T02:17:04.998776Z",
                    "requiresTranslation": false
                },
                {
                    "id": "459",
                    "label": "democrat",
                    "slug": "democrat",
                    "publishedAt": "2023-11-06 15:52:24.906+00",
                    "createdAt": "2023-11-06T15:52:24.998Z",
                    "updatedAt": "2025-12-18T02:16:58.744892Z",
                    "requiresTranslation": false
                },
                {
                    "id": "461",
                    "label": "gubernatorial race",
                    "slug": "gubernatorial-race",
                    "publishedAt": "2023-11-06 15:52:27.11+00",
                    "createdAt": "2023-11-06T15:52:27.119Z",
                    "updatedAt": "2025-12-18T02:17:07.980679Z",
                    "requiresTranslation": false
                },
                {
                    "id": "100215",
                    "label": "All",
                    "slug": "all",
                    "forceShow": false,
                    "updatedAt": "2025-12-18T03:27:54.040735Z",
                    "requiresTranslation": false
                }
            ],
            "cyom": false,
            "closedTime": "2023-11-08T07:31:57Z",
            "showAllOutcomes": false,
            "showMarketImages": true,
            "enableNegRisk": false,
            "negRiskAugmented": false,
            "pendingDeployment": false,
            "deploying": false,
            "requiresTranslation": false
        }, -->
