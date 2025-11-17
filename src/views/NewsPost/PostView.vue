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
        <NewsPostHeadingSection :post="post" />

        <img
          v-if="post && post.url_to_image"
          :src="post?.url_to_image"
          alt="Post hero image"
          class="h-[200px] md:h-[320px] lg:h-[522px] w-full object-cover rounded-lg mb-6 md:mb-6"
        />
        <!-- Sticky Readers Insights + Stats (becomes fixed once scrolled past its original position) -->
        <div ref="insightsWrapper" class="p-4 lg:p-0.5 lg:pt-3">
          <ReadersInsightsAndStats
            :sentences="post?.sentences"
            :model-value="showAnnotations"
            @update:model-value="showAnnotations = $event"
          />
        </div>
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
                  :likes="post.likes"
                  :dislikes="post.dislikes"
                  :user-vote="post.user_vote"
                  :pending="reactionPending"
                  @react="handleReaction"
                />
              </div>
              <CommentsSection :post="post" type="post" />
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
            </div>

            <!-- Desktop: Show related opinions in sidebar -->
            <div
              v-if="displayedEntries.length > 0"
              class="mb-8 hidden mx-auto h-full lg:flex flex-col justify-around"
            >
              <WhatDoYouThinkCTA />

              <div class="mb-40 ml-5">
                <h3 class="text-xl font-bold mb-4 max-w-3/4 mt-8">
                  What our readers are saying about it
                </h3>
                <div class="space-y-4 max-w-[379px]">
                  <router-link
                    v-for="opinion in displayedEntries"
                    :key="opinion.id"
                    :to="`/post/${postId}/${opinion.slug}`"
                    class="block hover:opacity-90 hover:shadow-card-soft px-3 py-1"
                  >
                    <div class="flex gap-3">
                      <div class="w-full">
                        <div class="flex">
                          <p
                            class="underline underline-offset-4 decoration-primary-red font-lato text-base font-medium"
                          >
                            Viewpoint
                          </p>
                          <RouterLink
                            :to="`/profile/${opinion.user.username}`"
                            class="flex items-center ml-2"
                          >
                            <img
                              v-if="opinion.user.profile_picture_url"
                              alt="User profile picture"
                              :src="opinion.user.profile_picture_url"
                              class="w-6 h-6 object-cover rounded-full mr-1"
                            />
                            <div
                              v-else
                              class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mr-1"
                              :style="
                                generateUserIcon(opinion.user?.username || 'A')
                              "
                            >
                              <span class="text-black text-sm font-normal">
                                {{
                                  opinion.user?.username
                                    .charAt(0)
                                    .toUpperCase() || "A"
                                }}
                              </span>
                            </div>
                            <p>@{{ opinion.user.username }}</p>
                          </RouterLink>
                          <p
                            class="ml-auto text-xs font-medium font-lato text-black-40 content-center"
                          >
                            {{
                              dayjs(opinion.created_at).format("MMM D, YYYY")
                            }}
                          </p>
                        </div>
                        <h4 class="font-libre font-medium text-base">
                          {{ opinion.title }}
                        </h4>
                        <div
                          class="text-black-80 mb-3 font-lato font-normal text-xs flex-none"
                          v-html="
                            post?.content.substring(0, 110) + '...' ||
                            post?.description ||
                            'No content available'
                          "
                        />
                      </div>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>

            <div v-else class="hidden lg:block m-auto">
              <WhatDoYouThinkCTA />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useRoute, onBeforeRouteUpdate, RouterLink } from "vue-router";
import { computed, ref, onMounted } from "vue";
import type { Post } from "@/models/Posts";
import NewsPostHeadingSection from "@/views/NewsPost/sections/NewsPostHeadingSection.vue";
import DOMPurify from "dompurify";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@/quill.css";
import Segmented from "@/components/SegmentedContent.vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { fetchPostById } from "@/api/posts.ts";
import CommentsSection from "@/components/CommentsSection.vue";
import LikeDislikeButtons from "@/components/LikeDislikeButtons.vue";
import { postReaction } from "@/api/reactions.ts";
import WhatDoYouThinkCTA from "@/components/WhatDoYouThinkCTA.vue";
import ReadersInsightsAndStats from "@/components/ReadersInsightsAndStats.vue";
import dayjs from "dayjs";
import { generateUserIcon } from "@/composables/utils.ts";

const route = useRoute();
const postId = decodeURIComponent(route.params.id as string);
const queryClient = useQueryClient();
const showAnnotations = ref(false);

const touchStartX = ref(0);
const touchStartY = ref(0);
const touchEndX = ref(0);
const touchEndY = ref(0);
// const minSwipeDistance = 50;
// const maxVerticalDistance = 100;
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
  // if (window.innerWidth >= 1024) return;
  // const deltaX = touchEndX.value - touchStartX.value;
  // const deltaY = Math.abs(touchEndY.value - touchStartY.value);
  // const screenWidth = window.innerWidth;
  // const edgeThreshold = screenWidth;
  // const isFromLeftEdge = touchStartX.value <= edgeThreshold;
  // const isFromRightEdge = touchStartX.value >= screenWidth - edgeThreshold;
  // const isHorizontalSwipe = Math.abs(deltaX) >= minSwipeDistance;
  // const isNotTooVertical = deltaY <= maxVerticalDistance;
  // if (
  //   (isFromLeftEdge || isFromRightEdge) &&
  //   isHorizontalSwipe &&
  //   isNotTooVertical
  // ) {
  //   if (
  //     (isFromRightEdge && deltaX < -minSwipeDistance) ||
  //     (isFromLeftEdge && deltaX > minSwipeDistance)
  //   ) {
  //     showAnnotations.value = !showAnnotations.value;
  //     if ("vibrate" in navigator) {
  //       navigator.vibrate(50);
  //     }
  //   }
  // }
  // touchStartX.value = 0;
  // touchStartY.value = 0;
  // touchEndX.value = 0;
  // touchEndY.value = 0;
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

// Optimistic Likes/Dislikes Mutation for Posts
const publishMutation = useMutation({
  mutationFn: postReaction,
  onMutate: async (variables: { post_id: number; score: 1 | -1 }) => {
    await queryClient.cancelQueries({ queryKey: ["post", postId] });
    const prevData = queryClient.getQueryData<Post | null>(["post", postId]);
    if (prevData) {
      const prevLikeCount = prevData.likes || 0;
      const prevDislikeCount = prevData.dislikes || 0;
      const prevUserVote = prevData.user_vote || 0; // 0 none
      let newLikes = prevLikeCount;
      let newDislikes = prevDislikeCount;
      let newUserVote: 1 | -1 | 0 =
        prevUserVote === 1 || prevUserVote === -1 ? prevUserVote : 0;
      const sameVote = prevUserVote === variables.score;
      const switching = prevUserVote !== 0 && prevUserVote !== variables.score;
      if (sameVote) {
        if (variables.score === 1) newLikes = Math.max(0, newLikes - 1);
        else newDislikes = Math.max(0, newDislikes - 1);
        newUserVote = 0;
      } else if (switching) {
        if (prevUserVote === 1) newLikes = Math.max(0, newLikes - 1);
        if (prevUserVote === -1) newDislikes = Math.max(0, newDislikes - 1);
        if (variables.score === 1) newLikes += 1;
        else newDislikes += 1;
        newUserVote = variables.score;
      } else {
        if (variables.score === 1) newLikes += 1;
        else newDislikes += 1;
        newUserVote = variables.score;
      }
      queryClient.setQueryData<Post | null>(["post", postId], {
        ...prevData,
        likes: newLikes,
        dislikes: newDislikes,
        user_vote: newUserVote,
      });
    }
    return { prevData };
  },
  onError: (err, _vars, context) => {
    if (context?.prevData) {
      queryClient.setQueryData(["post", postId], context.prevData);
    }
    console.error("Failed to add reaction", err);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  },
});

const reactionPending = computed(
  () => publishMutation.status.value === "pending"
);

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
  if (!post.value) return;
  publishMutation.mutate({ post_id: post.value.id, score });
};

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

/* Sticky Readers Insights bar */
.reader-insights-sticky {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--color-white-100);
  backdrop-filter: saturate(180%) blur(4px);
}

@media (min-width: 1024px) {
  .reader-insights-sticky {
    top: 0px;
  }
}
</style>
