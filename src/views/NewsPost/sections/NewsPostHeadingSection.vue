<template>
  <div class="my-4">
    <div class="flex flex-col max-w-[1086px]">
      <a
        :href="post.source_url ?? '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="underline underline-offset-2 decoration-primary-red text-heading-h6 font-semibold mb-4"
      >
        {{ post.source_name }}
      </a>

      <div class="flex items-center gap-4 text-black-60 font-medium mb-4">
        <span v-if="post.created_at">
          {{ new Date(post.created_at).toDateString() }}
        </span>
      </div>

      <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ post?.title }}</h1>

      <div class="flex gap-4">
        <p class="text-gray-600 mb-2 text-xs flex items-center gap-2">
          <component :is="clock" /> {{ readingTime }} min
        </p>
        <p
          class="text-gray-600 mb-2 text-xs flex items-center gap-2 cursor-pointer"
          @click="scrollToComments"
        >
          <component :is="comments" />
          {{ post.comments?.length ?? 0 }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from "@/models/Posts";
import { computed, onMounted, ref } from "vue";
import clock from "@/assets/icons/clock.svg";
import comments from "@/assets/icons/comments.svg";

const props = defineProps({
  post: {
    type: Object as () => Partial<Post>,
    required: true,
  },
});

const commentSection = ref<HTMLElement | null>(null);

onMounted(() => {
  commentSection.value = document.getElementById("comments-section");
});

const scrollToComments = () => {
  commentSection.value?.scrollIntoView({ behavior: "smooth" });
};

const readingTime = computed(() => {
  if (!props.post?.content) return 0;

  const wordsPerMinute = 200;
  const words = props.post.content.split(" ").length;
  return Math.ceil(words / wordsPerMinute);
});
</script>
