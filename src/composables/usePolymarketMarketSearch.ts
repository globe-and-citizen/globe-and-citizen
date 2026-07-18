import { computed, ref } from "vue";
import {
  searchPolymarketPublic,
  type PolymarketGammaPagination,
  type PolymarketGammaSearchEvent,
} from "@/api/polymarket";

const DEFAULT_FALLBACK_IMAGE =
  "https://polymarket-upload.s3.us-east-2.amazonaws.com/polymarket_logo.png";

export type PolymarketSearchEventCard = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  event: PolymarketGammaSearchEvent;
};

export function toPolymarketEventUrl(
  event: PolymarketGammaSearchEvent | null,
): string {
  const slug = event?.slug?.trim() ?? "";
  return slug
    ? `https://polymarket.com/event/${encodeURIComponent(slug)}`
    : "https://polymarket.com";
}

export function usePolymarketMarketSearch() {
  const dialogOpen = ref(false);
  const query = ref("");
  const loading = ref(false);
  const loadingMore = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref<PolymarketGammaPagination | null>(null);
  const currentPage = ref(1);
  const events = ref<PolymarketGammaSearchEvent[]>([]);

  const results = computed<PolymarketSearchEventCard[]>(() => {
    const seen = new Set<string>();
    return events.value.flatMap((event) => {
      if (!event?.id || seen.has(event.id)) return [];
      seen.add(event.id);
      const markets = event.markets ?? [];
      return [
        {
          id: event.id,
          title: event.title?.trim() || "Untitled event",
          subtitle: `${markets.length} market${markets.length === 1 ? "" : "s"}`,
          image: String(
            event.icon || event.image || DEFAULT_FALLBACK_IMAGE,
          ).trim(),
          event,
        },
      ];
    });
  });

  function openDialog() {
    dialogOpen.value = true;
    error.value = null;
  }

  function closeDialog() {
    dialogOpen.value = false;
  }

  function reset() {
    dialogOpen.value = false;
    query.value = "";
    loading.value = false;
    loadingMore.value = false;
    error.value = null;
    pagination.value = null;
    currentPage.value = 1;
    events.value = [];
  }

  async function fetchPage(page: number, append: boolean) {
    const searchQuery = query.value.trim();
    if (!searchQuery) {
      events.value = [];
      pagination.value = null;
      currentPage.value = 1;
      error.value = null;
      return;
    }

    if (page === 1) loading.value = true;
    else loadingMore.value = true;
    error.value = null;

    try {
      const response = await searchPolymarketPublic({
        q: searchQuery,
        limitPerType: 50,
        page,
      });
      const incoming = Array.isArray(response.events) ? response.events : [];
      if (append) {
        const seen = new Set(events.value.map((event) => event.id));
        events.value = [
          ...events.value,
          ...incoming.filter((event) => event.id && !seen.has(event.id)),
        ];
      } else {
        events.value = incoming;
      }
      pagination.value = response.pagination ?? null;
      currentPage.value = page;
    } catch (cause) {
      console.error("Failed to search Polymarket events:", cause);
      error.value = "Could not load results. Try again.";
      if (!append) {
        events.value = [];
        pagination.value = null;
        currentPage.value = 1;
      }
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  }

  async function runSearch() {
    await fetchPage(1, false);
  }

  async function loadMore() {
    if (loading.value || loadingMore.value || !pagination.value?.hasMore) return;
    await fetchPage(currentPage.value + 1, true);
  }

  function handleImageError(event: Event) {
    const image = event.target as HTMLImageElement | null;
    if (image) image.src = DEFAULT_FALLBACK_IMAGE;
  }

  return {
    dialogOpen,
    query,
    loading,
    loadingMore,
    error,
    pagination,
    results,
    openDialog,
    closeDialog,
    reset,
    runSearch,
    loadMore,
    handleImageError,
  };
}
