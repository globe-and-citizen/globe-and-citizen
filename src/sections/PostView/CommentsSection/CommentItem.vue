<template>
  <div
    class="bg-gray-50 rounded-lg p-4 border"
    :style="{ marginLeft: `${depth * 20}px` }"
    :class="{
      'bg-gray-100': depth > 0,
      'border-l-4 border-l-blue-300': depth > 0,
    }"
  >
    <div class="flex items-start space-x-3">
      <img
        v-if="comment.user.profile_picture_url"
        :src="
          comment.user.profile_picture_url ||
          generateUserIcon(comment.user.username)
        "
        :alt="comment.user.username"
        class="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div
        v-else
        class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        :style="generateUserIcon(comment.user.username)"
      >
        <span class="text-black text-lg font-semibold">
          {{ comment.user.username.charAt(0).toUpperCase() || "A" }}
        </span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center space-x-2 mb-2 flex-wrap">
          <h4 class="font-semibold text-gray-900">
            {{
              comment.user.username.length ? comment.user.username : "Anonymous"
            }}
          </h4>
          <span class="text-sm text-gray-500">{{
            formatCommentDate(comment.created_at)
          }}</span>
          <div class="flex space-x-2 ml-auto">
            <button
              v-if="depth < 4"
              class="text-blue-600 hover:underline text-sm"
              @click="toggleReplyForm"
            >
              Reply
            </button>
            <button
              v-if="isAdmin || userId === comment.user.id"
              class="text-red-600 hover:underline text-sm"
              @click="$emit('delete-comment', comment.id)"
            >
              Delete
            </button>
          </div>
        </div>
        <p class="text-gray-700 leading-relaxed mb-3">
          {{ comment.content }}
        </p>

        <!-- Reply Form -->
        <div
          v-if="showReplyForm"
          class="mt-4 p-4 bg-white rounded-lg border border-gray-200"
        >
          <h5 class="font-medium text-gray-900 mb-3">
            Reply to {{ comment.user.username || "Anonymous" }}
          </h5>
          <textarea
            v-model="replyContent"
            rows="3"
            placeholder="Write your reply here..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            :class="{ 'border-red-500': replyError }"
          ></textarea>
          <p v-if="replyError" class="text-sm text-red-600 mb-3">
            {{ replyError }}
          </p>
          <div class="flex justify-end space-x-2">
            <button
              class="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
              @click="cancelReply"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
              :disabled="replyMutation.isPending.value"
              @click="submitReply"
            >
              <span v-if="replyMutation.isPending.value">Submitting...</span>
              <span v-else>Submit Reply</span>
            </button>
          </div>

          <div
            v-if="replySuccess"
            class="mt-3 p-2 bg-green-100 text-green-700 rounded-md text-sm"
          >
            Your reply has been submitted successfully!
          </div>

          <div
            v-if="replyMutation.isError.value"
            class="mt-3 p-2 bg-red-100 text-red-700 rounded-md text-sm"
          >
            {{
              replyMutation.error.value?.message ||
              "Error submitting reply. Please try again."
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Nested Replies -->
    <div
      v-if="comment.children && comment.children.length > 0"
      class="mt-4 space-y-4"
    >
      <CommentItem
        v-for="child in comment.children"
        :key="child.id"
        :comment="child"
        :depth="depth + 1"
        :is-admin="isAdmin"
        :post-slug="postSlug"
        :post-type="postType"
        @delete-comment="$emit('delete-comment', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { createComment } from "@/api/comments";
import { formatCommentDate, generateUserIcon } from "@/lib/utils";
import type { Comment } from "@/models/Comments";
import { useAuthStore } from "@/store/authStore.ts";

// Define component props
const props = defineProps<{
  comment: Comment;
  depth: number;
  isAdmin: boolean;
  postSlug: string;
  postType: "post" | "opinion";
}>();

// Define emits
defineEmits<{
  "delete-comment": [commentId: number];
}>();

const queryClient = useQueryClient();
const authStore = useAuthStore();
const userId = authStore.user?.id;
console.log(props.isAdmin);
// Reply form state
const showReplyForm = ref(false);
const replyContent = ref("");
const replyError = ref("");
const replySuccess = ref(false);

// Reply mutation
const replyMutation = useMutation({
  mutationFn: async (data: {
    postId: string;
    content: string;
    parentId: number;
  }) => {
    return createComment(
      data.postId,
      data.content,
      props.postType,
      data.parentId
    );
  },
  onSuccess: () => {
    replyContent.value = "";
    replySuccess.value = true;
    showReplyForm.value = false;

    queryClient.invalidateQueries({
      queryKey: props.postType === "post" ? ["post"] : ["opinion"],
    });

    setTimeout(() => {
      replySuccess.value = false;
    }, 3000);
  },
  onError: () => {},
});

// Toggle reply form
const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value;
  if (!showReplyForm.value) {
    replyContent.value = "";
    replyError.value = "";
  }
};

// Cancel reply
const cancelReply = () => {
  showReplyForm.value = false;
  replyContent.value = "";
  replyError.value = "";
};

// Submit reply
const submitReply = async () => {
  replyError.value = "";

  if (!replyContent.value.trim()) {
    replyError.value = "Reply is required";
    return;
  }

  replyMutation.mutate({
    postId: props.postSlug,
    content: replyContent.value,
    parentId: props.comment.id,
  });
};
</script>
