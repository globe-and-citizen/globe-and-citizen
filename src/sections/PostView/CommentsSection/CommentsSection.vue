<template>
  <div class="mb-8">
    <h3 class="text-xl font-bold mb-6 border-b pb-2">
      Comments
      <span
        v-if="post && post.comments"
        class="text-sm font-normal text-gray-500"
      >
        ({{ post.comments.length }})
      </span>
    </h3>

    <!-- Add Comment Form -->
    <div class="mb-8 bg-gray-50 rounded-lg p-6 border">
      <h4 class="font-semibold text-gray-900 mb-4">Add a Comment</h4>

      <div class="mb-4">
        <label
          for="commentContent"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Your Comment</label
        >
        <textarea
          id="commentContent"
          v-model="commentContent"
          rows="4"
          placeholder="Write your comment here..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': formErrors.commentContent }"
        ></textarea>
        <p v-if="formErrors.commentContent" class="mt-1 text-sm text-red-600">
          {{ formErrors.commentContent }}
        </p>
      </div>

      <div class="flex justify-end">
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          :disabled="commentMutation.isPending.value"
          @click="submitComment"
        >
          <span v-if="commentMutation.isPending.value">Submitting...</span>
          <span v-else>Submit Comment</span>
        </button>
      </div>

      <div
        v-if="commentSubmitSuccess"
        class="mt-4 p-3 bg-green-100 text-green-700 rounded-md"
      >
        Your comment has been submitted successfully!
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

    <!-- Comments List -->
    <div
      v-if="post && post.comments && post.comments.length > 0"
      class="space-y-6"
    >
      <div
        v-for="comment in displayedComments"
        :key="comment.id"
        class="bg-gray-50 rounded-lg p-4 border"
      >
        <div class="flex items-start space-x-3">
          <img
            :src="
              comment.user.profile_picture_url ||
              '/src/assets/user-placeholder.png'
            "
            :alt="comment.user.username"
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <h4 class="font-semibold text-gray-900">
                {{
                  comment.user.username.length
                    ? comment.user.username
                    : "Anonymous "
                }}
              </h4>
              <span class="text-sm text-gray-500">{{
                formatCommentDate(comment.created_at)
              }}</span>
            </div>
            <p class="text-gray-700 leading-relaxed">
              {{ comment.content }}
            </p>
          </div>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { createComment } from "@/api/comments";
import type { Post } from "@/models/Posts";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { formatCommentDate } from "@/lib/utils";

const queryClient = useQueryClient();

// Comment form data
const commentContent = ref("");
const formErrors = ref<Record<string, string>>({});
const commentSubmitSuccess = ref(false);

// Comments display control
const commentsLimit = 10;
const showAllComments = ref(false);

const props = defineProps<{ post: Post | undefined | null }>();

// Set up the comment mutation with TanStack Query
const commentMutation = useMutation({
  mutationFn: async (data: { postId: number; content: string }) => {
    return createComment(data.postId, data.content);
  },
  onSuccess: () => {
    // Reset the form
    commentContent.value = "";
    commentSubmitSuccess.value = true;
    // Invalidate and refetch the post data to update comments
    queryClient.invalidateQueries({ queryKey: ["post"] });

    // Hide success message after 3 seconds
    setTimeout(() => {
      commentSubmitSuccess.value = false;
    }, 3000);
  },
});

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
    postId: props.post.id,
    content: commentContent.value,
  });
};
</script>
