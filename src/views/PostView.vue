<template>
  <div class="px-4 md:px-8 lg:px-[120px] lg:pb-10">
    <div v-if="post" class="gc-container">
      <div class="flex flex-col items-center">
        <img
          :src="post.url_to_image"
          alt="Post hero image"
          class="w-full h-64 object-cover rounded-lg mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">{{ post.title }}</h2>
        <p class="text-gray-600 mb-4">
          By {{ post.author }} on {{ formattedDate }}
        </p>
        <p class="text-gray-600 mb-4">{{ readingTime }} minute read</p>
      </div>
      <div class="prose prose-lg max-w-none">
        <p>{{ post.content }}</p>
      </div>
    </div>
    <div v-else class="flex justify-center items-center h-64">
      <p>Loading post...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, ref } from "vue";
import { API_BASE_URL, POSTS_URL } from "@/api/constants";
import type { Post } from "@/models/Posts";

const route = useRoute();
const postId = route.params.id as string;
const post = ref<Post | null>(null);

// Fetch the post data
async function fetchPost(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${POSTS_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`Error fetching post: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data; // Assuming the API returns data in a 'data' property
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

// Load the post data
const loadPost = async () => {
  post.value = await fetchPost(postId);
};

// Load the post when the component is mounted
loadPost();

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
