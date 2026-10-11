<template>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="gc-container py-8">
      <div class="mb-6 flex items-center justify-end">
        <Button
          variant="ghost"
          class="gap-2 px-0 hover:bg-transparent hover:underline hover:underline-offset-4"
          @click="filtersOpen = !filtersOpen"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="none">
            <path
              d="M4 7h16M7 12h10M10 17h4"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
            />
          </svg>
          {{ filtersOpen ? "Hide filter" : "Filter" }}
          <span
            v-if="activeFilterCount"
            class="rounded-full bg-foreground px-1.5 text-xs text-background"
          >
            {{ activeFilterCount }}
          </span>
        </Button>
      </div>

      <div
        :class="[
          'grid items-start transition-[grid-template-columns,column-gap] duration-300 ease-in-out',
          filtersOpen
            ? 'gap-6 lg:grid-cols-[240px_minmax(0,1fr)]'
            : 'gap-0 lg:grid-cols-[0px_minmax(0,1fr)]',
        ]"
      >
        <div
          :class="[
            'min-w-0 overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-in-out lg:max-h-none',
            filtersOpen
              ? 'max-h-[1000px] translate-x-0 opacity-100'
              : 'pointer-events-none max-h-0 -translate-x-3 opacity-0',
          ]"
          :aria-hidden="!filtersOpen"
          :inert="!filtersOpen"
        >
          <ContentFiltersSidebar
            v-model:open="filtersOpen"
            :authors="authors"
            :authors-loading="authorsLoading"
            :is-fetching="isFetching"
          />
        </div>

        <main class="min-w-0">
          <div v-if="isLoading" class="animate-pulse">
            <div
              :class="[
                'grid grid-cols-1 gap-6 sm:grid-cols-2',
                filtersOpen
                  ? 'xl:grid-cols-3'
                  : 'lg:grid-cols-3 xl:grid-cols-4',
              ]"
            >
              <div v-for="n in 6" :key="n" class="space-y-4 rounded-lg p-4">
                <div class="h-40 w-full rounded-md bg-gray-300"></div>
                <div class="h-6 w-3/4 rounded bg-gray-300"></div>
                <div class="h-4 w-full rounded bg-gray-300"></div>
                <div class="h-4 w-full rounded bg-gray-300"></div>
              </div>
            </div>
          </div>

          <div
            v-else-if="isError"
            class="flex w-full flex-col items-center py-20 text-center"
          >
            <h2 class="text-xl font-semibold text-gray-700">
              Predictions could not be loaded
            </h2>
            <p class="mt-1 text-gray-500">Please try again.</p>
            <Button class="mt-4" variant="outline" @click="refetch()">
              Retry
            </Button>
          </div>

          <div
            v-else-if="news.length === 0"
            class="flex w-full flex-col items-center py-20 text-center"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No articles"
              class="mb-4 h-32 w-32 opacity-70"
            />
            <h2 class="text-xl font-semibold text-gray-700">
              No predictions found
            </h2>
            <p class="mt-1 text-gray-500">
              Try adjusting the period or author filter.
            </p>
          </div>

          <template v-else>
            <div class="mb-4 text-sm text-muted-foreground">
              {{ totalCount }} prediction{{ totalCount === 1 ? "" : "s" }} found
            </div>

            <div
              :class="[
                'grid grid-cols-1 gap-6 sm:grid-cols-2',
                filtersOpen
                  ? 'xl:grid-cols-3'
                  : 'lg:grid-cols-3 xl:grid-cols-4',
              ]"
            >
              <div v-for="article in news" :key="article.id">
                <RouterLink
                  v-if="!article.is_external"
                  :to="{ name: 'PostView', params: { id: article.slug } }"
                >
                  <VerticalCard
                    :post="{
                      id: article.id,
                      title: article.title,
                      description: article.description || '',
                      content: article.content || '',
                      author: article.author || article.user.username,
                      created_at: article.created_at || '',
                      updated_at: article.updated_at ?? article.publishedAt ?? '',
                      url_to_image: article.url_to_image ?? '',
                      user_id: article.user_id ?? article.user.id,
                      categories: article.categories ?? [],
                      is_external: article.is_external ?? false,
                      slug: article.slug,
                      source_url: article.source_url || '',
                      source_name: article.source_name || 'Unknown Source',
                      version: article.version ?? 1,
                      comments: [],
                      sentences: [],
                      total_comments: 0,
                      user: article.user,
                    }"
                    :show-reading-time-and-comments="false"
                  />
                </RouterLink>
              </div>
            </div>

            <div class="flex items-center justify-center py-6">
              <div class="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="isFetching || !canGoPrev"
                  @click="goToPage(currentPage - 1)"
                >
                  Previous
                </Button>
                <span class="mx-2 text-sm">
                  Page {{ currentPage }} of {{ totalPages }}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="isFetching || !canGoNext"
                  @click="goToPage(currentPage + 1)"
                >
                  Next
                </Button>
              </div>
            </div>
          </template>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContentFilters } from "@/api/contentFilters";
import { fetchAllPosts, fetchPostAuthors } from "@/api/posts";
import ContentFiltersSidebar from "@/components/ContentFiltersSidebar.vue";
import VerticalCard from "@/components/VerticalCard.vue";
import { Button } from "@/components/ui/button";
import type { AllNewsResponseType } from "@/models/Posts";
import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const pageSize = 10;
const filtersOpen = ref(false);

const currentPage = computed(() => {
  const parsed = Number(firstQueryValue(route.query.page));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
});

const appliedFilters = computed<ContentFilters>(() => {
  const parsedAuthorId = Number(firstQueryValue(route.query.author));
  return {
    month: firstQueryValue(route.query.month) || undefined,
    from: firstQueryValue(route.query.from) || undefined,
    to: firstQueryValue(route.query.to) || undefined,
    authorId:
      Number.isInteger(parsedAuthorId) && parsedAuthorId > 0
        ? parsedAuthorId
        : undefined,
  };
});

const queryKey = computed(() => [
  "predictions",
  currentPage.value,
  pageSize,
  appliedFilters.value.month ?? "",
  appliedFilters.value.from ?? "",
  appliedFilters.value.to ?? "",
  appliedFilters.value.authorId ?? "",
]);

const { data, isLoading, isFetching, isError, refetch } =
  useQuery<AllNewsResponseType>({
    queryKey,
    queryFn: () =>
      fetchAllPosts(pageSize, currentPage.value, appliedFilters.value),
    refetchOnWindowFocus: true,
  });

const { data: authorsData, isLoading: authorsLoading } = useQuery({
  queryKey: ["prediction-authors"],
  queryFn: fetchPostAuthors,
  staleTime: 5 * 60 * 1000,
});

const authors = computed(() => authorsData.value?.data ?? []);
const news = computed(() => data.value?.data.posts ?? []);
const totalCount = computed(() => data.value?.data.totalCount ?? 0);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize));
const canGoPrev = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);
const activeFilterCount = computed(
  () =>
    Number(
      Boolean(
        appliedFilters.value.month ||
          appliedFilters.value.from ||
          appliedFilters.value.to,
      ),
    ) + Number(Boolean(appliedFilters.value.authorId)),
);

function goToPage(page: number) {
  router.replace({
    query: {
      ...route.query,
      page: page > 1 ? page.toString() : undefined,
    },
  });
}

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  return typeof value === "string" ? value : "";
}
</script>
