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
          <div class="grid gap-2">
            <Label
              for="title"
              class="text-base font-semibold text-black-100 dark:text-gray-300"
            >
              Viewpoint title
            </Label>
            <Input
              id="title"
              v-model="formData.title"
              placeholder="Enter your opinion title"
              class="w-full"
            />
            <div
              class="text-xs font-lato text-black-60 font-medium mt-0 leading-[1] flex justify-between items-center"
            >
              <p>
                Give your article a headline that grabs attention. Aim for max
                60 characters.
              </p>
              <!-- character counter -->
              <p
                class="text-right text-xs text-black-60"
                :style="
                  formData?.title?.length > 60
                    ? 'color: rgba(205, 66, 59, 1)'
                    : ''
                "
              >
                {{ formData?.title?.length ?? 0 }} / 60
              </p>
            </div>
          </div>

          <!-- Content Editor -->
          <div class="grid gap-2">
            <Label
              for="content"
              class="text-base font-semibold text-black-100 dark:text-gray-300"
            >
              Viewpoint text
            </Label>
            <div class="border rounded-md overflow-hidden">
              <QuillEditor
                id="content"
                ref="quillRef"
                content-type="html"
                theme="snow"
                style="min-height: 300px"
                :content="formData.content || ''"
                :options="{
                  modules: {
                    toolbar: {
                      container: toolbarConfig,
                      handlers: customHandlers,
                    },
                  },
                }"
                @update:content="(content: any) => (formData.content = content)"
              />
            </div>
          </div>

          <!-- Cover Image URL -->
          <div class="grid gap-2">
            <Label
              for="imageUrl"
              class="text-base font-semibold text-black-100 dark:text-gray-300"
            >
              Cover Image URL
            </Label>
            <Input
              id="imageUrl"
              v-model="formData.url_to_image"
              placeholder="https://example.com/image.jpg"
              class="w-full"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              class="flex-1"
              @click="handleCancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              class="flex-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              :disabled="!formData.title || !formData.content"
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
import { QuillEditor } from "@vueup/vue-quill";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { addOpinion } from "@/api/opinions.ts";
import { computed, onMounted, ref } from "vue";
import type { Post } from "@/models/Posts";
import type { OpinionPayload } from "@/models/Opinions";
import { generateSlug } from "@/lib/utils.ts";
import { uploadToCloudinary } from "@/api/images.ts";
import type { QuillEditorInstance } from "@/components/AdminPanel/NewsStepper/index.vue";
import { toast } from "vue3-toastify";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import { fetchPostById } from "@/api/posts";
import { useRouter } from "vue-router";
import CategoryTag from "@/components/CategoryTag/CategoryTag.vue";

const route = useRoute();
const router = useRouter();
const queryClient = useQueryClient();
const formData = ref<Partial<Post>>({});
const quillRef = ref<QuillEditorInstance | null>(null);

const postId = route.params.id as string;

const {
  value: { data: post, isLoading },
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

const { mutate: postOpinion, isPending } = useMutation({
  mutationFn: async (payload: OpinionPayload) => {
    await addOpinion(payload);
  },

  onSuccess: () => {
    toast("Opinion submitted successfully!", {
      autoClose: 3000,
      type: "success",
    });
    queryClient.invalidateQueries({ queryKey: ["post", post.value?.slug] });
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

const toolbarConfig = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
  ["link", "image"],
];

const customHandlers = {
  image: function () {
    // File upload option
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const cloudinaryUrl = await uploadToCloudinary(file);
          if (quillRef.value) {
            const quill = quillRef.value.getQuill();
            const range = quill.getSelection();
            if (range) {
              quill.insertEmbed(range.index, "image", cloudinaryUrl);
              quill.setSelection(range.index + 1);
            }
          }
        } catch (error) {
          console.error("Upload failed:", error);
          toast("Image upload failed", {
            autoClose: 3000,
            type: "error",
          });
        }
      }
    };
  },
};

function handleSubmit() {
  if (!formData.value.title || !formData.value.content) {
    toast("Please fill in all required fields", {
      autoClose: 3000,
      type: "warning",
    });
    return;
  }

  handleSaveEdit(formData.value as OpinionPayload);
}

function handleSaveEdit(data: OpinionPayload) {
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

onBeforeRouteUpdate(async (to) => {
  const newPostId = to.params.id as string;
  if (newPostId !== postId) {
    await queryClient.invalidateQueries({ queryKey: ["post", newPostId] });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
</script>

<style scoped>
/* Custom styles for the Quill editor */
:deep(.ql-editor) {
  min-height: 300px;
}

:deep(.ql-toolbar) {
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

:deep(.ql-container) {
  border-bottom: 1px solid #ccc;
  border-left: 1px solid #ccc;
  border-right: 1px solid #ccc;
}

/* Dark mode support for Quill editor */
.dark :deep(.ql-toolbar) {
  border-color: #374151;
  background-color: #374151;
}

.dark :deep(.ql-container) {
  border-color: #374151;
  background-color: #1f2937;
  color: #e5e7eb;
}

.dark :deep(.ql-editor) {
  color: #e5e7eb;
}
</style>
