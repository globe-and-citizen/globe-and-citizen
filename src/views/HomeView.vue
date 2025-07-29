<template>
  <div class="mt-6 lg:mt-0 px-4 md:px-8 lg:px-[120px] lg:pb-10">
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
      description="Why Are You Doing This? In the excellent book “Founders Dilemmas,” Naom Wasserman describes a series of decisio..."
      button-title="Learn more"
      url="/advertisement/1"
      image="https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
    />
    <div class="gc-container py-10">
      <WhatOurReadersSay :all-posts="allPosts" />
    </div>
  </div>
</template>
<script setup lang="ts">
import NowTrending from "../components/NowTrending/NowTrending.vue";
import ExploreMore from "@/sections/HomePage/ExploreMore/ExploreMore.vue";
import WhatOurReadersSay from "@/sections/HomePage/WhatOurReadersSay/WhatOurReadersSay.vue";
import HeroSection from "@/sections/HomePage/HomeHeroSection/HeroSection.vue";
import AdvertisementCard from "@/components/AdvertisementCard/AdvertisementCard.vue";
import { useWindowSize } from "@vueuse/core";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import type { FetchPostsType } from "@/models/Posts";
import { fetchAllPosts } from "@/api/posts.ts";

const { width } = useWindowSize();
const isMobile = computed(() => width.value < 768);

const { data: allPosts } = useQuery<FetchPostsType>({
  queryKey: ["allPosts"],
  queryFn: () => fetchAllPosts(10, 1),
  refetchOnWindowFocus: true,
});

const filteredPosts = computed(() => {
  return allPosts.value?.data.filter((post) => post.author !== "");
});
</script>
