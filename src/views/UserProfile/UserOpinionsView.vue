<template>
  <div class="font-lato">
    <div
      v-if="data?.data?.length"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full"
    >
      <MyViewpointsCard
        v-for="article in data.data"
        :key="article?.id"
        :data="article"
      />
    </div>
    <div v-else class="text-center py-10 text-gray-500">
      {{ isLoading ? "Loading..." : "No articles found" }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { getUsersArticles } from "@/api/opinions.ts";
import type { FetchPostsType } from "@/models/Posts";
import { useQuery } from "@tanstack/vue-query";

import { ref } from "vue";

import MyViewpointsCard from "../../components/MyViewpointsCard.vue";
const currentPage = ref(0);
const pageSize = ref(10);

const { data, isLoading } = useQuery<FetchPostsType>({
  queryKey: ["users-articles", currentPage, pageSize],
  queryFn: () => getUsersArticles(pageSize.value, currentPage.value),
  refetchOnWindowFocus: true,
});
</script>
