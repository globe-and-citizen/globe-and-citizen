<template>
  <div class="w-full min-w-0 space-y-6">
    <section class="bg-white">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <figure
          class="overflow-hidden"
          aria-label="Polymarket prediction market: Bitcoin Up or Down on April 29?"
        >
          <iframe
            title="polymarket-market-iframe"
            src="https://embed.polymarket.com/market?market=bitcoin-up-or-down-on-april-30-2026&volume=false&chart=false&yaxis=false&grid=false&buttons=false&creator=cnapulcram&width=600&height=100"
            height="100"
            frameBorder="0"
            class="w-full"
          />
          <figcaption class="sr-only">
            Bitcoin Up or Down on April 30? Up 51% and Down 50%.
          </figcaption>
        </figure>

        <figure
          class="overflow-hidden"
          aria-label="Polymarket prediction market: Ethereum Up or Down on April 30?"
        >
          <iframe
            title="polymarket-market-iframe"
            src="https://embed.polymarket.com/market?market=ethereum-up-or-down-on-april-30-2026&volume=false&chart=false&yaxis=false&grid=false&buttons=false&creator=cnapulcram&width=600&height=100"
            height="100"
            frameBorder="0"
            class="w-full"
          />
          <figcaption class="sr-only">
            Ethereum Up or Down on April 30? Up 49% and Down 52%.
          </figcaption>
        </figure>
      </div>
    </section>
    <section class="bg-white/90 overflow-hidden">
      <div class="space-y-4">
        <form
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5"
          @submit.prevent="applyConfiguration"
        >
          <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
            <label class="space-y-2 md:col-span-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Track Query
              </span>
              <input
                v-model="draftConfig.q"
                type="text"
                placeholder="bitcoin OR ethereum"
                class="h-10 w-full rounded-xl border border-slate-300 px-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              />
            </label>

            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Sort By
              </span>
              <select
                v-model="draftConfig.sortBy"
                class="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              >
                <option value="publishedAt">Latest</option>
                <option value="relevancy">Relevancy</option>
                <option value="popularity">Popularity</option>
              </select>
            </label>

            <label class="space-y-2">
              <span
                class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Items Per Refresh
              </span>
              <select
                v-model.number="draftConfig.pageSize"
                class="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200"
              >
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="30">30</option>
                <option :value="50">50</option>
              </select>
            </label>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              class="h-10 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!hasConfigurationChanges"
            >
              Apply Filters
            </button>
            <button
              type="button"
              class="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              @click="resetConfiguration"
            >
              Reset Defaults
            </button>
            <button
              type="button"
              class="h-10 rounded-xl border border-cyan-300 bg-cyan-50 px-4 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
              @click="refreshNow"
            >
              Refresh Now
            </button>
            <label
              class="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600"
            >
              <input
                v-model="isTrumpFeedEnabled"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-300"
                @change="handleTrumpFeedToggle"
              />
              <span>Follow Trump Feed</span>
            </label>
          </div>

          <div
            class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs uppercase tracking-[0.16em] text-slate-500"
          >
            <span>Auto Refresh: Every 1 minute</span>
            <span class="h-1 w-1 rounded-full bg-slate-400" />
            <span>Last Checked: {{ lastChecked }}</span>
            <span v-if="isFetching" class="text-cyan-700"
              >Syncing live data...</span
            >
          </div>
        </form>

        <div
          v-if="isLoading"
          class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <div
            v-for="placeholder in 6"
            :key="placeholder"
            class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div class="h-4 w-1/3 rounded bg-slate-200" />
            <div class="mt-3 h-6 w-5/6 rounded bg-slate-200" />
            <div class="mt-2 h-4 w-full rounded bg-slate-200" />
            <div class="mt-2 h-4 w-4/5 rounded bg-slate-200" />
          </div>
        </div>

        <div
          v-else-if="showErrorState"
          class="rounded-2xl border border-rose-300 bg-rose-50 p-6"
        >
          <div class="text-sm font-semibold text-rose-800">
            Failed to load live updates.
          </div>
          <p class="mt-2 text-sm text-rose-700">
            {{ errorMessage }}
          </p>
          <button
            type="button"
            class="mt-4 h-10 rounded-xl border border-rose-300 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
            @click="refreshNow"
          >
            Try Again
          </button>
        </div>

        <div
          v-else-if="!articles.length"
          class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6"
        >
          <div class="text-sm font-medium text-slate-700">
            No live updates yet.
          </div>
          <p class="mt-2 text-sm text-slate-500">
            Adjust your query or wait for the next one-minute refresh cycle.
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
          >
            {{ articles.length }} live updates (News API
            {{ newsApiArticles.length }} + Finlight
            {{ finlightArticles.length }} + Truth Social
            {{ isTrumpFeedEnabled ? trumpArticles.length : 0 }})
            <span
              class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.22em] text-rose-700"
            >
              <span
                class="live-indicator-dot h-2 w-2 rounded-full bg-red-600"
              />
              <span>LIVE</span>
            </span>
          </div>

          <article
            v-for="(article, index) in articles"
            :key="`${article.url}-${index}`"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
          >
            <div class="grid grid-cols-1 md:grid-cols-[1fr_240px]">
              <div class="p-4 md:p-5">
                <div
                  class="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
                >
                  <span>{{ article.source.name }}</span>
                  <span class="h-1 w-1 rounded-full bg-slate-400" />
                  <span>{{ relativePublishedAt(article.publishedAt) }}</span>
                </div>

                <h2
                  class="mt-2 text-lg font-semibold text-slate-900 md:text-xl"
                >
                  {{ article.title }}
                </h2>

                <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {{ article.description || "No description available." }}
                </p>

                <div class="mt-4 flex items-center justify-between gap-3">
                  <span
                    class="text-xs uppercase tracking-[0.14em] text-slate-400"
                  >
                    {{ formatPublishedAt(article.publishedAt) }}
                  </span>
                  <a
                    :href="article.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex h-9 items-center rounded-full border border-slate-300 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                  >
                    Open Source
                  </a>
                </div>
              </div>

              <div
                class="relative min-h-[180px] border-t border-slate-200 md:border-l md:border-t-0"
              >
                <img
                  v-if="article.urlToImage"
                  :src="article.urlToImage"
                  :alt="article.title"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <div
                  v-else
                  class="flex h-full items-center justify-center bg-slate-100 px-4 text-center text-xs uppercase tracking-[0.15em] text-slate-400"
                >
                  No Image Available
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { fetchNewsEverything } from "@/api/news";
import { ApiClient } from "finlight-client/dist/client/apiClient";
import { ArticleService } from "finlight-client/dist/services/articleService";
import { defaultApiConfig } from "finlight-client/dist/types/config";
import type { GetArticleApiResponse } from "finlight-client/dist/types/types";
import type { NewsApiArticle, NewsApiResponse } from "@/models/News";
import { useQuery } from "@tanstack/vue-query";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type {
  LiveFeedConfig,
  NormalizedLiveFeedConfig,
  TruthSocialPost,
} from "./types";
import {
  DEFAULT_LIVE_FEED_CONFIG,
  LIVE_FEED_STORAGE_KEY,
  TRUMP_FEED_STORAGE_KEY,
  FINLIGHT_API_KEY,
  TRUTH_SOCIAL_RAPIDAPI_URL,
  TRUTH_SOCIAL_RAPIDAPI_KEY,
  TRUTH_SOCIAL_RAPIDAPI_HOST,
  POLYMARKET_SCHEMA_ID,
  polymarketSchema,
} from "./constants";
import {
  stripHtml,
  createTruthSocialTitle,
  getFirstString,
  getFirstArray,
  isObjectRecord,
} from "./utils";

const now = ref(new Date());

const normalizeConfig = (
  config: Partial<LiveFeedConfig>,
): NormalizedLiveFeedConfig => {
  const nextQuery = (config.q || "").trim();
  const nextPageSize =
    Number(config.pageSize) || DEFAULT_LIVE_FEED_CONFIG.pageSize;
  const nextLanguage = (config.language || "en").trim().toLowerCase();

  return {
    q: nextQuery || DEFAULT_LIVE_FEED_CONFIG.q,
    sortBy: config.sortBy || DEFAULT_LIVE_FEED_CONFIG.sortBy,
    pageSize: Math.min(Math.max(nextPageSize, 1), 100),
    language: nextLanguage || "en",
  };
};

const getStoredConfig = (): NormalizedLiveFeedConfig | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawConfig = window.localStorage.getItem(LIVE_FEED_STORAGE_KEY);
    if (!rawConfig) {
      return null;
    }

    const parsedConfig = JSON.parse(rawConfig) as Partial<LiveFeedConfig>;
    return normalizeConfig(parsedConfig);
  } catch (error) {
    console.warn("Failed to read saved live feed config:", error);
    return null;
  }
};

const persistConfig = (config: NormalizedLiveFeedConfig) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(LIVE_FEED_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.warn("Failed to save live feed config:", error);
  }
};

const clearStoredConfig = () => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(LIVE_FEED_STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear saved live feed config:", error);
  }
};

const getStoredTrumpFeedPreference = (): boolean => {
  if (typeof window === "undefined") {
    return true;
  }

  const storedValue = window.localStorage.getItem(TRUMP_FEED_STORAGE_KEY);
  if (storedValue === null) {
    return true;
  }

  return storedValue === "true";
};

const persistTrumpFeedPreference = (isEnabled: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TRUMP_FEED_STORAGE_KEY, String(isEnabled));
};

const initialConfig = getStoredConfig() ?? { ...DEFAULT_LIVE_FEED_CONFIG };

const activeConfig = ref<NormalizedLiveFeedConfig>({ ...initialConfig });
const draftConfig = ref<NormalizedLiveFeedConfig>({ ...initialConfig });
const isTrumpFeedEnabled = ref(getStoredTrumpFeedPreference());
const finlightArticleService = new ArticleService(
  new ApiClient({
    ...defaultApiConfig,
    apiKey: FINLIGHT_API_KEY,
  }),
);

const hasConfigurationChanges = computed(() => {
  const normalizedDraft = normalizeConfig(draftConfig.value);
  const normalizedActive = normalizeConfig(activeConfig.value);

  return (
    normalizedDraft.q !== normalizedActive.q ||
    normalizedDraft.sortBy !== normalizedActive.sortBy ||
    normalizedDraft.pageSize !== normalizedActive.pageSize ||
    normalizedDraft.language !== normalizedActive.language
  );
});

const queryKey = computed(() => [
  "newsEverythingLiveFeed",
  activeConfig.value.q,
  activeConfig.value.sortBy,
  activeConfig.value.pageSize,
  activeConfig.value.language,
]);

const finlightQueryKey = computed(() => [
  "finlightLiveFeed",
  activeConfig.value.q,
  activeConfig.value.pageSize,
  activeConfig.value.language,
]);

const trumpFeedQueryKey = computed(() => [
  "truthSocialTrumpFeed",
  isTrumpFeedEnabled.value,
]);

const {
  data,
  dataUpdatedAt: newsDataUpdatedAt,
  isLoading: isNewsLoading,
  isFetching: isNewsFetching,
  isError,
  error,
  refetch,
} = useQuery<{ data: NewsApiResponse }>({
  queryKey,
  queryFn: async () => {
    const config = normalizeConfig(activeConfig.value);

    return fetchNewsEverything({
      q: config.q,
      sortBy: config.sortBy,
      pageSize: config.pageSize,
      language: config.language,
      page: 1,
    });
  },
  staleTime: 30_000,
  refetchInterval: 60_000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: false,
  retry: 1,
});

const {
  data: finlightData,
  dataUpdatedAt: finlightDataUpdatedAt,
  isLoading: isFinlightLoading,
  isFetching: isFinlightFetching,
  refetch: refetchFinlight,
} = useQuery<GetArticleApiResponse>({
  queryKey: finlightQueryKey,
  queryFn: async () => {
    const config = normalizeConfig(activeConfig.value);

    return finlightArticleService.fetchArticles({
      query: config.q,
      categories: ["crypto"],
      language: config.language,
      page: 1,
      pageSize: config.pageSize,
      orderBy: "publishDate",
      order: "DESC",
    });
  },
  staleTime: 30_000,
  refetchInterval: 60_000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: false,
  retry: 1,
});

const {
  data: trumpFeedData,
  dataUpdatedAt: trumpFeedDataUpdatedAt,
  isLoading: isTrumpLoading,
  isFetching: isTrumpFetching,
  isError: isTrumpFeedError,
  error: trumpFeedError,
  refetch: refetchTrumpFeed,
} = useQuery<unknown>({
  queryKey: trumpFeedQueryKey,
  enabled: isTrumpFeedEnabled,
  queryFn: async () => {
    const response = await fetch(TRUTH_SOCIAL_RAPIDAPI_URL, {
      method: "GET",
      headers: {
        "x-rapidapi-key": TRUTH_SOCIAL_RAPIDAPI_KEY,
        "x-rapidapi-host": TRUTH_SOCIAL_RAPIDAPI_HOST,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Truth Social feed (${response.status})`);
    }

    const result = await response.text();
    try {
      return JSON.parse(result) as unknown;
    } catch {
      throw new Error("Truth Social feed returned invalid JSON");
    }
  },
  staleTime: 30_000,
  refetchInterval: 60_000,
  refetchIntervalInBackground: true,
  refetchOnWindowFocus: false,
  retry: 1,
});

const normalizeTruthSocialPost = (item: unknown): TruthSocialPost | null => {
  if (!isObjectRecord(item)) {
    return null;
  }

  const account = isObjectRecord(item.account) ? item.account : null;
  const accountUsername = account
    ? getFirstString(account, ["username", "acct", "handle"])
    : null;

  const mediaAttachments = getFirstArray(item, [
    "media_attachments",
    "mediaAttachments",
    "media",
    "images",
  ]);

  let imageUrl: string | null = null;
  if (mediaAttachments) {
    for (const mediaItem of mediaAttachments) {
      if (!isObjectRecord(mediaItem)) {
        continue;
      }

      imageUrl = getFirstString(mediaItem, [
        "preview_url",
        "previewUrl",
        "url",
        "src",
      ]);
      if (imageUrl) {
        break;
      }
    }
  }

  const text =
    getFirstString(item, ["content", "text", "body", "status", "message"]) ||
    "";

  const fallbackProfileUrl = accountUsername
    ? `https://truthsocial.com/@${accountUsername}`
    : "https://truthsocial.com/@realDonaldTrump";

  return {
    id: getFirstString(item, ["id", "post_id", "postId"]),
    text,
    createdAt: getFirstString(item, ["created_at", "createdAt", "date"]),
    url: getFirstString(item, ["url", "uri", "link"]) || fallbackProfileUrl,
    imageUrl,
  };
};

const extractTruthSocialPosts = (payload: unknown): TruthSocialPost[] => {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => normalizeTruthSocialPost(item))
      .filter((item): item is TruthSocialPost => item !== null);
  }

  if (!isObjectRecord(payload)) {
    return [];
  }

  const candidateArrays: unknown[] = [
    payload.feed,
    payload.posts,
    payload.items,
    payload.data,
    payload.statuses,
  ];

  for (const candidate of candidateArrays) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    return candidate
      .map((item) => normalizeTruthSocialPost(item))
      .filter((item): item is TruthSocialPost => item !== null);
  }

  return [];
};

const newsApiArticles = computed<NewsApiArticle[]>(() => {
  return data.value?.data.articles ?? [];
});

const finlightArticles = computed<NewsApiArticle[]>(() => {
  const items = finlightData.value?.articles ?? [];

  return items.map((item) => {
    const publishDate = new Date(item.publishDate);

    return {
      source: {
        id: null,
        name: item.source ? `${item.source} (Finlight)` : "Finlight",
      },
      author: null,
      title: item.title,
      description: item.summary || null,
      url: item.link,
      urlToImage: item.images?.[0] || null,
      publishedAt: Number.isNaN(publishDate.getTime())
        ? new Date().toISOString()
        : publishDate.toISOString(),
      content: item.content || null,
    };
  });
});

const trumpArticles = computed<NewsApiArticle[]>(() => {
  if (!isTrumpFeedEnabled.value) {
    return [];
  }

  const posts = extractTruthSocialPosts(trumpFeedData.value);

  return posts.map((post, index) => {
    const cleanedText = stripHtml(post.text);
    const createdAtDate = post.createdAt ? new Date(post.createdAt) : null;
    const validCreatedAt =
      createdAtDate && !Number.isNaN(createdAtDate.getTime())
        ? createdAtDate.toISOString()
        : new Date().toISOString();

    return {
      source: {
        id: post.id || `truth-social-${index}`,
        name: "Truth Social (Donald Trump)",
      },
      author: "realDonaldTrump",
      title: createTruthSocialTitle(cleanedText),
      description: cleanedText || "Truth Social post",
      url: post.url || "https://truthsocial.com/@realDonaldTrump",
      urlToImage: post.imageUrl,
      publishedAt: validCreatedAt,
      content: cleanedText || null,
    };
  });
});

const articles = computed<NewsApiArticle[]>(() => {
  return [
    ...newsApiArticles.value,
    ...finlightArticles.value,
    ...trumpArticles.value,
  ].sort((left, right) => {
    return (
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime()
    );
  });
});

const isLoading = computed(() => {
  if (isTrumpFeedEnabled.value) {
    return (
      isNewsLoading.value && isFinlightLoading.value && isTrumpLoading.value
    );
  }

  return isNewsLoading.value && isFinlightLoading.value;
});

const isFetching = computed(() => {
  if (isTrumpFeedEnabled.value) {
    return (
      isNewsFetching.value || isFinlightFetching.value || isTrumpFetching.value
    );
  }

  return isNewsFetching.value || isFinlightFetching.value;
});

const showErrorState = computed(() => {
  const hasPrimaryError = isError.value;
  const hasTrumpError = isTrumpFeedEnabled.value && isTrumpFeedError.value;

  return (hasPrimaryError || hasTrumpError) && articles.value.length === 0;
});

const errorMessage = computed(() => {
  if (error.value instanceof Error) {
    return error.value.message;
  }

  if (trumpFeedError.value instanceof Error) {
    return trumpFeedError.value.message;
  }

  return "Unable to fetch updates from the live feed endpoint.";
});

const latestRefreshTimestamp = computed(() => {
  if (isTrumpFeedEnabled.value) {
    return Math.max(
      newsDataUpdatedAt.value,
      finlightDataUpdatedAt.value,
      trumpFeedDataUpdatedAt.value,
    );
  }

  return Math.max(newsDataUpdatedAt.value, finlightDataUpdatedAt.value);
});

const lastChecked = computed(() => {
  const referenceTime =
    latestRefreshTimestamp.value > 0
      ? new Date(latestRefreshTimestamp.value)
      : now.value;

  return referenceTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

const applyConfiguration = () => {
  const normalized = normalizeConfig(draftConfig.value);
  draftConfig.value = { ...normalized };
  activeConfig.value = { ...normalized };
  persistConfig(normalized);
};

const resetConfiguration = () => {
  draftConfig.value = { ...DEFAULT_LIVE_FEED_CONFIG };
  activeConfig.value = { ...DEFAULT_LIVE_FEED_CONFIG };
  clearStoredConfig();
};

const handleTrumpFeedToggle = () => {
  persistTrumpFeedPreference(isTrumpFeedEnabled.value);

  if (isTrumpFeedEnabled.value) {
    refetchTrumpFeed();
  }
};

const refreshNow = () => {
  refetch();
  refetchFinlight();

  if (isTrumpFeedEnabled.value) {
    refetchTrumpFeed();
  }
};

const formatPublishedAt = (publishedAt: string) => {
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) {
    return "Unknown publish time";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const relativePublishedAt = (publishedAt: string) => {
  const publishedDate = new Date(publishedAt);
  if (Number.isNaN(publishedDate.getTime())) {
    return "Unknown time";
  }

  const diffMs = now.value.getTime() - publishedDate.getTime();
  if (diffMs < 60_000) {
    return "Just now";
  }

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const timerId = window.setInterval(() => {
  now.value = new Date();
}, 1000);

onMounted(() => {
  const existingSchema = document.getElementById(POLYMARKET_SCHEMA_ID);
  if (existingSchema) {
    existingSchema.remove();
  }

  const schemaScript = document.createElement("script");
  schemaScript.id = POLYMARKET_SCHEMA_ID;
  schemaScript.type = "application/ld+json";
  schemaScript.text = JSON.stringify(polymarketSchema);
  document.head.appendChild(schemaScript);
});

onBeforeUnmount(() => {
  window.clearInterval(timerId);

  const schemaScript = document.getElementById(POLYMARKET_SCHEMA_ID);
  if (schemaScript) {
    schemaScript.remove();
  }
});
</script>

<style scoped>
@keyframes live-indicator-blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(0.75);
  }
}

.live-indicator-dot {
  animation: live-indicator-blink 1s ease-in-out infinite;
}
</style>
