<template>
  <!-- skeleton for when loading. Should be as cards -->
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
      v-if="newsData?.data?.articles?.length"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
    >
      <VerticalCard
        v-for="(article, index) in newsData.data.articles"
        :key="index"
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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import VerticalCard from "@/components/VerticalCard.vue";
import { useQuery } from "@tanstack/vue-query";
import { fetchNewsApi } from "@/api/news";
import type { NewsApiResponse } from "@/models/News";

const { data: newsData, isLoading: isLoadingNews } = useQuery<{
  data: NewsApiResponse;
}>({
  queryKey: ["newsApiData"],
  queryFn: fetchNewsApi,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});
</script>
