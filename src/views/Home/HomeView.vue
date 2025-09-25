<template>
  <div class="mt-20 md:mt-0 px-4 md:px-8 xl:px-[120px] lg:pb-10">
    <div class="gc-container">
      <HeroSection />
    </div>
    <div class="gc-container py-10">
      <NowTrending show-winner-tag :post="filteredPosts?.[0]" />
    </div>
    <div class="gc-container py-10">
      <ExploreMore :posts="filteredPosts ? filteredPosts : []" />
    </div>

    <AdvertisementCard
      class="mx-auto"
      :layout="isMobile ? 'vertical' : 'horizontal'"
      title="CNC-portal a new way to business"
      description="CNC Portal enables the creation and management of Crypto Native Corporations - a revolutionary way to build and scale companies using blockchain technology."
      button-title="Learn more"
      url="https://cncportal.io/"
      image="https://cncportal.io/_ipx/_/Logo.png"
    />
    <div v-if="showForWhatOurReadersSay" class="gc-container py-10">
      <WhatOurReadersSay :all-posts="postsForWhatOurReadersSay" />
    </div>
  </div>
</template>
<script setup lang="ts">
import NowTrending from "./sections/NowTrending.vue";
import ExploreMore from "@/views/Home/sections/ExploreMore.vue";
import WhatOurReadersSay from "@/views/Home/sections/WhatOurReadersSay.vue";
import HeroSection from "@/views/Home/sections/HeroSection.vue";
import AdvertisementCard from "@/components/AdvertisementCard.vue";
import { useWindowSize } from "@vueuse/core";
import { useQuery } from "@tanstack/vue-query";
import { computed, ref, watch } from "vue";
import type { FetchPostsType } from "@/models/Posts";
import { fetchAllPosts } from "@/api/posts.ts";
import { type Id, toast, type ToastOptions } from "vue3-toastify";
import { useAuthStore } from "@/store/authStore";
import { traceUser } from "@/api/user";

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const loadingToastId = ref<Id>(0);

const postsQuery = useQuery<FetchPostsType>({
  queryKey: ["allPosts"],
  queryFn: () => fetchAllPosts(10, 1),
  refetchOnWindowFocus: true,
});

// const authStore = useAuthStore();
// // Get user location
// const { data: userLocation } = useQuery<{
//   country_long: string;
//   ip_addr: string;
// }>({
//   queryKey: ["userLocation"],
//   queryFn: traceUser,
//   staleTime: 1000 * 60 * 60 * 24, // 24 hours
//   enabled: computed(
//     () => authStore.isUserAuthenticated && !authStore.trackedLocation
//   ),
// });

// watch(
//   () => authStore.token,
//   async (newVal) => {
//     console.log(newVal);
//     if (newVal && userLocation.value?.country_long) {
//       console.log("updating?");
//       authStore.setTrackedLocation(userLocation.value.country_long);
//     }
//   }
// );

watch(
  () => postsQuery.error.value,
  (newError) => {
    if (newError?.message) {
      toast(newError?.message, {
        autoClose: 1000,
        type: "error",
      } as ToastOptions);
    }
  }
);
// EXAMPLE OF USING WATCH TO SHOW LOADING TOAST
watch(
  () => postsQuery.isPending.value,
  (loading) => {
    if (loading) {
      loadingToastId.value = toast("Loading posts...", {
        type: "loading",
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: false,
      });
    } else if (loadingToastId.value) {
      toast.remove(loadingToastId.value);
      loadingToastId.value = 0;
    }
  },
  { immediate: true }
);

const filteredPosts = computed(() => {
  return postsQuery.data.value?.data.filter((post) => post.author !== "");
});

const postsForWhatOurReadersSay = computed(() => {
  return filteredPosts.value?.slice(0, 2) || [];
});

const showForWhatOurReadersSay = computed(() => {
  return postsForWhatOurReadersSay.value.every(
    (post) => post.entries_count && post.entries_count > 0
  );
});
</script>
