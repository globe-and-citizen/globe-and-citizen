<template>
  <RouterLink
    :to="
      data.post_slug
        ? `/post/${data?.post_slug}/${data.slug}`
        : `/post/${data.slug}`
    "
  >
    <div
      class="relative group flex border border-transparent hover:border-black-20 rounded-md hover:shadow-card-hard"
    >
      <img
        v-if="data?.url_to_image"
        :src="data?.url_to_image"
        alt="Article Image"
        class="h-[160px] max-w-[124px] object-cover rounded-md"
      />

      <button
        v-if="showDeleteButton !== false"
        class="absolute bottom-2 right-2 bg-primary-red text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        @click="(e:MouseEvent) => {
          openDeleteModal();
          e.preventDefault();
        }"
      >
        Delete
      </button>
      <RouterLink
        :to="data.post_slug ? `/post/${data?.post_slug}` : `/post/${data.slug}`"
        class="absolute bottom-2 bg-secondary-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        :class="{
          ' right-18': props.showDeleteButton,
          'right-4': !props.showDeleteButton,
        }"
      >
        Go to news
      </RouterLink>
      <div class="p-2 font-libre w-full">
        <h3
          class="font-semibold font-lato text-base leading-[1] underline underline-offset-4 decoration-primary-red mb-1.5"
        >
          Category
        </h3>
        <div
          class="mb-2 text-black-80 text-xs font-normal flex justify-between"
        >
          <p>@{{ userName }}</p>
          <p>{{ dayjs(data.created_at).format("MMMM D, YYYY") }}</p>
        </div>
        <h3 class="font-medium text-base leading-[1]">
          {{
            data.title && data?.title?.length > 30
              ? data?.title?.substring(0, 30) + "..."
              : data?.title || "No title available"
          }}
        </h3>
        <div
          class="text-black-80 mb-3 font-lato font-normal text-xs flex-none"
          v-html="
            data?.content?.substring(0, 200) + '...' || 'No content available'
          "
        />
      </div>
    </div>
  </RouterLink>

  <ConfirmDeleteModal
    v-model="isDeleteModalOpen"
    :title="'Confirm Deletion'"
    @confirm="() => confirmDelete(data?.slug ?? '')"
    @cancel="closeDeleteModal"
  >
    Are you sure you want to delete
    <b>"{{ data?.title || "this article" }}"</b>?
  </ConfirmDeleteModal>
</template>

<script setup lang="ts">
import { deleteOpinion } from "@/api/opinions.ts";
import { useAuthStore } from "@/store/authStore.ts";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, defineProps, ref } from "vue";
import dayjs from "dayjs";
import { RouterLink } from "vue-router";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal.vue";
import type { Post } from "@/models/Posts";

interface PostType {
  data: Partial<Post>;
  showDeleteButton: boolean;
}
const props = defineProps<PostType>();

const queryClient = useQueryClient();
const authStore = useAuthStore();
const userName = computed(() => authStore.user?.username || "");
const isDeleteModalOpen = ref(false);
const openDeleteModal = () => {
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false;
};

const { mutate: deleteOpinionMutation } = useMutation({
  mutationFn: async (opinionId: string) => {
    await deleteOpinion(opinionId);
  },
  onSuccess: () => {
    // Also invalidate all posts to ensure consistent data
    queryClient.invalidateQueries({
      queryKey: ["allPosts"],
    });
    queryClient.invalidateQueries({
      queryKey: ["users-articles"],
    });
    queryClient.invalidateQueries({
      queryKey: ["users-news-articles"],
    });
  },
  onError: (error) => {
    console.error("Failed to delete opinion:", error);
  },
});

const confirmDelete = (slug: string) => {
  deleteOpinionMutation(slug);
  closeDeleteModal();
};
</script>
