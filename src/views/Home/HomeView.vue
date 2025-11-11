<template>
  <div class="mt-20 md:mt-0 px-4 md:px-8 xl:px-[120px] lg:pb-10">
    <div class="gc-container">
      <HeroSection />
    </div>
    <div class="gc-container py-10">
      <NowTrending :post="filteredPosts?.[0]" />
    </div>
    <div class="gc-container pt-0 pb-10">
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
import type { AllNewsResponseType } from "@/models/Posts";
import { fetchAllPosts } from "@/api/posts.ts";
import { type Id, toast, type ToastOptions } from "vue3-toastify";
// import { useAuthStore } from "@/store/authStore";
// import { traceUser } from "@/api/user";

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);
const loadingToastId = ref<Id>(0);

const postsQuery = useQuery<AllNewsResponseType>({
  queryKey: ["allPosts"],
  queryFn: () => fetchAllPosts(10, 1),
  refetchOnWindowFocus: true,
});

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
  return postsQuery.data.value?.data.posts.filter((post) => post.author !== "");
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
