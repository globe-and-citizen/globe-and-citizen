<template>
  <div :key="postId" class="w-full px-4 md:px-8 max-w-7xl mx-auto">
    <HeadingSection v-if="post" :post="post" />

    <img
      v-if="post && post.url_to_image"
      :src="post?.url_to_image"
      alt="Post hero image"
      class="h-[300px] md:h-[400px] lg:h-[440px] w-full object-cover rounded-lg mb-6 md:mb-8"
    />

    <div
      v-if="post"
      class="lg:pb-10 flex flex-col lg:flex-row gap-6 lg:gap-10 font-lato"
    >
      <div class="w-full lg:w-8/12 lg:border-r lg:border-gray-200 lg:pr-10">
        <div class="gc-container">
          <div class="flex flex-col items-center mb-6 md:mb-8">
            <h2 class="text-xl md:text-2xl font-bold mb-2 text-center">
              {{ post.title }}
            </h2>
            <p class="text-gray-600 mb-4 text-center text-sm md:text-base">
              By {{ post.author }} on {{ formattedDate }}
            </p>
            <p class="text-gray-600 mb-2 text-sm md:text-base">
              {{ readingTime }} minute read
            </p>

            <!-- Like/Dislike Buttons -->
            <div class="flex items-center gap-3 md:gap-4 mb-4">
              <button
                :class="[
                  'flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-colors text-sm md:text-base',
                  post.user_vote === 1
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100',
                ]"
                @click="handleReaction(1)"
              >
                <svg
                  class="w-4 h-4 md:w-5 md:h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
                  />
                </svg>
                <span class="text-sm font-medium">{{ post?.likes }}</span>
              </button>

              <button
                :class="[
                  'flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg border transition-colors text-sm md:text-base',
                  post.user_vote === -1
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100',
                ]"
                @click="handleReaction(-1)"
              >
                <svg
                  class="w-4 h-4 md:w-5 md:h-5 rotate-180"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.48 7.48 0 016 15.375c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23h-.777zM2.331 10.977a11.969 11.969 0 00-.831 4.398 12 12 0 00.52 3.507c.26.85 1.084 1.368 1.973 1.368H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 01-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227z"
                  />
                </svg>
                <span class="text-sm font-medium">{{ post?.dislikes }}</span>
              </button>
            </div>

            <div
              v-if="post.source_url"
              class="flex flex-col sm:flex-row items-center gap-2"
            >
              <span class="text-gray-500 text-xs md:text-sm">Source:</span>
              <a
                :href="post.source_url"
                target="_blank"
                rel="noopener noreferrer nofollow"
                referrerpolicy="no-referrer"
                class="text-blue-600 hover:text-blue-800 underline text-xs md:text-sm flex items-center gap-1"
              >
                {{ post.source_name || "View Original Article" }}
                <svg
                  class="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
          <div class="prose prose-sm md:prose-lg max-w-none">
            <div class="ql-editor" v-html="sanitizedContent"></div>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-4/12 lg:mt-0 mt-8">
        <!-- Mobile/Tablet: Show related opinions in a horizontal scroll -->
        <div v-if="displayedEntries.length > 0" class="mb-8 lg:hidden">
          <h3 class="text-lg md:text-xl font-bold mb-4">Related Opinions</h3>
          <div class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            <router-link
              v-for="opinion in displayedEntries"
              :key="opinion.id"
              :to="`/post/${postId}/${opinion.slug}`"
              class="block hover:opacity-90 flex-shrink-0 w-64"
            >
              <div class="bg-white rounded-lg shadow-sm border p-4">
                <img
                  :src="opinion.url_to_image"
                  alt="Related opinion"
                  class="w-full h-32 object-cover rounded mb-3"
                />
                <div>
                  <h4 class="font-medium text-sm line-clamp-2">
                    {{ opinion.title }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-2">
                    Opinion by {{ opinion.author }}
                  </p>
                </div>
              </div>
            </router-link>
          </div>
          <div class="mt-4">
            <router-link
              to="/opinions"
              class="text-blue-600 hover:underline text-sm"
            >
              View all opinions
            </router-link>
          </div>
        </div>

        <!-- Desktop: Show related opinions in sidebar -->
        <div v-if="displayedEntries.length > 0" class="mb-8 hidden lg:block">
          <h3 class="text-xl font-bold mb-4">Related Opinions</h3>
          <div class="space-y-4">
            <router-link
              v-for="opinion in displayedEntries"
              :key="opinion.id"
              :to="`/post/${postId}/${opinion.slug}`"
              class="block hover:opacity-90"
            >
              <div class="flex gap-3">
                <img
                  :src="opinion.url_to_image"
                  alt="Related opinion"
                  class="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h4 class="font-medium text-sm">{{ opinion.title }}</h4>
                  <p class="text-xs text-gray-500 mt-1">
                    Opinion by {{ opinion.author }}
                  </p>
                </div>
              </div>
            </router-link>
          </div>
          <div class="mt-4">
            <router-link
              to="/opinions"
              class="text-blue-600 hover:underline text-sm"
            >
              View all opinions
            </router-link>
          </div>
        </div>

        <div v-else class="hidden lg:block">
          <h3 class="text-xl font-bold mb-6">Related Opinions</h3>
          <p class="text-gray-500">No related opinions to display</p>
        </div>
        <div class="mt-5">
          <h3 class="text-xl font-bold mb-6">Stats Summary</h3>

          <AppBarChart v-if="post" :post="post" />
        </div>
      </div>
    </div>

    <div class="mb-8 md:mb-12">
      <div v-if="post && post.entries && post.entries.length > 0" class="mb-8">
        <h3 class="text-lg md:text-xl font-bold mb-4 md:mb-6 border-b pb-2">
          Related Opinions
        </h3>
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <router-link
            v-for="opinion in displayedEntries"
            :key="opinion.id"
            :to="`/post/${postId}/${opinion.slug}`"
            class="block"
          >
            <VerticalCard
              :post="opinion"
              :show-avatar="true"
              :show-tags="false"
              :show-reading-time-and-comments="false"
            />
          </router-link>
        </div>
        <div v-if="post.entries.length > entriesLimit" class="mt-6 text-center">
          <button
            class="text-blue-600 hover:underline font-medium text-sm md:text-base"
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
        <h3 class="text-lg md:text-xl font-bold mb-4 md:mb-6 border-b pb-2">
          Related Opinions
        </h3>
        <p class="text-gray-500 text-sm md:text-base">
          No related opinions to display
        </p>
      </div>
    </div>
    <CommentsSection :post="post" type="post" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { computed, ref, onMounted } from "vue";
import type { Post } from "@/models/Posts";
import HeadingSection from "@/sections/PostView/HeadingSection/HeadingSection.vue";
import VerticalCard from "@/components/ArticleCard/Vertical/VerticalCard.vue";
import DOMPurify from "dompurify";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@/quill.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { fetchPostById } from "@/api/posts";
import CommentsSection from "@/sections/PostView/CommentsSection/CommentsSection.vue";
import AppBarChart from "@/components/Charts/AppBarChart.vue";
import { postReaction } from "@/api/reactions";
const route = useRoute();
const postId = route.params.id as string;
const queryClient = useQueryClient();

// Fetch the main post
const { data: post } = useQuery<Post | null, unknown, Post | null, string[]>({
  queryKey: ["post", postId],
  queryFn: async () => {
    const response = await fetchPostById(postId);
    return response as Post | null;
  },
  enabled: !!postId,
  staleTime: 0,
  refetchOnMount: true,
});

// Likes Mutation
const publishMutation = useMutation({
  mutationFn: postReaction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["postReaction", postId] });
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  },
  onError: () => {
    console.error("Failed to publish article");
  },
});

onBeforeRouteUpdate(async (to) => {
  const newPostId = to.params.id as string;
  if (newPostId !== postId) {
    await queryClient.invalidateQueries({ queryKey: ["post", newPostId] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const sanitizedContent = computed(() => {
  if (!post.value || !post.value.content) return "";
  return DOMPurify.sanitize(post.value.content);
});

const entriesLimit = 3;
const showAllEntries = ref(false);

const handleReaction = (score: 1 | -1) => {
  publishMutation.mutate({
    post_id: post.value!.id,
    score,
  });
};

const displayedEntries = computed(() => {
  if (!post.value || !post.value.entries) return [];
  return showAllEntries.value
    ? post.value.entries
    : post.value.entries.slice(0, entriesLimit);
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for horizontal scroll on mobile */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Improve prose typography on mobile */
@media (max-width: 768px) {
  .prose {
    font-size: 16px;
    line-height: 1.6;
  }

  .prose h1,
  .prose h2,
  .prose h3,
  .prose h4 {
    margin-top: 1.5em;
    margin-bottom: 0.75em;
  }

  .prose p {
    margin-bottom: 1em;
  }
}
</style>
