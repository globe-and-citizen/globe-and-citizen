<template>
  <div class="px-4 py-10 md:px-8 xl:px-[120px]">
    <LeafletMap :country-votes="countryVotes" />
  </div>
</template>

<script setup lang="ts">
import { fetchOpinionById, fetchPostById } from "@/api/posts";
import LeafletMap from "@/components/Charts/Map/LeafletMap.vue";
import type { Post } from "@/models/Posts";
import { useQuery } from "@tanstack/vue-query";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const opinionId = route.params.opinionId as string;
const postId = route.params.id as string;
const { data: post } = useQuery<Post | null, unknown, Post | null, string[]>({
  queryKey: ["post", postId],
  queryFn: async () => {
    const response = await fetchPostById(postId as string);
    return response as Post | null;
  },
  enabled: computed(() => postId !== undefined && opinionId === undefined),
});

const {
  value: { data: opinion },
} = computed(() =>
  useQuery<Post | null, unknown, Post | null, string[]>({
    queryKey: ["opinion", opinionId],
    queryFn: async () => {
      const response = await fetchOpinionById(opinionId);
      return response as Post | null;
    },
    enabled: computed(() => opinionId !== undefined),
  })
);

const countryVotes = computed(() => {
  // Prefer opinion when present, otherwise fall back to post
  return opinion?.value?.country_votes || post?.value?.country_votes || [];
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
</script>
