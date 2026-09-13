<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="flex max-h-[90dvh] w-[calc(100vw-1rem)] max-w-[1000px] flex-col overflow-hidden p-4 sm:w-[calc(100vw-2rem)] sm:p-6"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          Paste a Polymarket URL or search for an event, then choose a single
          market and commit to Yes or No.
        </DialogDescription>
      </DialogHeader>

      <div class="grid min-h-0 flex-1 gap-4 overflow-y-auto pr-1">
        <div class="grid gap-4 md:grid-cols-2">
          <div class="grid min-w-0 gap-2">
            <label for="prediction-market-url" class="text-sm font-medium">
              Polymarket URL
            </label>
            <div class="flex min-w-0 flex-col gap-2 sm:flex-row">
              <Input
                id="prediction-market-url"
                v-model="marketUrl"
                type="url"
                placeholder="https://polymarket.com/event/..."
                class="min-w-0 flex-1"
                :disabled="urlLoading"
                @keydown.enter.prevent="handleUrlFetch"
              />
              <Button
                type="button"
                variant="outline"
                class="shrink-0"
                :disabled="!marketUrl.trim() || urlLoading"
                @click="handleUrlFetch"
              >
                <component
                  :is="LoaderIcon"
                  v-if="urlLoading"
                  class="size-4 animate-spin"
                />
                Load URL
              </Button>
            </div>
          </div>

          <div class="grid min-w-0 gap-2">
            <label for="prediction-market-search" class="text-sm font-medium">
              Search events
            </label>
            <div class="flex min-w-0 flex-col gap-2 sm:flex-row">
              <Input
                id="prediction-market-search"
                v-model="searchQuery"
                type="search"
                placeholder="Search Polymarket events..."
                class="min-w-0 flex-1"
                :disabled="searchLoading"
                @keydown.enter.prevent="runSearch"
              />
              <Button
                type="button"
                class="shrink-0"
                :disabled="!searchQuery.trim() || searchLoading"
                @click="runSearch"
              >
                <component
                  :is="LoaderIcon"
                  v-if="searchLoading"
                  class="size-4 animate-spin"
                />
                Search
              </Button>
            </div>
          </div>
        </div>

        <p v-if="urlError" class="text-sm text-red-600">{{ urlError }}</p>
        <p v-if="searchError" class="text-sm text-red-600">{{ searchError }}</p>

        <!-- Search results: event list + market list -->
        <div
          v-if="searchEventResults.length > 0"
          class="grid gap-4 min-h-0 lg:grid-cols-[280px_minmax(0,1fr)]"
        >
          <!-- Events panel -->
          <div
            class="border rounded-lg overflow-hidden min-h-0 flex flex-col max-h-[50vh]"
          >
            <div class="border-b px-4 py-3 text-sm font-medium">
              Events ({{ searchEventResults.length }})
            </div>
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              <button
                v-for="event in searchEventResults"
                :key="event.id"
                type="button"
                class="w-full rounded-lg border p-3 text-left transition-colors"
                :class="
                  selectedSearchEvent?.id === event.id
                    ? 'border-primary bg-muted/30'
                    : 'border-border hover:bg-muted/20'
                "
                @click="selectSearchEvent(event.event)"
              >
                <div class="flex items-start gap-3">
                  <img
                    :src="event.image"
                    :alt="event.title"
                    class="w-10 h-10 rounded-lg object-cover border"
                    @error="handleImageError"
                  />
                  <div class="min-w-0 flex-1">
                    <div class="text-sm font-medium line-clamp-2">
                      {{ event.title }}
                    </div>
                    <div class="mt-1 text-xs text-muted-foreground">
                      {{ event.subtitle }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Markets panel -->
          <div
            class="border rounded-lg overflow-hidden min-h-0 flex flex-col max-h-[50vh]"
          >
            <div class="border-b px-4 py-3 text-sm font-medium">
              {{ selectedSearchEvent?.title ?? "Markets" }}
            </div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div
                v-for="market in selectedSearchEvent?.markets ?? []"
                :key="market.id"
                class="rounded-lg border p-4 grid gap-3"
                :class="
                  selectedMarket?.id === market.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                "
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="text-sm font-semibold line-clamp-2">
                      {{
                        (market.groupItemTitle ?? "").trim() ||
                        market.question ||
                        "Market"
                      }}
                    </div>
                    <p
                      class="mt-1 text-xs text-muted-foreground line-clamp-2"
                    >
                      {{ selectedSearchEvent?.title || "" }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    :class="
                      selectedMarket?.id === market.id && selectedOutcome === 'Yes'
                        ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                        : ''
                    "
                    @click="selectMarket(market, 'Yes')"
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    :class="
                      selectedMarket?.id === market.id && selectedOutcome === 'No'
                        ? 'bg-red-600 text-white hover:bg-red-700 border-red-600'
                        : ''
                    "
                    @click="selectMarket(market, 'No')"
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- URL-loaded markets -->
        <div
          v-if="urlMarkets.length > 0 && searchEventResults.length === 0"
          class="border rounded-lg overflow-hidden"
        >
          <div class="border-b px-4 py-3 text-sm font-medium">
            Markets from URL
          </div>
          <div class="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
            <div
              v-for="market in urlMarkets"
              :key="market.id"
              class="rounded-lg border p-4 grid gap-3"
              :class="
                selectedMarket?.id === market.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              "
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-sm font-semibold line-clamp-2">
                    {{ market.question || "Market" }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  :class="
                    selectedMarket?.id === market.id && selectedOutcome === 'Yes'
                      ? 'bg-green-600 text-white hover:bg-green-700 border-green-600'
                      : ''
                  "
                  @click="selectMarket(market, 'Yes')"
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  :class="
                    selectedMarket?.id === market.id && selectedOutcome === 'No'
                      ? 'bg-red-600 text-white hover:bg-red-700 border-red-600'
                      : ''
                  "
                  @click="selectMarket(market, 'No')"
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="
            searchEventResults.length === 0 &&
            urlMarkets.length === 0 &&
            !searchLoading &&
            !urlLoading
          "
          class="flex items-center justify-center py-12 text-sm text-muted-foreground"
        >
          Paste a Polymarket URL or search for an event to get started.
        </div>
      </div>

      <DialogFooter class="mt-2 border-t pt-4">
        <div
          class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="min-w-0 break-words text-sm text-muted-foreground">
            <template v-if="selectedMarket && selectedOutcome">
              <span class="font-medium text-foreground"
                >{{ selectedMarket.question }}</span
              >
              → <span class="font-semibold">{{ selectedOutcome }}</span>
            </template>
            <template v-else>Select a market and commit to Yes or No.</template>
          </div>
          <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" @click="handleCancel">
              Cancel
            </Button>
            <Button
              size="sm"
              :disabled="!selectedMarket || !selectedOutcome"
              @click="handleConfirm"
            >
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref, watch } from "vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import LoaderIcon from "@/assets/icons/loader.svg";
import {
  type PolymarketGammaPagination,
  type PolymarketGammaSearchEvent,
  type PolymarketGammaSearchMarket,
  searchPolymarketPublic,
} from "@/api/polymarket.ts";
import { parsePolymarketUrl, parseIfString } from "@/utils/trading/useTradingUtils.ts";
import { useMarketData } from "@/queries";
import type { PolymarketEvent, PolymarketMarket } from "@/types";

export type MarketSelection = {
  url: string;
  eventTitle: string;
  marketId: string;
  marketSlug: string;
  marketQuestion: string;
  outcome: "Yes" | "No";
  tokenId: string;
  image?: string;
  tags: string[];
};

const props = defineProps<{
  title: string;
}>();

void props;

const emit = defineEmits<{
  (e: "confirm", selection: MarketSelection): void;
  (e: "cancel"): void;
}>();

const open = defineModel<boolean>("open", { default: false });

// --- State ---
const marketUrl = ref("");
const searchQuery = ref("");
const urlError = ref("");
const searchError = ref("");
const urlLoading = ref(false);
const searchLoading = ref(false);

const selectedSearchEvent = ref<PolymarketGammaSearchEvent | null>(null);
const selectedMarket = ref<PolymarketGammaSearchMarket | PolymarketMarket | null>(null);
const selectedOutcome = ref<"Yes" | "No" | "">("");

const urlEndpoint = ref<string | null>(null);
const urlMarkets = ref<PolymarketMarket[]>([]);
const urlEvent = ref<PolymarketEvent | null>(null);

const DEFAULT_FALLBACK_IMAGE =
  "https://polymarket-upload.s3.us-east-2.amazonaws.com/polymarket_logo.png";

// --- Search ---
const marketSearchEvents = ref<PolymarketGammaSearchEvent[]>([]);
const marketSearchPagination = ref<PolymarketGammaPagination | null>(null);

type SearchEventCardItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  event: PolymarketGammaSearchEvent;
};

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

async function runSearch() {
  const query = searchQuery.value.trim();
  if (!query) return;

  urlEndpoint.value = null;
  urlMarkets.value = [];
  urlEvent.value = null;
  selectedMarket.value = null;
  selectedOutcome.value = "";
  searchLoading.value = true;
  searchError.value = "";

  try {
    const response = await searchPolymarketPublic({
      q: query,
      limitPerType: 50,
      page: 1,
    });

    marketSearchEvents.value = Array.isArray(response.events) ? response.events : [];
    marketSearchPagination.value = response.pagination ?? null;

    if (marketSearchEvents.value.length === 0) {
      selectedSearchEvent.value = null;
    } else {
      selectedSearchEvent.value = marketSearchEvents.value[0] ?? null;
    }
  } catch (err) {
    console.error("Failed to search Polymarket markets:", err);
    searchError.value = "Could not load results. Try again.";
    marketSearchEvents.value = [];
    selectedSearchEvent.value = null;
  } finally {
    searchLoading.value = false;
  }
}

function selectSearchEvent(event: PolymarketGammaSearchEvent) {
  selectedSearchEvent.value = event;
  // Don't clear selected market if it belongs to this event
  if (selectedMarket.value && selectedSearchEvent.value?.markets?.some(m => m.id === selectedMarket.value?.id)) {
    return;
  }
  selectedMarket.value = null;
  selectedOutcome.value = "";
}

// --- URL loading ---
const { data: urlMarketData, error: urlMarketError, isFetching: urlIsFetching } =
  useMarketData(urlEndpoint, "news-stepper-modal");

watch(urlIsFetching, (v) => {
  urlLoading.value = v;
});

watch(urlMarketError, (err) => {
  urlError.value = err?.message || "";
});

watch(urlMarketData, (value) => {
  urlEvent.value = toEvent(value);
  urlMarkets.value = toMarketList(value);
  if (urlMarkets.value.length === 0) {
    urlError.value = "No markets found at this URL.";
  }
});

function toEvent(value: PolymarketEvent | PolymarketMarket | unknown): PolymarketEvent | null {
  if (!value || typeof value !== "object") return null;
  if ("markets" in value && Array.isArray((value as PolymarketEvent).markets)) {
    return value as PolymarketEvent;
  }
  return null;
}

function toMarketList(value: PolymarketEvent | PolymarketMarket | unknown): PolymarketMarket[] {
  if (!value || typeof value !== "object") return [];
  if ("markets" in value && Array.isArray((value as PolymarketEvent).markets)) {
    return (value as PolymarketEvent).markets;
  }
  const marketValue = value as PolymarketMarket;
  return marketValue.id ? [marketValue] : [];
}

function handleUrlFetch() {
  urlError.value = "";
  const url = marketUrl.value.trim();
  if (!url) return;

  const parsed = parsePolymarketUrl(url);
  if (!parsed) {
    urlError.value = "Invalid Polymarket URL.";
    return;
  }

  // Clear search results when loading from URL
  marketSearchEvents.value = [];
  selectedSearchEvent.value = null;
  urlMarkets.value = [];
  urlEvent.value = null;
  selectedMarket.value = null;
  selectedOutcome.value = "";

  urlEndpoint.value =
    parsed.type === "market"
      ? `/markets/slug/${parsed.slug}`
      : `/events/slug/${parsed.slug}`;
}

// --- Selection ---
function selectMarket(
  market: PolymarketGammaSearchMarket | PolymarketMarket,
  outcome: "Yes" | "No",
) {
  if (selectedMarket.value?.id === market.id && selectedOutcome.value === outcome) {
    // Toggle off
    selectedMarket.value = null;
    selectedOutcome.value = "";
    return;
  }
  selectedMarket.value = market;
  selectedOutcome.value = outcome;
}

function getMarketOutcomes(market: PolymarketGammaSearchMarket | PolymarketMarket): string[] {
  const raw = (market as any).outcomes;
  return (parseIfString(raw as string | string[] | undefined) as string[] | undefined) ?? [];
}

function getMarketTokenIds(market: PolymarketGammaSearchMarket | PolymarketMarket): string[] {
  const raw = (market as any).clobTokenIds;
  return (parseIfString(raw as string | string[] | undefined) as string[] | undefined) ?? [];
}

function getMarketImage(market: PolymarketGammaSearchMarket | PolymarketMarket): string | undefined {
  return (market as any).image || (market as any).icon || undefined;
}

type TagSource = { tags?: Array<{ label?: string }> } | null | undefined;

function getMarketTagLabels(
  market: PolymarketGammaSearchMarket | PolymarketMarket,
): string[] {
  const linkedEvents = Array.isArray(market.events) ? market.events : [];
  const sources: TagSource[] = [
    selectedSearchEvent.value,
    urlEvent.value,
    market,
    ...linkedEvents,
  ];
  const labels: string[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    for (const tag of source?.tags ?? []) {
      const label = tag?.label?.trim();
      if (!label) continue;

      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      labels.push(label);
    }
  }

  return labels;
}

function toPolymarketMarketUrl(market: PolymarketGammaSearchMarket | PolymarketMarket): string {
  const slug = (market.slug ?? "").trim();
  if (!slug) return "https://polymarket.com";
  return `https://polymarket.com/market/${encodeURIComponent(slug)}`;
}

function handleConfirm() {
  if (!selectedMarket.value || !selectedOutcome.value) return;

  const market = selectedMarket.value;
  const outcome = selectedOutcome.value;
  const outcomes = getMarketOutcomes(market);
  const tokenIds = getMarketTokenIds(market);
  const tokenId = tokenIds[outcomes.indexOf(outcome)] || "";

  const eventTitle =
    selectedSearchEvent.value?.title ||
    urlEvent.value?.title ||
    market.events?.[0]?.title ||
    (urlMarkets.value.length > 0 ? market.question : "");

  emit("confirm", {
    url: toPolymarketMarketUrl(market),
    eventTitle: eventTitle ?? "",
    marketId: market.id ?? "",
    marketSlug: market.slug ?? "",
    marketQuestion: market.question ?? "",
    outcome,
    tokenId,
    image: getMarketImage(market),
    tags: getMarketTagLabels(market),
  });

  open.value = false;
}

function handleCancel() {
  emit("cancel");
  open.value = false;
}

function handleImageError(event: Event) {
  const image = event.target as HTMLImageElement | null;
  if (!image) return;
  image.src = DEFAULT_FALLBACK_IMAGE;
}

// Reset state when modal opens
watch(open, (isOpen) => {
  if (isOpen) {
    selectedMarket.value = null;
    selectedOutcome.value = "";
  }
});
</script>
