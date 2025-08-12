<template>
  <div class="border border-b-black-20 p-4 rounded-xl flex flex-col gap-2">
    <h3 class="font-lato text-base font-semibold">
      What our readers are saying
    </h3>
    <div v-if="props.post && props.post.total_comments >= 5 && !isLoading">
      <p class="text-base font-normal font-lato">
        {{ commentSummary?.data.summary }}
      </p>
      <p class="text-xs text-black-40 font-medium font-lato">
        This summary is AI-generated. AI can make mistakes and this summary is
        not a replacement for reading the comments.
      </p>
    </div>
    <div v-else-if="isLoading" class="text-gray-500">
      <p>Loading comments summary...</p>
    </div>
  </div>
  <div class="mb-8">
    <!-- Comments List -->
    <div
      v-if="post && post.comments && post.comments.length > 0"
      id="comments-section"
      class="space-y-2"
    >
      <div v-for="comment in displayedComments" :key="comment.id">
        <CommentItem
          :comment="comment"
          :depth="0"
          :is-admin="isAdmin"
          :post-slug="post.slug"
          :post-type="type"
          @delete-comment="handleDeleteComment"
        />
      </div>

      <div v-if="post.comments.length > commentsLimit" class="text-center">
        <button
          class="text-blue-600 hover:underline font-medium"
          @click="showAllComments = !showAllComments"
        >
          {{
            showAllComments
              ? "Show fewer comments"
              : `Show all ${post.comments.length} comments`
          }}
        </button>
      </div>
    </div>
    <div v-else class="text-gray-500 mt-4">
      <p>No comments yet. Be the first to comment!</p>
    </div>

    <!-- Add Comment Form -->
    <div class="mt-8 flex gap-1">
      <img
        v-if="user?.profile_picture_url"
        :src="user.profile_picture_url"
        alt="User Avatar"
        class="w-10 h-10 rounded-full mb-4"
      />

      <div class="mb-4 w-full">
        <textarea
          id="commentContent"
          v-model="commentContent"
          rows="4"
          placeholder="Comment"
          class="w-full px-3 py-2 border resize-none border-black-20 rounded-sm focus:outline-none focus:ring focus:ring-black-20 placeholder:font-normal placeholder:text-sm placeholder:font-lato"
          :class="{ 'border-red-500': formErrors.commentContent }"
          @keydown.enter.prevent="submitComment"
        ></textarea>
        <p v-if="formErrors.commentContent" class="mt-1 text-sm text-red-600">
          {{ formErrors.commentContent }}
        </p>
        <div class="flex justify-end w-fit ml-auto">
          <Button
            variant="primary"
            :title="
              commentMutation.isPending.value ? 'Submitting' : 'Post comment'
            "
            size="medium"
            @click="submitComment"
          />
        </div>
        <div
          v-if="commentSubmitSuccess"
          class="mt-4 p-3 bg-green-100 text-green-700 rounded-md"
        >
          Your comment has been submitted successfully!
        </div>
      </div>

      <div
        v-if="commentMutation.isError.value"
        class="mt-4 p-3 bg-red-100 text-red-700 rounded-md"
      >
        {{
          commentMutation.error.value?.message ||
          "Error submitting comment. Please try again."
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { analyzeComments, createComment, deleteComment } from "@/api/comments";
import type { Post } from "@/models/Posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed, ref, watchEffect } from "vue";
import { useAuthStore } from "@/store/authStore";
import { useModal } from "vue-final-modal";
import ConfirmDeleteModal from "@/modals/ConfirmDeleteModal.vue";
import CommentItem from "./CommentItem.vue";
import Button from "@/components/Button/Button.vue";
import type { Comments } from "@/models/Comments";

const authStore = useAuthStore();
const queryClient = useQueryClient();

const commentContent = ref("");
const formErrors = ref<Record<string, string>>({});
const commentSubmitSuccess = ref(false);
const user = computed(() => authStore.user);
const commentsLimit = 10;
const showAllComments = ref(false);

const { open, close } = useModal({
  component: ConfirmDeleteModal,
  attrs: {
    title: "Confirm Comment Deletion",
    onConfirm: () => {
      if (commentToDelete.value.commentId) {
        deleteCommentMutation.mutate({
          commentId: commentToDelete.value.commentId,
        });
      }
      close();
    },
    onCancel: () => {
      console.log({
        commentId: commentToDelete.value.commentId,
        parentId: commentToDelete.value.parentCommentId,
      });
      close();
    },
  },
  slots: {
    default:
      "Are you sure you want to delete this comment? This action cannot be undone.",
  },
});

const commentToDelete = ref<{
  commentId: number | undefined;
  parentCommentId: number | undefined;
}>({ commentId: 0, parentCommentId: undefined });

const props = defineProps<{
  post: Post | undefined | null;
  type: "post" | "opinion";
}>();

const isAdmin = computed(() => {
  return authStore.user?.role?.name === "admin";
});

const commentMutation = useMutation({
  mutationFn: async (data: { postId: string; content: string }) => {
    return createComment(data.postId, data.content, props.type);
  },
  onSuccess: () => {
    commentContent.value = "";
    commentSubmitSuccess.value = true;
    queryClient.invalidateQueries({
      queryKey: props.type === "post" ? ["post"] : ["opinion"],
    });

    setTimeout(() => {
      commentSubmitSuccess.value = false;
    }, 3000);
  },
});

const deleteCommentMutation = useMutation({
  mutationFn: async ({ commentId }: { commentId: number }) => {
    return deleteComment(commentId);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: props.type === "post" ? ["post"] : ["opinion"],
    });

    queryClient.invalidateQueries({
      queryKey: ["child-comments"],
    });
  },
});

const displayedComments = computed(() => {
  if (!props.post || !props.post.comments) return [];
  return showAllComments.value
    ? props.post.comments
    : props.post.comments.slice(0, commentsLimit);
});
const comments: string[] = [];

watchEffect(() => {
  comments.length = 0;

  function collectComments(commentList: Comments) {
    for (const comment of commentList) {
      comments.push(comment.content);
      if (comment.children && comment.children.length > 0) {
        collectComments(comment.children);
      }
    }
  }

  if (props.post?.comments?.length) {
    collectComments(props.post.comments);
  }
});

// TODO: PROPER CACHING TO STORE RESPONSE IN LOCAL STORAGE
const { data: commentSummary, isLoading } = useQuery<{
  data: { summary: string };
}>({
  queryKey: ["commentsSummary"],
  queryFn: () => analyzeComments(props.post?.slug, comments),
  enabled: !!props.post && props.post.total_comments >= 5,
  gcTime: 1000 * 60 * 60 * 24, // 24 hours
});

// Submit a new comment
const submitComment = async () => {
  formErrors.value = {};

  let isValid = true;

  if (!commentContent.value.trim()) {
    formErrors.value.commentContent = "Comment is required";
    isValid = false;
  }

  if (!isValid || !props.post) return;

  // Use the mutation to create the comment
  commentMutation.mutate({
    postId: props.post.slug,
    content: commentContent.value,
  });
};

// Delete a comment
const handleDeleteComment = async (
  commentId: number,
  parentCommentId: number
) => {
  commentToDelete.value = { commentId, parentCommentId };
  open();
};
</script>
