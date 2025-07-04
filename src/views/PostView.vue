<template>
  <div class="w-full md:px-8 max-w-7xl mx-auto">
    <HeadingSection v-if="post" :post="post" />

    <img
      :src="post?.url_to_image"
      alt="Post hero image"
      class="h-[440px] w-full object-cover rounded-lg mb-8"
    />

    <div class="lg:pb-10 flex gap-10 font-lato">
      <div class="w-8/12 border-r border-gray-200 pr-10">
        <div v-if="post" class="gc-container">
          <div class="flex flex-col items-center mb-8">
            <h2 class="text-2xl font-bold mb-2">{{ post.title }}</h2>
            <p class="text-gray-600 mb-4">
              By {{ post.author }} on {{ formattedDate }}
            </p>
            <p class="text-gray-600">{{ readingTime }} minute read</p>
          </div>
          <div class="prose prose-lg max-w-none">
            <div className="ql-editor" v-html="sanitizedContent"></div>
          </div>
        </div>
        <div v-else class="flex justify-center items-center h-64">
          <p>Loading post...</p>
        </div>
      </div>
      <div class="w-4/12"></div>
    </div>

    <div class="mb-12">
      <div v-if="post && post.entries && post.entries.length > 0" class="mb-8">
        <h3 class="text-xl font-bold mb-6 border-b pb-2">User Contributions</h3>
        <div class="flex gap-4">
          <VerticalCard
            v-for="entry in displayedEntries"
            :key="entry.id"
            :post="entry"
            :show-avatar="true"
            :show-tags="false"
            :show-reading-time-and-comments="false"
          />
        </div>
        <div v-if="post.entries.length > entriesLimit" class="mt-6 text-center">
          <button
            class="text-blue-600 hover:underline font-medium"
            @click="showAllEntries = !showAllEntries"
          >
            {{
              showAllEntries
                ? "Show fewer contributions"
                : `Show all ${post.entries.length} contributions`
            }}
          </button>
        </div>
      </div>
      <div v-else class="mb-8">
        <h3 class="text-xl font-bold mb-6 border-b pb-2">Related Articles</h3>
        <p class="text-gray-500">No related articles to display</p>
      </div>
    </div>
    <CommentsSection :post="post" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import type { Post } from "@/models/Posts";
import HeadingSection from "@/sections/PostView/HeadingSection/HeadingSection.vue";
import VerticalCard from "@/components/ArticleCard/Vertical/VerticalCard.vue";
import DOMPurify from "dompurify";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@/quill.css";
import { useQuery } from "@tanstack/vue-query";
import { fetchPostById } from "@/api/posts";
import CommentsSection from "@/sections/PostView/CommentsSection/CommentsSection.vue";

const route = useRoute();
const postId = route.params.id as string;

const { data: post } = useQuery<Post | null, unknown, Post | null, string[]>({
  queryKey: ["post"],
  queryFn: async () => {
    const response = await fetchPostById(postId);
    return response as Post | null;
  },
});

const entriesLimit = 3;
const showAllEntries = ref(false);

const displayedEntries = computed(() => {
  if (!post.value || !post.value.entries) return [];
  return showAllEntries.value
    ? post.value.entries
    : post.value.entries.slice(0, entriesLimit);
});

const sanitizedContent = computed(() => {
  if (!post.value || !post.value.content) return "";
  return DOMPurify.sanitize(post.value.content);
});

const formattedDate = computed(() => {
  if (!post.value || !post.value.created_at) return "";

  const date = new Date(post.value.created_at);
  const options = {
    year: "numeric" as const,
    month: "long" as const,
    day: "numeric" as const,
  };
  return date.toLocaleDateString("en-US", options);
});

const readingTime = computed(() => {
  if (!post.value || !post.value.content) return 0;

  const wordsPerMinute = 200;
  const words = post.value.content.split(" ").length;
  return Math.ceil(words / wordsPerMinute);
});
</script>
