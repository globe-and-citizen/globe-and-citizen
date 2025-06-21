<template>
  <div>
    <h1>Trending Posts</h1>
    <div class="post-cards">
      <VerticalCard
        v-for="post in data?.data"
        :key="post.id"
        :post="post"
        :show-tags="true"
        :show-reading-time-and-comments="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { fetchUsersFeed } from "../api/posts";
import type { FetchPostsType } from "../models/Posts";
import { useSearchStore } from "../store/searchStore";
import { watch } from "vue";
import VerticalCard from "../components/ArticleCard/Vertical/VerticalCard.vue";

const searchStore = useSearchStore();
const { data, refetch } = useQuery<FetchPostsType>({
  queryKey: ["trendingPosts", searchStore.query],
  queryFn: () => fetchUsersFeed(0, 0, searchStore.query),
  refetchOnWindowFocus: true,
});

watch(
  () => searchStore.query,
  () => {
    refetch();
  }
);
console.log(data);
</script>
<style scoped>
.post-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}
</style>
