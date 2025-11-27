<template>
  <div class="px-4 md:px-8 lg:px-[120px]">
    <div v-if="isLoading" class="animate-pulse">
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
    <div class="gc-container">
      <div
        v-if="!isLoading && news.length === 0"
        class="w-full py-20 flex flex-col items-center text-center"
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
          alt="No articles"
          class="w-32 h-32 opacity-70 mb-4"
        />
        <h2 class="text-xl font-semibold text-gray-700">No articles found</h2>
        <p class="text-gray-500 mt-1">
          Try adjusting your filters or check again later.
        </p>
      </div>
      <!-- Articles Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto mt-12"
      >
        <div v-for="(article, index) in news" :key="index">
          <RouterLink
            v-if="!article.is_external"
            :to="
              category === 'opinions'
                ? {
                    name: 'PostEntryView',
                    params: { id: article.post_slug, opinionId: article.slug },
                  }
                : { name: 'PostView', params: { id: article.slug } }
            "
          >
            <VerticalCard
              :post="{
                id: index,
                title: article.title,
                description: article.description || '',
                content: article.content || '',
                author: article.author ? article.author : article.user.username,
                created_at: article.created_at || '',
                updated_at: article.publishedAt || '',
                url_to_image: article.url_to_image || '',
                user_id: 0,
                categories: [],
                is_external: true,

                slug: article.slug || `external-${index}`,
                source_url: article.url || '',
                source_name: article.source?.name || 'Unknown Source',
                version: 1,
                comments: [],
                sentences: [],
                total_comments: 0,
                user: {
                  id: 0,
                  username: article.source?.name || 'Unknown Source',
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
                  role: { id: 0, description: '', level: 0, name: 'user' },
                  description: '',
                  email_verified: false,
                  display_name: article.source?.name || 'Unknown Source',
                  color: '',
                  metadata_updated_at: new Date().toISOString(),
                },
              }"
              :show-reading-time-and-comments="false"
            />
          </RouterLink>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="!isLoading && news.length > 0"
        class="flex flex-col sm:flex-row items-center justify-between py-4"
      >
        <div class="flex items-center space-x-2 mx-auto">
          <Button
            variant="outline"
            size="sm"
            :disabled="isLoading || !canGoPrev"
            @click="currentPage--"
          >
            Previous
          </Button>

          <span class="text-sm mx-2">
            Page {{ currentPage }} of {{ totalPages }}
          </span>

          <Button
            variant="outline"
            size="sm"
            :disabled="isLoading || !canGoNext"
            @click="currentPage++"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchAllPosts } from "@/api/posts";
import { fetchAllOpinions } from "@/api/opinions";
import type { AllNewsResponseType } from "@/models/Posts";
import { useQuery } from "@tanstack/vue-query";
import { computed, ref, watch } from "vue";
import VerticalCard from "@/components/VerticalCard.vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

const route = useRoute();
const pageSize = ref(10);
const router = useRouter();

const currentPage = ref(Number(route.query.page) || 1);
const category = computed(() => (route.query.category as string) || null);

const fetchFn = async () => {
  if (category.value === "opinions") {
    return fetchAllOpinions(pageSize.value, currentPage.value);
  } else {
    return fetchAllPosts(pageSize.value, currentPage.value);
  }
};

const { data, isLoading, refetch } = useQuery<AllNewsResponseType>({
  queryKey: ["allNews", currentPage, pageSize, category],
  queryFn: fetchFn,
  refetchOnWindowFocus: true,
});

watch(category, () => {
  currentPage.value = 1;
  refetch();
});

watch(currentPage, (newPage) => {
  router.replace({
    query: {
      ...route.query,
      page: newPage,
    },
  });
});

watch(
  () => route.query.page,
  (newPage) => {
    currentPage.value = Number(newPage) || 1;
    refetch();
  }
);

const news = computed(() => data.value?.data.posts ?? []);
const totalCount = computed(() => data.value?.data.totalCount ?? 0);
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

const canGoPrev = computed(() => currentPage.value > 1);
const canGoNext = computed(() => currentPage.value < totalPages.value);
</script>
