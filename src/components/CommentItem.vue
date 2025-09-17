<template>
  <div
    :class="[
      '',
      depth > 0 ? 'ml-8 mt-2 relative' : 'mt-2',
      depth === 0 ? ' pb-0' : '',
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

    <div class="bg-white rounded-lg p-4">
      <!-- Comment Header -->
      <div class="flex items-start justify-between mb-3">
        <RouterLink
          :to="`/profile/${comment.user.username}`"
          class="flex items-center gap-3"
        >
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
        </RouterLink>
        <button
          v-if="isAdmin || userId === comment.user.id"
          class="h-8 w-8 p-0 flex items-center justify-center text-gray-400 hover:text-gray-600"
          @click="
            $emit(
              'delete-comment',
              comment.id,
              props.comment.parent_id ?? props.comment.id
            )
          "
        >
          <svg class="h-4 w-4" stroke="currentColor" viewBox="0 0 24 24">
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
        <!-- <button
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
          👎 {{ comment.dislikes || 0 }}
        </button> -->

        <button
          v-if="depth < maxDepth"
          class="h-8 px-2 text-sm flex items-center text-black-100 hover:text-blue-600 disabled:opacity-50"
          :disabled="!isLoggedIn"
          @click="toggleReplyInput"
        >
          <span>{{ isLoggedIn ? "Reply" : "Sign-in to reply" }}</span>
        </button>
      </div>

      <!-- Reply Input -->
      <div v-if="showReplyInput" class="mt-4 flex gap-1 relative">
        <div class="mb-3 flex-none">
          <img
            v-if="authStore.user?.profile_picture_url"
            :src="authStore.user.profile_picture_url"
            alt="User Avatar"
            class="w-10 h-10 rounded-full mb-2 object-cover"
          />
        </div>
        <textarea
          v-model="replyContent"
          :placeholder="'Reply to @' + comment.user.username"
          class="w-full min-h-[80px] resize-none px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-black-20 placeholder:font-normal placeholder:text-sm placeholder:font-lato"
          :class="{ 'border-red-500': replyFormErrors.replyContent }"
          @keydown.enter.prevent="handleReply"
        ></textarea>
        <p
          v-if="replyFormErrors.replyContent"
          class="mt-1 text-sm text-red-600"
        >
          {{ replyFormErrors.replyContent }}
        </p>
        <div
          class="absolute right-3 bottom-4 hover:[&>svg>g>path]:fill-blue-600 cursor-pointer"
          @click="handleReply"
        >
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_1437_50685)">
              <path
                d="M3.25236 10.195L11.4196 9.93948L4.18151 12.2113L3.25236 10.195ZM13.7349 14.9284L8.28936 21.0206L7.35115 19.0086L13.7349 14.9284ZM0.15921 8.29416L3.10847 14.6425L17.5483 10.1159L4.79895 18.2678L7.76634 24.6077L22.9862 7.58017L0.15921 8.29416Z"
                fill="currentColor"
                fill-opacity="0.6"
              />
            </g>
            <defs>
              <clipPath id="clip0_1437_50685">
                <rect
                  width="24"
                  height="24"
                  fill="white"
                  transform="translate(0.969971 0.0176697)"
                />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>

      <!-- Nested Replies Section -->
      <div v-if="hasReplies" class="mt-4">
        <div v-if="!showReplies">
          <button
            class="text-blue-600 hover:underline text-sm"
            @click="showReplies = true"
          >
            View replies
          </button>
        </div>
        <div v-else>
          <!-- Render child comments recursively -->
          <div class="space-y-2">
            <CommentItem
              v-for="(reply, index) in getRepliesArray"
              :key="reply.id"
              :comment="reply"
              :depth="depth + 1"
              :post-slug="postSlug"
              :post-type="postType"
              :is-admin="isAdmin"
              :is-last-child="index === getRepliesArray.length - 1"
              @delete-comment="
                (id: number, parentId: number ) => $emit('delete-comment', id, parentId)
              "
            />
          </div>
          <button
            v-if="depth === 0"
            class="text-gray-500 hover:text-gray-700 text-sm mt-2"
            @click="showReplies = false"
          >
            Hide replies
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { createComment, getCommentChildren } from "@/api/comments.ts";
import { formatCommentDate, generateUserIcon } from "@/composables/utils.ts";
import { useAuthStore } from "@/store/authStore.ts";
import type { Comment } from "@/models/Comments";
import { RouterLink } from "vue-router";

const props = defineProps<{
  comment: Comment;
  depth: number;
  postSlug: string;
  postType: "post" | "opinion";
  isAdmin: boolean;
  isLastChild?: boolean;
}>();

defineEmits<{
  (e: "delete-comment", commentId: number, parentId: number): void;
}>();

const queryClient = useQueryClient();
const replyContent = ref("");
const replyFormErrors = ref<Record<string, string>>({});
const showReplyInput = ref(false);
const showReplies = ref(false);
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isUserAuthenticated);
const userId = authStore.user?.id;

const getRepliesArray = computed(() => {
  if (
    childCommentsQuery.data.value?.children &&
    childCommentsQuery.data.value.children.length > 0
  ) {
    return childCommentsQuery.data.value.children;
  }
  return props.comment.children || [];
});

const hasReplies = computed(() => {
  if (props.comment.has_children) return true;
  if (props.comment.children && props.comment.children.length > 0) return true;
  if (
    childCommentsQuery.data.value?.children &&
    childCommentsQuery.data.value.children.length > 0
  )
    return true;

  return false;
});
const maxDepth = 3;

const childCommentsQuery = useQuery<Comment>({
  queryKey: ["child-comments", props.comment.id],
  queryFn: () => getCommentChildren(props.comment.id),
  enabled: computed(() => showReplies.value && hasReplies.value),
  refetchOnWindowFocus: false,
});

watch(showReplies, (newVal) => {
  if (newVal && hasReplies.value && !childCommentsQuery.data.value) {
    childCommentsQuery.refetch();
  }
});

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
    childCommentsQuery.refetch();

    queryClient.invalidateQueries({
      queryKey: ["child-comments", props.comment.id],
    });
    showReplies.value = true;
  },
});

// const handleLike = async (commentId: number) => {
//   console.log("Like comment", commentId);
// };

// const handleDislike = async (commentId: number) => {
//   console.log("Dislike comment", commentId);
// };

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

const toggleReplyInput = () => {
  showReplyInput.value = !showReplyInput.value;
};
</script>
