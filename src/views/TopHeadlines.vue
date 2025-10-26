<template>
  <!-- skeleton for when loading initial data -->
  <div v-if="isLoadingNews" class="animate-pulse">
    <div
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div v-for="n in 8" :key="n" class="rounded-lg p-4 space-y-4">
        <div class="bg-gray-300 h-40 w-full rounded-md"></div>
        <div class="h-6 bg-gray-300 rounded w-3/4"></div>
        <div class="h-4 bg-gray-300 rounded w-full"></div>
        <div class="h-4 bg-gray-300 rounded w-full"></div>
        <div class="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  </div>
  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold mb-6">Top Headlines</h1>
    <div
      v-if="allArticles.length"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="(article, index) in allArticles"
        :key="`${article.url}-${index}`"
        class="relative"
      >
        <VerticalCard
          :post="{
            id: index,
            title: article.title,
            description: article.description || '',
            content: article.content || '',
            author: article.author || '',
            created_at: article.publishedAt,
            updated_at: article.publishedAt,
            url_to_image: article.urlToImage || '',
            user_id: 0,
            categories: [],
            is_external: true,
            slug: article.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, ''),
            source_url: article.url || '',
            source_name: article.source.name,
            version: 1,
            comments: [],
            sentences: [],
            total_comments: 0,
            user: {
              id: 0,
              username: article.source.name,
              email: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              bio: '',
              location: '',
              website: '',
              profile_picture_url:
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
              date_of_birth: '',
              role_id: 0,
              role: {
                id: 0,
                description: '',
                level: 0,
                name: 'user',
              },
              description: '',
              email_verified: false,
              display_name: article.source.name,
              color: '',
              metadata_updated_at: new Date().toISOString(),
            },
          }"
          :show-reading-time-and-comments="false"
        />
        <div class="absolute top-28 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="bg-gray-800">
                <MoreIcon class="h-6 w-6 [&>path]:stroke-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="visitSource(article)">
                Visit the Source
              </DropdownMenuItem>
              <DropdownMenuItem @click="createArticle(article)">
                Create Article
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    <div
      v-if="isFetchingNextPage"
      class="mt-8 animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <div v-for="n in 4" :key="n" class="rounded-lg p-4 space-y-4">
        <div class="bg-gray-300 h-40 w-full rounded-md"></div>
        <div class="h-6 bg-gray-300 rounded w-3/4"></div>
        <div class="h-4 bg-gray-300 rounded w-full"></div>
      </div>
    </div>

    <div ref="sentinelRef" class="h-10"></div>

    <div
      v-if="!hasNextPage && allArticles.length > 0"
      class="text-center py-8 text-gray-500"
    >
      No more articles to load
    </div>
  </div>
</template>

<script setup lang="ts">
import VerticalCard from "@/components/VerticalCard.vue";
import { useInfiniteQuery, useMutation } from "@tanstack/vue-query";
import {
  fetchNewsApi,
  generateNewsApiSummary,
  type NewsApiSummaryPayload,
} from "@/api/news";
import type { NewsApiArticle } from "@/models/News";
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import MoreIcon from "@/assets/icons/more-icon.svg";
import { useGlobalStore } from "@/store/globalStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
const router = useRouter();

const sentinelRef = ref<HTMLElement | null>(null);
const globalStore = useGlobalStore();

const { mutate: generatePost } = useMutation({
  mutationFn: async (
    payload: NewsApiSummaryPayload
  ): Promise<{ success: boolean; data: NewsApiSummaryPayload }> => {
    return await generateNewsApiSummary(payload);
  },
  onSuccess: (res) => {
    globalStore.setGeneratedPost(res.data);
    router.push(`/profile/create`).catch((err) => {
      console.error("Navigation error:", err);
    });
  },
  onMutate: () => {
    toast("Generating post. Please wait...", {
      type: "loading",
    });
  },
  onError: () => {
    toast("Failed to generate post. Please refresh and try again:", {
      type: "error",
    });
  },
});

const {
  data,
  isLoading: isLoadingNews,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
} = useInfiniteQuery({
  queryKey: ["newsApiData"],
  queryFn: async ({ pageParam = 1 }) => {
    return fetchNewsApi({ page: pageParam });
  },
  getNextPageParam: (lastPage, allPages) => {
    const currentPage = allPages.length;
    const totalArticles = allPages.reduce(
      (sum, page) => sum + page.data.articles.length,
      0
    );

    if (lastPage.data.articles.length === 0) {
      return undefined;
    }

    if (
      lastPage.data.totalResults &&
      totalArticles >= lastPage.data.totalResults
    ) {
      return undefined;
    }

    return currentPage + 1;
  },
  initialPageParam: 1,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});

const allArticles = computed<NewsApiArticle[]>(() => {
  if (!data.value?.pages) return [];
  return data.value.pages.flatMap((page) => page.data.articles);
});

const visitSource = (article: NewsApiArticle) => {
  if (article.url) {
    window.open(article.url, "_blank");
  }
};

const createArticle = (article: NewsApiArticle) => {
  generatePost({
    author: article.author,
    content: article.content,
    description: article.description,
    publishedAt: article.publishedAt,
    source: article.source.name,
    title: article.title,
    url: article.url,
    urlToImage: article.urlToImage,
  });
};

let observer: IntersectionObserver | null = null;

const setupIntersectionObserver = () => {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(
    (entries) => {
      const firstEntry = entries[0];
      if (
        firstEntry.isIntersecting &&
        hasNextPage.value &&
        !isFetchingNextPage.value
      ) {
        fetchNextPage();
      }
    },
    {
      rootMargin: "100px",
    }
  );

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
};

watch([sentinelRef, () => data.value], ([sentinel, newsData]) => {
  if (sentinel && newsData?.pages?.length) {
    setupIntersectionObserver();
  }
});

onMounted(() => {
  setupIntersectionObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>
