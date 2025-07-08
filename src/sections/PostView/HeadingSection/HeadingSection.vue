<template>
  <div class="my-4">
    <div class="flex flex-col gap-4">
      <h1 class="text-3xl font-bold text-gray-800">{{ post?.title }}</h1>
      <div class="flex items-center gap-4 text-gray-600">
        <span v-if="post.created_at">{{
          new Date(post.created_at).toDateString()
        }}</span>
      </div>
    </div>
    <div class="flex gap-1">
      <CategoryTag
        v-for="(category, index) in post.categories"
        :key="index"
        :category-name="category"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CategoryTag from "@/components/CategoryTag/CategoryTag.vue";
import type { Post } from "@/models/Posts";
defineProps({
  post: {
    type: Object as () => Partial<Post>,
    required: true,
  },
});
</script>
