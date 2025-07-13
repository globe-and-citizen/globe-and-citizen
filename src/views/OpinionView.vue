<template>
  <div class="w-full px-4 md:px-8 max-w-7xl mx-auto">
    <!-- If viewing a post, show a back button to the opinions list -->
    <div v-if="opinionId" class="mt-6 cursor-pointer w-fit">
      <a
        class="flex items-center text-blue-600 hover:underline text-sm md:text-base"
        @click="$router.back()"
      >
        <span class="mr-1">←</span> Back
      </a>
    </div>

    <HeadingSection v-if="opinion" :post="opinion" />

    <img
      v-if="opinion"
      :src="opinion?.url_to_image"
      alt="Opinion hero image"
      class="h-[300px] md:h-[400px] lg:h-[440px] w-full object-cover rounded-lg mb-6 md:mb-8"
    />

    <div v-if="!opinion" class="flex justify-center items-center h-64">
      <p>Loading opinion article...</p>
    </div>

    <div v-if="opinion" class="lg:pb-10 flex gap-10 font-lato">
      <div class="w-8/12 border-r border-gray-200 pr-10">
        <div class="gc-container">
          <div class="flex flex-col items-center mb-8">
            <h2 class="text-2xl font-bold mb-2">{{ opinion.title }}</h2>
            <p class="text-gray-600 mb-4">
              Opinion by {{ opinion.author }} on {{ formattedDate }}
            </p>
            <p class="text-gray-600">{{ readingTime }} minute read</p>
          </div>
          <div class="prose prose-lg max-w-none">
            <div className="ql-editor" v-html="sanitizedContent"></div>
          </div>
        </div>
      </div>
      <div class="w-4/12">
        <h3 class="text-xl font-bold mb-6">Opinion Stats</h3>
        <div class="bg-gray-50 rounded-lg p-6 shadow-sm">
          <div class="space-y-6">
            <!-- Votes section -->
            <div class="border-b border-gray-200 pb-4">
              <h4 class="font-semibold text-lg mb-3">Reader Votes</h4>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-600">Agree</span>
                <div class="flex items-center">
                  <span class="font-bold mr-2">{{
                    opinionStats.votes.agree
                  }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-500 h-2 rounded-full"
                      :style="`width: ${
                        (opinionStats.votes.agree / opinionStats.votes.total) *
                        100
                      }%`"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-gray-600">Neutral</span>
                <div class="flex items-center">
                  <span class="font-bold mr-2">{{
                    opinionStats.votes.neutral
                  }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-400 h-2 rounded-full"
                      :style="`width: ${
                        (opinionStats.votes.neutral /
                          opinionStats.votes.total) *
                        100
                      }%`"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Disagree</span>
                <div class="flex items-center">
                  <span class="font-bold mr-2">{{
                    opinionStats.votes.disagree
                  }}</span>
                  <div class="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-red-500 h-2 rounded-full"
                      :style="`width: ${
                        (opinionStats.votes.disagree /
                          opinionStats.votes.total) *
                        100
                      }%`"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="mt-4 text-center">
                <p class="text-sm text-gray-500">
                  Total votes: {{ opinionStats.votes.total }}
                </p>
              </div>
            </div>

            <!-- Engagement metrics -->
            <div>
              <h4 class="font-semibold text-lg mb-3">Engagement</h4>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-3 rounded-md shadow-sm">
                  <p class="text-gray-500 text-sm">Views</p>
                  <p class="font-bold text-xl">
                    {{ opinionStats.impressions }}
                  </p>
                </div>
                <div class="bg-white p-3 rounded-md shadow-sm">
                  <p class="text-gray-500 text-sm">Comments</p>
                  <p class="font-bold text-xl">
                    {{ opinionStats.commentCount }}
                  </p>
                </div>
                <div class="bg-white p-3 rounded-md shadow-sm">
                  <p class="text-gray-500 text-sm">Shares</p>
                  <p class="font-bold text-xl">{{ opinionStats.shares }}</p>
                </div>
                <div class="bg-white p-3 rounded-md shadow-sm">
                  <p class="text-gray-500 text-sm">Avg. Time</p>
                  <p class="font-bold text-xl">
                    {{ opinionStats.avgReadTime }}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CommentsSection v-if="opinion" :post="opinion" type="opinion" />
  </div>
</template>

<script setup lang="ts">
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { computed, ref, onMounted } from "vue";
import type { Post } from "@/models/Posts";
import HeadingSection from "@/sections/PostView/HeadingSection/HeadingSection.vue";
import DOMPurify from "dompurify";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@/quill.css";
import { useQuery } from "@tanstack/vue-query";
import { fetchOpinionById } from "@/api/posts";
import CommentsSection from "@/sections/PostView/CommentsSection/CommentsSection.vue";

const route = useRoute();
const opinionId = route.params.opinionId as string;
console.log(route.params);
// Fetch the opinion
const { data: opinion } = useQuery<Post | null, unknown, Post | null, string[]>(
  {
    queryKey: ["opinion", opinionId],
    queryFn: async () => {
      const response = await fetchOpinionById(opinionId);
      return response as Post | null;
    },
  }
);

// Handle route updates for opinion changes
onBeforeRouteUpdate(async (to) => {
  const newOpinionId = to.params.opinionId as string;
  if (newOpinionId !== opinionId) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// Scroll to top on initial component mount
onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// The sanitized content to display
const sanitizedContent = computed(() => {
  if (!opinion.value || !opinion.value.content) return "";
  return DOMPurify.sanitize(opinion.value.content);
});

// Mock opinion stats (this would typically come from an API)
// In a real implementation, you would fetch opinion stats and metrics from a backend
const opinionStats = ref({
  votes: {
    agree: 128,
    neutral: 43,
    disagree: 62,
    total: 233, // Pre-calculated total for convenience
  },
  impressions: 1842,
  commentCount: 37,
  shares: 98,
  avgReadTime: 4, // Average minutes users spend reading this opinion
});

// Format date for the opinion
const formattedDate = computed(() => {
  if (!opinion.value || !opinion.value.created_at) return "";

  const date = new Date(opinion.value.created_at);
  const options = {
    year: "numeric" as const,
    month: "long" as const,
    day: "numeric" as const,
  };
  return date.toLocaleDateString("en-US", options);
});

// Calculate reading time
const readingTime = computed(() => {
  if (!opinion.value || !opinion.value.content) return 0;

  const wordsPerMinute = 200;
  const words = opinion.value.content.split(" ").length;
  return Math.ceil(words / wordsPerMinute);
});
</script>
