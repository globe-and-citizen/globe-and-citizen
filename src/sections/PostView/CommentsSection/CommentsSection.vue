<template>
  <div class="mb-8">
    <h3 class="text-xl font-bold mb-6 border-b pb-2">
      Comments
      <span
        v-if="post && post.comments"
        class="text-sm font-normal text-gray-500"
      >
        ({{ getTotalCommentsCount() }})
      </span>
    </h3>
    <!-- Comments List -->
    <div
      v-if="post && post.comments && post.comments.length > 0"
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
    <div v-else class="text-gray-500">
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
import { createComment, deleteComment } from "@/api/comments";
import type { Post } from "@/models/Posts";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { useAuthStore } from "@/store/authStore";
import { useModal } from "vue-final-modal";
import ConfirmDeleteModal from "@/modals/ConfirmDeleteModal.vue";
import CommentItem from "./CommentItem.vue";
import type { Comment } from "@/models/Comments";
import Button from "@/components/Button/Button.vue";

const authStore = useAuthStore();
const queryClient = useQueryClient();

// Comment form data
const commentContent = ref("");
const formErrors = ref<Record<string, string>>({});
const commentSubmitSuccess = ref(false);
const user = computed(() => authStore.user);
// Comments display control
const commentsLimit = 10;
const showAllComments = ref(false);

// Modal control
const { open, close } = useModal({
  component: ConfirmDeleteModal,
  attrs: {
    title: "Confirm Comment Deletion",
    onConfirm: () => {
      if (commentToDelete.value) {
        deleteCommentMutation.mutate(commentToDelete.value);
      }
      close();
    },
    onCancel: () => {
      close();
    },
  },
  slots: {
    default:
      "Are you sure you want to delete this comment? This action cannot be undone.",
  },
});

// Store ID of comment to delete
const commentToDelete = ref<number | null>(null);

const props = defineProps<{
  post: Post | undefined | null;
  type: "post" | "opinion";
}>();

// Check if the current user is an admin
const isAdmin = computed(() => {
  return authStore.user?.role?.name === "admin";
});

// Set up the comment mutation with TanStack Query
const commentMutation = useMutation({
  mutationFn: async (data: { postId: string; content: string }) => {
    return createComment(data.postId, data.content, props.type);
  },
  onSuccess: () => {
    // Reset the form
    commentContent.value = "";
    commentSubmitSuccess.value = true;
    // Invalidate and refetch the post data to update comments
    queryClient.invalidateQueries({
      queryKey: props.type === "post" ? ["post"] : ["opinion"],
    });

    // Hide success message after 3 seconds
    setTimeout(() => {
      commentSubmitSuccess.value = false;
    }, 3000);
  },
});

// Set up the delete comment mutation
const deleteCommentMutation = useMutation({
  mutationFn: async (commentId: number) => {
    return deleteComment(commentId);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: props.type === "post" ? ["post"] : ["opinion"],
    });
  },
});

// Helper function to count total comments including nested ones
const getTotalCommentsCount = (): number => {
  if (!props.post || !props.post.comments) return 0;

  const countComments = (comments: Comment[]): number => {
    let count = comments.length;
    comments.forEach((comment) => {
      if (comment.children && comment.children.length > 0) {
        count += countComments(comment.children);
      }
    });
    return count;
  };

  return countComments(props.post.comments);
};

// Computed property to control how many comments to display
const displayedComments = computed(() => {
  if (!props.post || !props.post.comments) return [];
  return showAllComments.value
    ? props.post.comments
    : props.post.comments.slice(0, commentsLimit);
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
const handleDeleteComment = async (commentId: number) => {
  commentToDelete.value = commentId;
  open();
};
</script>
