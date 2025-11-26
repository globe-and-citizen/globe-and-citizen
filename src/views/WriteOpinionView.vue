<template>
  <div class="container mx-auto max-w-4xl px-4 py-8">
    <div class="">
      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="pb-4 font-lato">
          <h1 class="text-2xl font-bold text-black-100 dark:text-white">
            You are writing a viewpoint
          </h1>
          <p class="text-sm text-black-60 font-medium mt-3 leading-[1]">
            Your viewpoint reflects your personal opinion on the following
            article. Please make sure your response is original, respectful, and
            based on your own perspective. Avoid copying from other sources —
            this is your chance to express your unique thoughts and reflections.
          </p>
        </div>
        <!-- HORIZONTAL NEWS CARD -->
        <div class="py-4 px-16 border-l border-l-black-20 shadow-card-soft">
          <a
            :href="post?.source_url ?? '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-2 decoration-primary-red text-heading-h6 font-semibold mb-4 font-lato"
          >
            {{ post?.source_name }}
          </a>
          <p class="font-libre text-base font-medium leading-[1] mt-2">
            {{ post?.title }}
          </p>
          <div
            class="text-black-80 mt-2 font-lato font-medium text-xs leading-[1]"
            v-html="
              post?.content.substring(0, 310) + '...' ||
              post?.description ||
              'No content available'
            "
          />
        </div>
        <!-- Form -->
        <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
          <!-- Title Input -->
          <div class="grid gap-2 relative">
            <Label
              for="title"
              class="text-base font-semibold text-black-100 dark:text-gray-300 flex items-center gap-1"
            >
              Viewpoint title <span class="text-red-500">*</span>
            </Label>

            <div class="relative">
              <Input
                v-bind="{
                  id: 'title',
                  placeholder: 'Enter your opinion title',
                }"
                v-model="formData.title"
                class="w-full"
                :class="
                  validationErrors.title
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                "
              />
              <div
                v-if="validationErrors.title"
                class="absolute top-full left-0 mt-1 text-xs text-red-500"
              >
                Title is required.
              </div>
            </div>
          </div>

          <!-- Content Editor -->
          <div class="grid gap-2 relative">
            <Label
              for="content"
              class="text-base font-semibold text-black-100 dark:text-gray-300 flex items-center gap-1"
            >
              Viewpoint text <span class="text-red-500">*</span>
            </Label>

            <div
              class="border rounded-md overflow-hidden relative"
              :class="validationErrors.content ? 'border-red-500' : ''"
            >
              <TipTap
                v-model="formData.content"
                :min-height="'300px'"
                @update:model-value="(content: string) => {
                  formData.content = content;
                  validationErrors.content = false;
                }"
              />
            </div>
            <div
              v-if="validationErrors.content"
              class="absolute top-full left-0 mt-1 text-xs text-red-500"
            >
              Viewpoint text is required.
            </div>
          </div>

          <!-- Cover Image Upload -->
          <div class="grid gap-2">
            <Label
              for="coverImage"
              class="text-base font-semibold text-black-100 dark:text-gray-300"
            >
              Cover Image
            </Label>
            <div class="flex flex-col gap-3">
              <!-- Upload Button -->
              <Button
                v-bind="{ type: 'button', disabled: isUploadingCoverImage }"
                variant="outline"
                class="w-fit"
                @click="handleCoverImageUpload"
              >
                <svg
                  v-if="!isUploadingCoverImage"
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div
                  v-else
                  class="w-4 h-4 mr-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
                ></div>
                {{
                  isUploadingCoverImage ? "Uploading..." : "Upload Cover Image"
                }}
              </Button>

              <!-- Image Preview -->
              <div v-if="formData.url_to_image" class="relative">
                <img
                  :src="formData.url_to_image"
                  alt="Cover image preview"
                  class="w-full max-w-md h-48 object-cover rounded-md border"
                />
                <Button
                  v-bind="{ type: 'button' }"
                  variant="destructive"
                  size="sm"
                  class="absolute top-2 right-2"
                  @click="removeCoverImage"
                >
                  <svg
                    class="w-4 h-4"
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
                </Button>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-4">
            <Button
              v-bind="{
                type: 'button',
                disabled: !formData.title || !formData.content,
              }"
              variant="outline"
              class="flex-1"
              @click="handleCancel"
            >
              Cancel
            </Button>
            <Button
              class="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              v-bind="{
                type: 'submit',
              }"
            >
              Submit Opinion
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { addOpinion } from "@/api/opinions.ts";
import { computed, onMounted, ref, watch } from "vue";
import type { Post } from "@/models/Posts";
import type { OpinionPayload } from "@/models/Opinions";
import { generateSlug } from "@/composables/utils.ts";
import { uploadToCloudinary } from "@/api/images.ts";
import { toast } from "vue3-toastify";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { fetchPostById } from "@/api/posts";
import TipTap from "@/components/Editor/TipTap.vue";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const formData = ref<Partial<Post>>({});
const isUploadingCoverImage = ref(false);

const postId = route.params.id as string;

const {
  value: { data: post },
} = computed(() =>
  useQuery<Post | null, unknown, Post | null, string[]>({
    queryKey: ["post", postId],
    queryFn: async () => {
      const response = await fetchPostById(postId);
      return response as Post | null;
    },
    enabled: !!postId,
  })
);

const { mutate: postOpinion } = useMutation({
  mutationFn: async (payload: OpinionPayload) => {
    await addOpinion(payload);
  },

  onSuccess: () => {
    toast("Opinion submitted successfully!", {
      autoClose: 3000,
      type: "success",
    });
    queryClient.invalidateQueries({ queryKey: ["post", post.value?.slug] });
    queryClient.invalidateQueries({ queryKey: ["users-articles"] });
    // Navigate back to the post or opinions list
    router.push(`/post/${post.value?.slug}`);
  },

  onError: (e) => {
    toast(e, {
      autoClose: 3000,
      type: "error",
    });
  },
});

const validationErrors = ref({
  title: false,
  content: false,
});

function handleSubmit() {
  validationErrors.value.title = !formData.value.title?.trim();
  validationErrors.value.content = !formData.value.content?.trim();

  if (validationErrors.value.title || validationErrors.value.content) {
    toast("Please fill in all required fields before submitting.", {
      autoClose: 3000,
      type: "warning",
    });
    return;
  }

  handleSaveEdit(formData.value as OpinionPayload);
}
function handleSaveEdit(data: OpinionPayload) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { post_id, slug, ...otherData } = data;
  const generatedSlug = generateSlug(data.title || "unknown-title");
  postOpinion({
    post_id: post.value?.id,
    slug: generatedSlug,
    ...otherData,
  } as OpinionPayload);
}

function handleCancel() {
  router.go(-1);
}

function handleCoverImageUpload() {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      isUploadingCoverImage.value = true;
      try {
        formData.value.url_to_image = await uploadToCloudinary(file);
        toast("Cover image uploaded successfully!", {
          autoClose: 3000,
          type: "success",
        });
      } catch (error) {
        console.error("Cover image upload failed:", error);
        toast("Cover image upload failed", {
          autoClose: 3000,
          type: "error",
        });
      } finally {
        isUploadingCoverImage.value = false;
      }
    }
  };
}

function removeCoverImage() {
  formData.value.url_to_image = "";
}

onBeforeRouteUpdate(async (to) => {
  const newPostId = to.params.id as string;
  if (newPostId !== postId) {
    await queryClient.invalidateQueries({ queryKey: ["post", newPostId] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

watch(
  () => formData.value.title,
  (newVal) => {
    if (newVal?.trim()) validationErrors.value.title = false;
  }
);
onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
</script>

<style scoped></style>
