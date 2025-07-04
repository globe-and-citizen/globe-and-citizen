<template>
  <section class="what-our-readers-say py-8">
    <p class="font-lato font-bold text-2xl mb-6">What our readers say</p>

    <div class="flex flex-col sm:flex-row gap-8">
      <!-- First Container -->
      <div class="flex gap-8">
        <VerticalCard
          v-if="filteredPosts && filteredPosts.length > 0"
          :key="filteredPosts?.[0].id"
          :post="filteredPosts?.[0]"
          :show-avatar="true"
          :show-tags="false"
          :show-reading-time-and-comments="false"
        />
        <div>
          <p
            class="text-primary-red underline decoration-red-20 underline-offset-4 font-lato font-semibold text-heading-h6"
          >
            Opinions
          </p>
        </div>
      </div>

      <!-- Second Container -->
      <div class="flex gap-8">
        <VerticalCard
          v-if="filteredPosts && filteredPosts.length > 0"
          :key="filteredPosts?.[1].id"
          :post="filteredPosts?.[1]"
          :show-avatar="true"
          :show-tags="false"
          :show-reading-time-and-comments="false"
        />
        <div>
          <p
            class="text-primary-red underline decoration-red-20 underline-offset-4 font-lato font-semibold text-heading-h6"
          >
            Opinions
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import VerticalCard from "../../../components/ArticleCard/Vertical/VerticalCard.vue";
import { fetchAllPosts } from "@/api/posts";
import type { FetchPostsType } from "@/models/Posts";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

const { data: allPosts } = useQuery<FetchPostsType>({
  queryKey: ["allPosts"],
  queryFn: () => fetchAllPosts(10, 1),
  refetchOnWindowFocus: true,
});

const filteredPosts = computed(() => {
  return allPosts.value?.data.filter((post) => post.author !== "").slice(0, 2);
});
</script>
