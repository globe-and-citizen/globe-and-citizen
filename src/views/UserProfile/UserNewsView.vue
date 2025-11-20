<template>
  <div class="font-lato">
    <div
      v-if="data?.data?.length"
      class="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full"
    >
      <MyViewpointsCard
        v-for="article in data.data"
        :key="article?.id"
        :data="article"
        :show-delete-button="true"
        :edit="handlePostEdit"
        :delete="handlePostDelete"
      />
    </div>
    <div v-else class="text-center py-10 text-gray-500">
      {{ isLoading ? "Loading..." : "No articles found" }}
    </div>
  </div>

  <DeleteDialog
    :is-open="postDeleteDialogOpen"
    item-type="Post"
    @close="postDeleteDialogOpen = false"
    @confirm="handleConfirmPostDelete"
  />
  <EditDialog
    :is-open="postEditDialogOpen"
    :post="selectedPost"
    @close="postEditDialogOpen = false"
    @save="handlePostEditAction"
  />
</template>
<script setup lang="ts">
import type { FetchPostsType, NewPostType, Post } from "@/models/Posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import MyViewpointsCard from "../../components/MyViewpointsCard.vue";
import DeleteDialog from "@/components/AdminPanel/NewsTable/DeleteDialog.vue";
import EditDialog from "@/components/AdminPanel/NewsTable/EditDialog.vue";
import {
  deleteNewsArticle,
  getUsersNewsPosts,
  patchNewsArticle,
} from "@/api/posts";
import { toast } from "vue3-toastify";

const queryClient = useQueryClient();
const currentPage = ref(0);
const pageSize = ref(10);
const postEditDialogOpen = ref(false);
const postDeleteDialogOpen = ref(false);
const selectedPost = ref<Post | null>(null);

const { data, isLoading } = useQuery<FetchPostsType>({
  queryKey: ["users-news-articles", currentPage, pageSize],
  queryFn: () => getUsersNewsPosts(pageSize.value, currentPage.value),
  refetchOnWindowFocus: true,
});

// UPDATE POST
const { mutate: updatePost } = useMutation({
  mutationFn: async ({
    postId,
    article,
  }: {
    postId: string;
    article: Partial<NewPostType>;
  }) => {
    await patchNewsArticle(postId, article);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["allPosts"] });
    queryClient.invalidateQueries({ queryKey: ["users-news-articles"] });
    setTimeout(() => {
      toast("News post updated", {
        autoClose: 3000,
        type: "success",
      });
    }, 300);
  },
  onError: (error) => {
    console.error("Failed to update post:", error);
    setTimeout(() => {
      toast("Failed to update news post", {
        autoClose: 3000,
        type: "error",
      });
    }, 300);
  },
});

function handlePostEdit(post: Post) {
  selectedPost.value = post;
  postEditDialogOpen.value = true;
}

function handlePostEditAction(formData: Partial<Post>) {
  console.log(selectedPost.value);
  updatePost({
    postId: selectedPost.value?.slug || "",
    article: {
      title: formData.title || "",
      url_to_image: formData.url_to_image || "",
      content: formData.content || "",
      description: formData.description || "",
    },
  });
  postEditDialogOpen.value = false;
}
// DELETE POST
const { mutate: deletePostMutation } = useMutation({
  mutationFn: async (postId: string) => {
    await deleteNewsArticle(postId);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["users-news-articles"],
    });
  },
  onError: (error) => {
    console.error("Failed to delete post:", error);
    setTimeout(() => {
      toast.error("Failed to delete post.");
    }, 300);
  },
});

function handlePostDelete(post: Post) {
  selectedPost.value = post;
  postDeleteDialogOpen.value = true;
}

function handleConfirmPostDelete() {
  if (selectedPost.value) {
    deletePostMutation(selectedPost.value.slug);
  }
  postDeleteDialogOpen.value = false;
}
</script>
