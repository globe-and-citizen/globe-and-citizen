<template>
  <div class="flex items-center py-2 mb-6 justify-between">
    <p class="font-lato font-bold text-2xl">Explore more</p>
    <Button class="!w-fit" :variant="'tertiary'" :title="'See all'" />
  </div>
  <div
    ref="scrollContainer"
    class="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-4 w-auto"
  >
    <router-link
      v-for="(post, index) in posts"
      :key="index"
      v-slot="{ navigate, href }"
      :to="{ name: 'PostView', params: { id: post.id } }"
      custom
    >
      <VerticalCard
        :post="post"
        scroll-card
        class="flex-shrink-0 w-[300px] snap-start"
        :href="href"
        @click="navigate"
      />
    </router-link>
  </div>
  <div class="justify-self-end">
    <button class="p-1 h-8 rounded-full cursor-pointer" @click="scrollLeft">
      <component :is="prevArrow" />
    </button>
    <button class="p-1 h-8 rounded-full cursor-pointer" @click="scrollRight">
      <component :is="nextArrow" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import VerticalCard from "../../../components/ArticleCard/Vertical/VerticalCard.vue";

import Button from "../../../components/Button/Button.vue";
import nextArrow from "../../../assets/nav-arrow-next.svg";
import prevArrow from "../../../assets/nav-arrow-prev.svg";
import type { Post } from "../../../models/Posts";

defineProps<{
  posts: Post[];
}>();

const scrollContainer = ref<HTMLDivElement | null>(null);

const scrollRight = () => {
  scrollContainer.value?.scrollBy({ left: 100, behavior: "smooth" });
};

const scrollLeft = () => {
  scrollContainer.value?.scrollBy({ left: -400, behavior: "smooth" });
};
</script>

<style>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
