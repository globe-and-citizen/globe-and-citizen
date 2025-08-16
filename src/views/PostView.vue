<template>
  <div
    v-if="isLoading"
    class="animate-pulse space-y-4 py-10"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
    <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
    <div class="h-[300px] bg-gray-100 rounded-lg w-full"></div>
    <div class="h-4 bg-gray-200 rounded w-full"></div>
    <div class="h-4 bg-gray-200 rounded w-11/12"></div>
    <div class="h-4 bg-gray-200 rounded w-10/12"></div>
  </div>

  <transition name="fade">
    <div
      v-if="!isLoading && post"
      :key="postId"
      class="mt-6 lg:mt-0 px-4 md:px-8 lg:px-[120px] lg:pb-10"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <div class="gc-container">
        <HeadingSection :post="post" />

        <img
          v-if="post && post.url_to_image"
          :src="post?.url_to_image"
          alt="Post hero image"
          class="h-[200px] md:h-[320px] lg:h-[522px] w-full object-cover rounded-lg mb-6 md:mb-6"
        />
        <ReadersInsightsAndStats
          :sentences="post?.sentences"
          :model-value="showAnnotations"
          @update:model-value="showAnnotations = $event"
        />
        <div v-if="post" class="lg:pb-10 flex flex-col lg:flex-row font-lato">
          <div class="w-full lg:w-7/12">
            <div class="gc-container">
              <div class="prose prose-sm md:prose-lg max-w-none">
                <div class="ql-editor !pl-0">
                  <Segmented
                    v-model:show-annotations="showAnnotations"
                    :content="sanitizedContent"
                    :sentences="post?.sentences as any"
                    :post-type="'post'"
                  />
                </div>
              </div>
              <div class="flex flex-col items-center mb-6 md:mb-8">
                <!-- Like/Dislike Buttons -->
                <LikeDislikeButtons
                  :likes="post?.likes"
                  :dislikes="post?.dislikes"
                  :user-vote="post?.user_vote"
                  @react="handleReaction"
                />
              </div>
            </div>
          </div>
          <div class="w-full lg:w-5/12 lg:mt-0 mt-8 flex flex-col">
            <!-- Mobile/Tablet: Show related opinions in a horizontal scroll -->
            <div v-if="displayedEntries.length > 0" class="mb-8 lg:hidden">
              <h3 class="text-lg md:text-xl font-bold mb-4">
                Related Opinions
              </h3>
              <div class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                <router-link
                  v-for="opinion in displayedEntries"
                  :key="opinion.id"
                  :to="`/post/${postId}/${opinion.slug}`"
                  class="block hover:opacity-90 flex-shrink-0 w-64"
                >
                  <div class="bg-white rounded-lg shadow-sm border p-2">
                    <img
                      :src="opinion.url_to_image"
                      alt="Related opinion"
                      class="w-full h-32 object-cover rounded mb-3"
                    />
                    <div>
                      <h4 class="text-lg font-bold line-clamp-2">
                        {{ opinion.title }}
                      </h4>
                      <div class="max-w-none">
                        <div
                          class="ql-editor !p-0"
                          v-html="sanitizedContent.substring(0, 70) + '...'"
                        ></div>
                      </div>
                      <p class="text-xs text-gray-500 mt-2">
                        Opinion by {{ opinion.user.username }}
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
            <div
              v-if="displayedEntries.length > 0"
              class="mb-8 hidden lg:block"
            >
              <WhatDoYouThinkCTA />

              <h3 class="text-xl font-bold mb-4 mt-auto">
                What our readers are saying about it
              </h3>
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

            <div v-else class="hidden lg:block m-auto">
              <!-- <h3 class="text-xl font-bold mb-6">Related Opinions</h3> -->
              <WhatDoYouThinkCTA />

              <!-- <p class="text-gray-500">No related opinions to display</p> -->
            </div>
            <!-- <div class="mt-5">
              <h3 class="text-xl font-bold mb-6">Stats Summary</h3>

              <AppBarChart v-if="post" :post="post" />
            </div> -->
          </div>
        </div>

        <div class="mb-8 md:mb-12">
          <div
            v-if="post && post.entries && post.entries.length > 0"
            class="mb-8"
          >
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
            <div
              v-if="post.entries.length > entriesLimit"
              class="mt-6 text-center"
            >
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
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { computed, ref, onMounted, watchEffect } from "vue";
import type { Post } from "@/models/Posts";
import HeadingSection from "@/sections/PostView/HeadingSection/HeadingSection.vue";
import VerticalCard from "@/components/ArticleCard/Vertical/VerticalCard.vue";
import DOMPurify from "dompurify";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@/quill.css";
import Segmented from "@/views/Segmented.vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { fetchPostById } from "@/api/posts";
import CommentsSection from "@/sections/PostView/CommentsSection/CommentsSection.vue";
import LikeDislikeButtons from "@/components/LikeDislikeButtons/LikeDislikeButtons.vue";
import { postReaction } from "@/api/reactions";
import WhatDoYouThinkCTA from "@/components/WhatDoYouThinkCTA/WhatDoYouThinkCTA.vue";
import ReadersInsightsAndStats from "@/components/ReadersInsightsAndStats/ReadersInsightsAndStats.vue";

const route = useRoute();
const postId = decodeURIComponent(route.params.id as string);
const queryClient = useQueryClient();
const showAnnotations = ref(false);

const touchStartX = ref(0);
const touchStartY = ref(0);
const touchEndX = ref(0);
const touchEndY = ref(0);
const minSwipeDistance = 50;
const maxVerticalDistance = 100;

const handleTouchStart = (event: TouchEvent) => {
  if (window.innerWidth >= 1024) return;
  const touch = event.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
};

const handleTouchMove = (event: TouchEvent) => {
  if (window.innerWidth >= 1024) return;
  const touch = event.touches[0];
  touchEndX.value = touch.clientX;
  touchEndY.value = touch.clientY;
};

const handleTouchEnd = () => {
  if (window.innerWidth >= 1024) return;

  const deltaX = touchEndX.value - touchStartX.value;
  const deltaY = Math.abs(touchEndY.value - touchStartY.value);
  const screenWidth = window.innerWidth;
  const edgeThreshold = screenWidth;

  const isFromLeftEdge = touchStartX.value <= edgeThreshold;
  const isFromRightEdge = touchStartX.value >= screenWidth - edgeThreshold;
  const isHorizontalSwipe = Math.abs(deltaX) >= minSwipeDistance;
  const isNotTooVertical = deltaY <= maxVerticalDistance;

  if (
    (isFromLeftEdge || isFromRightEdge) &&
    isHorizontalSwipe &&
    isNotTooVertical
  ) {
    if (
      (isFromRightEdge && deltaX < -minSwipeDistance) ||
      (isFromLeftEdge && deltaX > minSwipeDistance)
    ) {
      showAnnotations.value = !showAnnotations.value;

      if ("vibrate" in navigator) {
        navigator.vibrate(50);
      }
    }
  }
  touchStartX.value = 0;
  touchStartY.value = 0;
  touchEndX.value = 0;
  touchEndY.value = 0;
};

const {
  value: { data: post, isLoading },
} = computed(() =>
  useQuery<Post | null, unknown, Post | null, string[]>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await fetchPostById(postId);
      return response as Post | null;
    },
    enabled: !!postId,
    staleTime: 0,
    refetchOnMount: true,
  })
);

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

watchEffect(() => {
  console.log("Post data:", post.value);
});

const displayedEntries = computed(() => {
  if (!post.value || !post.value.entries) return [];
  return showAllEntries.value
    ? post.value.entries
    : post.value.entries.slice(0, entriesLimit);
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
