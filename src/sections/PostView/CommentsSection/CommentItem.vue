<template>
  <div
    :class="[
      'relative',
      depth > 0 ? 'ml-8 mt-0' : 'mt-4',
      depth === 0 ? ' pb-4' : '',
    ]"
  >
    <template v-if="depth > 0">
      <div
        :class="[
          'absolute -left-8 w-px bg-gray-300',
          depth === 1 && !isLastChild ? '-top-3' : '-top-3',
          isLastChild ? 'h-9 ' : 'h-[calc(100%+36px)]',
        ]"
      ></div>
      <div
        :class="[
          'absolute -left-8 top-6 w-6 h-px bg-gray-300',
          comment.children && comment.children?.length > 0 ? '-top-6' : 'top-0',
        ]"
      ></div>

      <div class="absolute -left-8 top-6 w-px h-px bg-gray-300"></div>
    </template>

    <div
      class="bg-white hover:bg-gray-50 transition-colors duration-200 rounded-lg p-4"
    >
      <!-- Comment Header -->
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full overflow-hidden">
            <img
              v-if="comment.user.profile_picture_url"
              :src="comment.user.profile_picture_url"
              :alt="comment.user.profile_picture_url"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full bg-gray-200 text-gray-600 text-sm font-medium flex items-center justify-center"
              :style="generateUserIcon(comment.user.username)"
            >
              <span class="text-black text-lg font-semibold">
                {{ comment.user.username.charAt(0).toUpperCase() || "A" }}
              </span>
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900">{{
                comment.user.username.length
                  ? comment.user.username
                  : "Anonymous"
              }}</span>
              <span class="text-gray-500 text-sm">{{
                formatCommentDate(comment.created_at)
              }}</span>
            </div>
          </div>
        </div>
        <button
          v-if="isAdmin"
          class="h-8 w-8 p-0 flex items-center justify-center text-gray-400 hover:text-gray-600"
          @click="$emit('delete-comment', comment.id)"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Comment Content -->
      <div class="mb-4">
        <p class="text-gray-900 leading-relaxed">{{ comment.content }}</p>
      </div>

      <!-- Comment Actions -->
      <div class="flex items-center gap-1">
        <button
          class="h-8 px-2 text-sm flex items-center"
          :class="
            comment.isLiked
              ? 'text-blue-600'
              : 'text-gray-400 hover:text-blue-600'
          "
          @click="handleLike(comment.id)"
        >
          👍 {{ comment.likes || 0 }}
        </button>

        <button
          class="h-8 px-2 text-sm flex items-center"
          :class="
            comment.isDisliked
              ? 'text-red-600'
              : 'text-gray-400 hover:text-red-600'
          "
          @click="handleDislike(comment.id)"
        >
          👎 0
        </button>

        <button
          v-if="depth < maxDepth"
          class="h-8 px-2 text-sm flex items-center text-gray-400 hover:text-blue-600"
          @click="showReplyInput = !showReplyInput"
        >
          <svg
            class="h-4 w-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          Reply
        </button>
      </div>

      <!-- Reply Input -->
      <div v-if="showReplyInput" class="mt-4 p-3 bg-gray-50 rounded-lg border">
        <div class="mb-3">
          <span class="text-sm text-gray-500"
            >Reply to {{ comment.user.username }}</span
          >
        </div>
        <textarea
          v-model="replyContent"
          placeholder="Write your reply..."
          class="w-full min-h-[80px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{ 'border-red-500': replyFormErrors.replyContent }"
        ></textarea>
        <p
          v-if="replyFormErrors.replyContent"
          class="mt-1 text-sm text-red-600"
        >
          {{ replyFormErrors.replyContent }}
        </p>
        <div class="flex gap-2 mt-3">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            :disabled="replyMutation.isPending.value || !replyContent.trim()"
            @click="handleReply"
          >
            <span v-if="replyMutation.isPending.value">Submitting...</span>
            <span v-else>Reply</span>
          </button>
          <button
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            @click="cancelReply"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Replies Section -->
    <div v-if="hasReplies" class="mt-3">
      <div v-if="!showReplies">
        <button
          class="text-blue-600 hover:text-blue-800 h-8 px-0 font-medium"
          @click="showReplies = true"
        >
          View {{ comment.children?.length }}
          {{ comment.children?.length === 1 ? "reply" : "replies" }}
        </button>
      </div>
      <div v-else>
        <CommentItem
          v-for="(reply, index) in comment.children"
          :key="reply.id"
          :comment="reply"
          :depth="depth + 1"
          :post-slug="postSlug"
          :post-type="postType"
          :is-admin="isAdmin"
          :is-last-child="index === (comment.children?.length || 0) - 1"
          @delete-comment="$emit('delete-comment', $event)"
        />
        <button
          v-if="comment.children && comment.children?.length > 1"
          class="text-gray-500 hover:text-gray-700 h-8 px-0 mt-2 ml-8"
          @click="showReplies = false"
        >
          Hide replies
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { createComment } from "@/api/comments";
import { formatCommentDate, generateUserIcon } from "@/lib/utils";
import type { Comment } from "../../../models/Comments";

const props = defineProps<{
  comment: Comment;
  depth: number;
  postSlug: string;
  postType: "post" | "opinion";
  isAdmin: boolean;
  isLastChild?: boolean;
}>();

defineEmits<{
  (e: "delete-comment", commentId: number): void;
}>();

const queryClient = useQueryClient();
const replyContent = ref("");
const replyFormErrors = ref<Record<string, string>>({});
const showReplyInput = ref(false);
const showReplies = ref(false);

const hasReplies = computed(() => !!props.comment.children?.length);
const maxDepth = 3;

const getInitials = (name: string) => {
  console.log(name);
  return name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
};

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
    showReplyInput.value = false;
    queryClient.invalidateQueries({
      queryKey: props.postType === "post" ? ["post"] : ["opinion"],
    });
  },
});

const handleLike = async (commentId: number) => {
  console.log("Like comment", commentId);
};

const handleDislike = async (commentId: number) => {
  console.log("Dislike comment", commentId);
};

const handleReply = async () => {
  replyFormErrors.value = {};

  if (!replyContent.value.trim()) {
    replyFormErrors.value.replyContent = "Reply cannot be empty";
    return;
  }

  replyMutation.mutate({
    postId: props.postSlug,
    content: replyContent.value,
    parentId: props.comment.id,
  });
};

const cancelReply = () => {
  showReplyInput.value = false;
  replyContent.value = "";
  replyFormErrors.value = {};
};
</script>
