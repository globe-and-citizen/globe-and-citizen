<template>
  <section
    v-if="filteredPosts && filteredPosts?.length > 1"
    class="what-our-readers-say py-8"
  >
    <p class="font-lato font-bold text-2xl mb-6">What our readers say</p>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- First Container -->
      <div
        class="flex flex-col md:flex-row md:gap-8 lg:max-w-1/2 w-full p-4 shadow-card-soft bg-white md:bg-inherit"
      >
        <RouterLink :to="`post/${filteredPosts[0].slug}`">
          <VerticalCard
            :key="filteredPosts[0].id"
            :post="filteredPosts[0]"
            :show-avatar="true"
            :show-tags="false"
            :show-reading-time-and-comments="false"
            :no-shadow="true"
          />
        </RouterLink>

        <div class="md:w-1/2">
          <p
            class="text-primary-red underline decoration-red-20 underline-offset-4 font-lato font-semibold text-heading-h6 pb-1"
          >
            Viewpoint
          </p>
          <RouterLink
            v-for="value in whatOurReadersSay1?.entries"
            :key="value.id"
            :to="`/post/${filteredPosts[0].slug}/${value.slug}`"
            class="flex flex-col border-b border-transparent hover:border-b hover:border-black-20 transition duration-200 lg:pt-1 lg:pb-3"
          >
            <p class="text-xs font-medium text-black-80">
              {{ value.user.username }}
            </p>
            <p class="font-libre text-heading-h6 text-black-100 leading-[1]">
              {{ value.title }}
            </p>
          </RouterLink>
        </div>
      </div>

      <!-- Second Container -->
      <div
        class="flex-col md:flex-row-reverse lg:flex-row flex md:gap-8 lg:max-w-1/2 w-full p-4 shadow-card-soft bg-white md:bg-inherit"
      >
        <RouterLink :to="`post/${filteredPosts[1].slug}`">
          <VerticalCard
            :key="filteredPosts[1].id"
            :post="filteredPosts[1]"
            :show-avatar="true"
            :show-tags="false"
            :show-reading-time-and-comments="false"
            :no-shadow="true"
          />
        </RouterLink>

        <div class="md:w-1/2">
          <p
            class="text-primary-red underline decoration-red-20 underline-offset-4 font-lato font-semibold text-heading-h6 pb-1"
          >
            Viewpoint
          </p>
          <RouterLink
            v-for="value in whatOurReadersSay2?.entries"
            :key="value.id"
            :to="`/post/${filteredPosts[1].slug}/${value.slug}`"
            class="flex flex-col border-b border-transparent hover:border-b hover:border-black-20 transition duration-200 lg:pt-1 lg:pb-3"
          >
            <p class="text-xs font-medium text-black-80">
              {{ value.user.username }}
            </p>
            <p class="font-libre text-heading-h6 text-black-100 leading-[1]">
              {{ value.title }}
            </p>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import VerticalCard from "../../../components/VerticalCard.vue";
import { fetchAllPosts, fetchPostById } from "@/api/posts.ts";
import type { FetchPostsType, Post } from "@/models/Posts";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { RouterLink } from "vue-router";

const { data: allPosts } = useQuery<FetchPostsType>({
  queryKey: ["allPosts"],
  queryFn: () => fetchAllPosts(10, 1),
  refetchOnWindowFocus: true,
});

const filteredPosts = computed(() => {
  return allPosts.value?.data.filter((post) => post.author !== "").slice(0, 2);
});

const { data: whatOurReadersSay1 } = useQuery<Post>({
  queryKey: ["whatOurReadersSay1", filteredPosts],
  queryFn: () => {
    if (!filteredPosts.value) throw new Error("filteredPosts is undefined");
    return fetchPostById(filteredPosts.value[0].slug);
  },
  enabled: computed(
    () => filteredPosts.value && filteredPosts.value?.length > 0
  ),
});

const { data: whatOurReadersSay2 } = useQuery<Post>({
  queryKey: ["whatOurReadersSay2", filteredPosts],
  queryFn: () => {
    if (!filteredPosts.value) throw new Error("filteredPosts is undefined");
    return fetchPostById(filteredPosts.value[1].slug);
  },
  enabled: computed(
    () => filteredPosts.value && filteredPosts.value?.length > 1
  ),
});
</script>
