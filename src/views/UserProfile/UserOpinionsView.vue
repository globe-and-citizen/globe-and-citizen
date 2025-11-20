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
        show-delete-button
        :edit="handleOpinionEdit"
        :delete="openDeleteModal"
      />
    </div>
    <div v-else class="text-center py-10 text-gray-500">
      {{ isLoading ? "Loading..." : "No articles found" }}
    </div>
  </div>

  <!-- Opinion Edit Dialog -->
  <OpinionEditDialog
    :is-open="opinionEditDialogOpen"
    :opinion="selectedOpinion"
    @close="opinionEditDialogOpen = false"
    @save="handleSaveOpinionEdit"
  />

  <DeleteDialog
    :is-open="isDeleteModalOpen"
    item-type="Post"
    @close="isDeleteModalOpen = false"
    @confirm="confirmDelete"
  />
</template>
<script setup lang="ts">
import MyViewpointsCard from "../../components/MyViewpointsCard.vue";
import OpinionEditDialog from "@/components/AdminPanel/NewsTable/OpinionEditDialog.vue";
import DeleteDialog from "@/components/AdminPanel/NewsTable/DeleteDialog.vue";
import {
  deleteOpinion,
  getUsersArticles,
  patchOpinion,
} from "@/api/opinions.ts";
import type { FetchPostsType, Post } from "@/models/Posts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import type { OpinionPatchPayload } from "@/models/Opinions";
const queryClient = useQueryClient();
import { toast } from "vue3-toastify";

const currentPage = ref(0);
const pageSize = ref(10);
const opinionEditDialogOpen = ref(false);
const isDeleteModalOpen = ref(false);

const selectedOpinion = ref<Post | null>(null);

const { data, isLoading } = useQuery<FetchPostsType>({
  queryKey: ["users-articles", currentPage, pageSize],
  queryFn: () => getUsersArticles(pageSize.value, currentPage.value),
  refetchOnWindowFocus: true,
});

// UPDATE OPINION
const { mutate: updateOpinion } = useMutation({
  mutationFn: async (payload: OpinionPatchPayload) => {
    await patchOpinion(payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["users-articles"],
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

function handleOpinionEdit(opinion: Post) {
  selectedOpinion.value = opinion;
  opinionEditDialogOpen.value = true;
}

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

// DELETE OPINION
const openDeleteModal = (opinion: Post) => {
  selectedOpinion.value = opinion;
  isDeleteModalOpen.value = true;
};

const { mutate: deleteOpinionMutation } = useMutation({
  mutationFn: async (opinionId: string) => {
    await deleteOpinion(opinionId);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["allPosts"],
    });
    queryClient.invalidateQueries({
      queryKey: ["users-articles"],
    });
    queryClient.invalidateQueries({
      queryKey: ["users-news-articles"],
    });
    setTimeout(() => {
      toast("Opinion deleted", {
        autoClose: 3000,
        type: "success",
      });
    }, 300);
  },
  onError: (error) => {
    console.error("Failed to delete opinion:", error);
    setTimeout(() => {
      toast.error("Failed to delete opinion.");
    }, 300);
  },
});

const confirmDelete = () => {
  if (selectedOpinion.value) {
    deleteOpinionMutation(selectedOpinion.value.slug);
  }
  isDeleteModalOpen.value = false;
};
</script>
