<template>
  <Dialog v-model:open="open">
    <DialogContent
      class="w-[92vw] max-w-[1200px] max-h-[85vh] overflow-hidden flex flex-col"
    >
      <DialogHeader>
        <DialogTitle>Search Polymarket Markets</DialogTitle>
        <DialogDescription>
          Search events, then choose a market to load into the workspace.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 min-h-0">
        <div class="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            v-model="marketSearchQuery"
            type="text"
            placeholder="Search markets..."
            @keydown.enter.prevent="runMarketSearch"
          />
          <Button
            :disabled="marketSearchLoading || !marketSearchQuery.trim()"
            @click="runMarketSearch"
          >
            {{ marketSearchLoading ? "Searching..." : "Search" }}
          </Button>
        </div>

        <p v-if="marketSearchError" class="text-sm text-red-600">
          {{ marketSearchError }}
        </p>
        <p
          v-else-if="marketSearchQuery.trim() && !marketSearchLoading"
          class="text-sm text-muted-foreground"
        >
          Showing {{ searchEventResults.length }} event{{
            searchEventResults.length === 1 ? "" : "s"
          }}
        </p>

        <div class="grid gap-4 min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div
            class="border rounded-lg overflow-hidden min-h-0 flex flex-col"
          >
            <div class="border-b px-4 py-3 text-sm font-medium">Events</div>
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              <div
                v-if="marketSearchLoading"
                class="text-sm text-muted-foreground"
              >
                Loading events...
              </div>
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
                    @error="handleSearchImageError"
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

              <div
                v-if="!marketSearchLoading && searchEventResults.length === 0"
                class="text-sm text-muted-foreground"
              >
                Search for an event to view its markets.
              </div>

              <div v-if="marketSearchPagination?.hasMore" class="pt-2">
                <Button
                  variant="outline"
                  class="w-full"
                  :disabled="marketSearchLoadingMore"
                  @click="loadMoreMarketSearchResults"
                >
                  {{
                    marketSearchLoadingMore
                      ? "Loading..."
                      : "Load more events"
                  }}
                </Button>
              </div>
            </div>
          </div>

          <div
            class="border rounded-lg overflow-hidden min-h-0 flex flex-col"
          >
            <div
              class="border-b px-4 py-3 flex items-center justify-between gap-3"
            >
              <div>
                <div class="text-sm font-medium">
                  {{ selectedSearchEvent?.title ?? "Markets" }}
                </div>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ selectedSearchEvent?.markets?.length ?? 0 }} market{{
                    (selectedSearchEvent?.markets?.length ?? 0) === 1
                      ? ""
                      : "s"
                  }}
                  available
                </p>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div
                v-if="!selectedSearchEvent"
                class="h-full flex items-center justify-center text-sm text-muted-foreground"
              >
                Select an event to view and add its markets.
              </div>

              <div
                v-for="market in selectedSearchEvent?.markets ?? []"
                :key="market.id"
                class="rounded-lg border p-4 grid gap-3"
                :class="
                    isSearchMarketSelected(selectedSearchEvent, market)
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
                    <a
                      :href="toPolymarketMarketUrl(market)"
                      target="_blank"
                      rel="noreferrer"
                      class="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
                    >
                      Open on Polymarket
                    </a>
                  </div>

                  <div
                    class="text-sm font-semibold whitespace-nowrap text-right"
                  >
                    <div
                      v-if="isSearchMarketSelected(selectedSearchEvent, market)"
                      class="mt-1 text-xs font-medium text-primary"
                    >
                      Selected
                    </div>
                  </div>
                </div>

                <div
                  class="grid gap-4 sm:grid-cols-[minmax(0,420px)_auto] sm:items-end"
                >
                  <div class="flex justify-end gap-4">
                    <Button
                      v-for="opt in selectMarketOptions ?? []"
                      :key="opt.name"
                      :class="
                        isOptionSelected(opt, selectedSearchEvent, market)
                          ? 'bg-gray-600 text-white hover:bg-gray-700'
                          : ''
                      "
                      @click="addSelectedMarket(opt, selectedSearchEvent, market)"
                    >
                      {{ isOptionSelected(opt, selectedSearchEvent, market) ? "Remove" : "Add" }} {{ opt.name }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {Input} from "@/components/ui/input";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {
  type PolymarketGammaPagination,
  type PolymarketGammaSearchEvent, type PolymarketGammaSearchMarket, searchPolymarketPublic,
  type SelectMarketOption
} from "@/api/polymarket.ts";
import {computed, ref} from "vue";
import type {PolymarketMarket} from "@/types";

const open = defineModel<boolean>("open", {
  default: false,
});

const DEFAULT_FALLBACK_IMAGE =
  "https://polymarket-upload.s3.us-east-2.amazonaws.com/polymarket_logo.png";

type SearchEventCardItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  event: PolymarketGammaSearchEvent;
};

const marketSearchQuery = ref("");
const marketSearchLoading = ref(false);
const marketSearchLoadingMore = ref(false);
const marketSearchError = ref<string | null>(null);
const marketSearchPagination = ref<PolymarketGammaPagination | null>(null);
const marketSearchCurrentPage = ref(1);
const marketSearchEvents = ref<PolymarketGammaSearchEvent[]>([]);
const selectedSearchEvent = ref<PolymarketGammaSearchEvent | null>(null);

const selectMarketOptions = defineModel<SelectMarketOption[]>("selectMarketOptions", {
  default: () => [],
});

async function runMarketSearch() {
  await fetchMarketSearchPage({page: 1, append: false});
}

async function fetchMarketSearchPage(opts: { page: number; append: boolean }) {
  const query = marketSearchQuery.value.trim();
  if (!query) {
    marketSearchEvents.value = [];
    marketSearchPagination.value = null;
    marketSearchCurrentPage.value = 1;
    selectedSearchEvent.value = null;
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

    if (marketSearchEvents.value.length === 0) {
      selectedSearchEvent.value = null;
    } else if (
      !selectedSearchEvent.value ||
      !marketSearchEvents.value.some(
        (event) => event.id === selectedSearchEvent.value?.id,
      )
    ) {
      selectedSearchEvent.value = marketSearchEvents.value[0] ?? null;
    }
  } catch (err) {
    console.error("Failed to search Polymarket markets:", err);
    marketSearchError.value = "Could not load results. Try again.";
    if (!opts.append) {
      marketSearchEvents.value = [];
      marketSearchPagination.value = null;
      marketSearchCurrentPage.value = 1;
      selectedSearchEvent.value = null;
    }
  } finally {
    marketSearchLoading.value = false;
    marketSearchLoadingMore.value = false;
  }
}

async function loadMoreMarketSearchResults() {
  if (marketSearchLoading.value || marketSearchLoadingMore.value) return;
  if (!marketSearchPagination.value?.hasMore) return;
  await fetchMarketSearchPage({
    page: marketSearchCurrentPage.value + 1,
    append: true,
  });
}

function selectSearchEvent(event: PolymarketGammaSearchEvent) {
  selectedSearchEvent.value = event;
}

function addSelectedMarket(
  opt: SelectMarketOption,
  event: PolymarketGammaSearchEvent | null,
  market: PolymarketGammaSearchMarket | PolymarketMarket,
) {
  if (isOptionSelected(opt, event, market)) {
    opt.event = null;
    opt.market = null;
    opt.isSelected = false;
    return
  }

  opt.isSelected = true;
  opt.event = event;
  opt.market = market;
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

function handleSearchImageError(event: Event) {
  const image = event.target as HTMLImageElement | null;
  if (!image) return;
  image.src = DEFAULT_FALLBACK_IMAGE;
}

function isOptionSelected(
  opt: SelectMarketOption,
  event: PolymarketGammaSearchEvent | null,
  market: PolymarketGammaSearchMarket | PolymarketMarket,
) {
  if (!opt.isSelected) return false;
  if (opt.event?.id !== event?.id) return false;
  return opt.market?.id === market.id;
}

function isSearchMarketSelected(
  event: PolymarketGammaSearchEvent | null,
  market: PolymarketGammaSearchMarket | PolymarketMarket,
) {
  for (const opt of selectMarketOptions.value ?? []) {
    if (
      opt.isSelected &&
      opt.event?.id === event?.id &&
      opt.market?.id === market.id
    ) {
      return true;
    }
  }
  return false;
}

function toPolymarketMarketUrl(market: PolymarketGammaSearchMarket | PolymarketMarket) {
  const slug = (market.slug ?? "").trim();
  if (!slug) return "https://polymarket.com";
  return `https://polymarket.com/market/${encodeURIComponent(slug)}`;
}

</script>

<style scoped>

</style>
