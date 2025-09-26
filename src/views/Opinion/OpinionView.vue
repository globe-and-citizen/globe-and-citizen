<template>
  <OpinionHeading v-if="opinion" :post="opinion" />
  <img
    v-if="opinion?.url_to_image"
    :src="opinion?.url_to_image"
    alt="Opinion hero image"
    class="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[557px] xl:h-[557px] w-full object-cover"
  />
  <div v-if="opinion" class="shadow-card-soft mb-4 md:mb-6 lg:mb-8">
    <OpinionReadersInsights />
  </div>
  <div class="mt-6 lg:mt-0 px-4 md:px-8 lg:px-[120px] lg:pb-10">
    <div class="gc-container">
      <div v-if="!opinion" class="flex justify-center items-center h-64">
        <p class="text-sm md:text-base">Loading opinion article...</p>
      </div>

      <div
        v-if="opinion"
        class="lg:pb-10 font-lato"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Mobile and Tablet Layout (< lg) -->
        <div class="lg:hidden">
          <!-- Main Content -->
          <div class="mb-6">
            <div class="gc-container max-w-[900px] mx-auto">
              <!-- Make content + toggle a flex row so toggle can be sticky within this scope -->
              <div class="prose prose-sm md:prose-lg relative">
                <div class="flex-1">
                  <div ref="target" class="ql-editor">
                    <Segmented
                      v-model:show-annotations="showAnnotations"
                      :content="sanitizedContent"
                      :sentences="opinion.sentences as any"
                      :post-type="'opinion'"
                    />
                  </div>
                </div>

                <div
                  v-if="targetIsVisible"
                  class="hidden md:flex flex-col items-center gap-3 fixed right-0 top-1/2 -translate-y-4 transform ml-0 rounded-xl p-4 bg-white shadow-card-soft w-36 h-fit self-start"
                >
                  <p
                    class="text-center font-lato font-semibold text-black-60 text-sm"
                  >
                    See Readers Insight
                  </p>
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      :checked="showAnnotations"
                      @change="showAnnotations = !showAnnotations"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Reading content wrapper made relative so we can position toggle beside it -->
        <div class="mx-auto gap-10 w-full flex-1 max-w-[700px]">
          <!-- Desktop layout (lg+) with sticky toggle inside content scope -->
          <div class="hidden lg:flex prose prose-lg relative">
            <div class="flex-1">
              <div ref="target2" class="ql-editor">
                <Segmented
                  v-model:show-annotations="showAnnotations"
                  :content="sanitizedContent"
                  :sentences="opinion.sentences as any"
                  :post-type="'opinion'"
                />
              </div>
            </div>
            <div
              v-if="target2IsVisible"
              class="flex flex-col items-center gap-3 fixed top-1/2 right-10 -translate-y-1/2 transform ml-6 rounded-xl p-4 bg-white shadow-card-soft w-36 h-fit self-start"
            >
              <p
                class="text-center font-lato font-semibold text-black-60 text-sm"
              >
                See Readers Insight
              </p>
              <label class="toggle-switch">
                <input
                  type="checkbox"
                  :checked="showAnnotations"
                  @change="showAnnotations = !showAnnotations"
                />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          <div class="flex flex-col items-center mb-6 md:mb-8">
            <!-- Like/Dislike Buttons -->
            <LikeDislikeButtons
              :likes="opinion.likes"
              :dislikes="opinion.dislikes"
              :user-vote="opinion.user_vote"
              @react="handleReaction"
            />
          </div>

          <CommentsSection v-if="opinion" :post="opinion" type="opinion" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { computed, onMounted, ref, shallowRef, useTemplateRef } from "vue";
import type { Post } from "@/models/Posts";
import OpinionHeading from "@/views/Opinion/sections/OpinionHeading.vue";
import DOMPurify from "dompurify";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@/quill.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { fetchOpinionById } from "@/api/posts.ts";
import CommentsSection from "@/components/CommentsSection.vue";
import Segmented from "@/components/SegmentedContent.vue";
import OpinionReadersInsights from "@/views/Opinion/sections/OpinionReadersInsights.vue";
import LikeDislikeButtons from "@/components/LikeDislikeButtons.vue";
import { opinionReaction } from "@/api/reactions";

import { useIntersectionObserver } from "@vueuse/core";

const route = useRoute();
const opinionId = route.params.opinionId as string;
const showAnnotations = ref(false);
const queryClient = useQueryClient();
const target = useTemplateRef<HTMLDivElement>("target");
const target2 = useTemplateRef<HTMLDivElement>("target2");
const targetIsVisible = shallowRef(false);
const target2IsVisible = shallowRef(false);

useIntersectionObserver(
  target,
  ([entry]) => {
    targetIsVisible.value = entry?.isIntersecting || false;
  },
  {
    threshold: [0.08],
  }
);

useIntersectionObserver(
  target2,
  ([entry]) => {
    target2IsVisible.value = entry?.isIntersecting || false;
  },
  {
    threshold: [0.11],
  }
);

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

// Fetch the opinion
const {
  value: { data: opinion },
} = computed(() =>
  useQuery<Post | null, unknown, Post | null, string[]>({
    queryKey: ["opinion", opinionId],
    queryFn: async () => {
      const response = await fetchOpinionById(opinionId);
      return response as Post | null;
    },
  })
);

// Likes Mutation
const publishMutation = useMutation({
  mutationFn: opinionReaction,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["postReaction", opinionId] });
    queryClient.invalidateQueries({ queryKey: ["opinion", opinionId] });
  },
  onError: () => {
    console.error("Failed to publish article");
  },
});

const handleReaction = (score: 1 | -1) => {
  publishMutation.mutate({
    entry_id: opinion.value!.id,
    score,
  });
};

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
</script>
