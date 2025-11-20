<template>
  <OpinionHeading v-if="opinion" :post="opinion" />
  <img
    v-if="opinion?.url_to_image"
    :src="opinion?.url_to_image"
    alt="Opinion hero image"
    class="h-[200px] sm:h-[250px] md:h-[300px] lg:h-[557px] xl:h-[557px] w-full object-cover"
  />
  <!-- <div
    v-if="opinion"
    ref="insightsWrapper"
    class="reader-insights-sticky shadow-card-soft mb-4 md:mb-6 lg:mb-8 sticky top-0 z-10 bg-white-100"
  ></div> -->
  <div class="mt-6 lg:mt-0 px-4 md:px-8 lg:px-[120px] lg:pb-10">
    <div class="gc-container">
      <div v-if="!opinion" class="flex justify-center items-center h-64">
        <p class="text-sm md:text-base">Loading opinion article...</p>
      </div>

      <OpinionReadersInsights />
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
            <div class="gc-container max-w-[850px] mx-auto">
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
                  class="hidden flex-col items-center gap-3 fixed right-0 top-1/2 -translate-y-4 transform ml-0 rounded-xl p-4 bg-white shadow-card-soft w-36 h-fit self-start"
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
              class="hidden flex flex-col items-center gap-3 fixed top-1/2 right-10 -translate-y-1/2 transform ml-6 rounded-xl p-4 bg-white shadow-card-soft w-36 h-fit self-start"
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
              :pending="reactionPending"
              @react="handleReaction"
            />

            <div v-if="opinionUserId === currentUserId" class="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
                @click="() => handleOpinionEdit(opinion ?? emptyOpinion as Post)"
              >
                <span class="sr-only">Edit</span>
                <component :is="PencilIcon" class="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0 text-destructive hover:text-destructive"
                @click="() => handleOpinionDelete(opinion ?? emptyOpinion as Post)"
              >
                <span class="sr-only">Delete</span>
                <component :is="TrashBinIcon" class="size-4" />
              </Button>
            </div>
          </div>

          <CommentsSection v-if="opinion" :post="opinion" type="opinion" />
        </div>
      </div>
    </div>
  </div>

  <!-- Opinion Edit Dialog -->
  <OpinionEditDialog
    :is-open="opinionEditDialogOpen"
    :opinion="selectedOpinion"
    @close="opinionEditDialogOpen = false"
    @save="handleSaveOpinionEdit"
  />

  <!-- Opinion Delete Dialog -->
  <DeleteDialog
    :is-open="opinionDeleteDialogOpen"
    item-type="Opinion"
    @close="opinionDeleteDialogOpen = false"
    @confirm="handleConfirmOpinionDelete"
  />
</template>

<script setup lang="ts">
import { useRoute, onBeforeRouteUpdate, useRouter } from "vue-router";
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
import PencilIcon from "@/assets/icons/pencil-icon.svg";
import { Button } from "@/components/ui/button";
import TrashBinIcon from "@/assets/icons/trash-bin-icon.svg";
import OpinionEditDialog from "@/components/AdminPanel/NewsTable/OpinionEditDialog.vue";
import DeleteDialog from "@/components/AdminPanel/NewsTable/DeleteDialog.vue";

import { useIntersectionObserver } from "@vueuse/core";
import { useAuthStore } from "@/store/authStore";
import { deleteOpinion, patchOpinion } from "@/api/opinions";
import { toast } from "vue3-toastify";
import type { OpinionPatchPayload } from "@/models/Opinions";

const route = useRoute();
const opinionId = route.params.opinionId as string;
const showAnnotations = ref(false);
const queryClient = useQueryClient();
const target = useTemplateRef<HTMLDivElement>("target");
const target2 = useTemplateRef<HTMLDivElement>("target2");
const targetIsVisible = shallowRef(false);
const target2IsVisible = shallowRef(false);
const authStore = useAuthStore();
const opinionEditDialogOpen = ref(false);
const opinionDeleteDialogOpen = ref(false);
const selectedOpinion = ref<Post | null>(null);
const router = useRouter();
const currentUserId = computed(() => authStore.user?.id || null);
const emptyOpinion = {
  title: "",
  content: "",
  description: "",
  url_to_image: "",
};
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
  value: { data: opinion },
} = computed(() =>
  useQuery<Post>({
    queryKey: ["opinion", opinionId],
    queryFn: async () => {
      const response = await fetchOpinionById(opinionId);
      return response as Post;
    },
  })
);
const opinionUserId = computed(() => opinion.value?.user_id || null);

const publishMutation = useMutation({
  mutationFn: opinionReaction,
  onMutate: async (variables: { entry_id: number; score: 1 | -1 }) => {
    await queryClient.cancelQueries({ queryKey: ["opinion", opinionId] });

    const prevData = queryClient.getQueryData<Post | null>([
      "opinion",
      opinionId,
    ]);

    if (prevData) {
      const prevLikeCount = prevData.likes || 0;
      const prevDislikeCount = prevData.dislikes || 0;
      const prevUserVote = prevData.user_vote || 0;
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

      queryClient.setQueryData<Post | null>(["opinion", opinionId], {
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
      queryClient.setQueryData(["opinion", opinionId], context.prevData);
    }
    console.error("Failed to publish opinion reaction", err);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["opinion", opinionId] });
  },
});

const { mutate: deleteOpinionMutation } = useMutation({
  mutationFn: async (opinionId: string) => {
    await deleteOpinion(opinionId);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["allPosts"],
    });
    router.go(-1);
    setTimeout(() => {
      toast.success("Opinion deleted successfully.");
    }, 300);
  },
  onError: (error) => {
    console.error("Failed to delete opinion:", error);
    setTimeout(() => {
      toast.error("Failed to delete opinion.");
    }, 300);
  },
});

const reactionPending = computed(
  () => publishMutation.status.value === "pending"
);

const handleReaction = (score: 1 | -1) => {
  if (!opinion.value) return;
  publishMutation.mutate({ entry_id: opinion.value.id, score });
};

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

function handleOpinionEdit(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionEditDialogOpen.value = true;
}

function handleOpinionDelete(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionDeleteDialogOpen.value = true;
}

function handleConfirmOpinionDelete() {
  if (selectedOpinion.value) {
    deleteOpinionMutation(selectedOpinion.value.slug);
  }
  opinionDeleteDialogOpen.value = false;
}

const { mutate: updateOpinion } = useMutation({
  mutationFn: async (payload: OpinionPatchPayload) => {
    await patchOpinion(payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["opinion", opinionId],
    });

    queryClient.invalidateQueries({
      queryKey: ["allPosts"],
    });
    setTimeout(() => {
      toast("Opinion updated", {
        autoClose: 3000,
        type: "success",
      });
    }, 300);
  },
  onError: (error) => {
    console.error("Failed to update opinion:", error);
    setTimeout(() => {
      toast("Failed to update opinion", {
        autoClose: 3000,
        type: "error",
      });
    }, 300);
  },
});

function handleSaveOpinionEdit(formData: Partial<Post>) {
  updateOpinion({
    opinionId: selectedOpinion.value?.slug || "",
    opinion: {
      title: formData.title || "",
      url_to_image: formData.url_to_image || "",
      content: formData.content || "",
    },
  });
  opinionEditDialogOpen.value = false;
}
// The sanitized content to display
const sanitizedContent = computed(() => {
  if (!opinion.value || !opinion.value.content) return "";
  return DOMPurify.sanitize(opinion.value.content);
});
</script>
