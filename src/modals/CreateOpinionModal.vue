<script setup lang="ts">
import { useVfm, VueFinalModal } from "vue-final-modal";
import { QuillEditor } from "@vueup/vue-quill";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { addOpinion } from "@/api/opinions.ts";
import { ref } from "vue";
import type { Post } from "@/models/Posts";
import type { OpinionPayload } from "@/models/Opinions";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/lib/utils.ts";
import { uploadToCloudinary } from "@/api/images.ts";
import type { QuillEditorInstance } from "@/components/AdminPanel/NewsStepper/index.vue";
import { toast } from "vue3-toastify";

const props = defineProps<{
  // eslint-disable-next-line vue/prop-name-casing
  post_id: number;
  // eslint-disable-next-line vue/prop-name-casing
  post_name: string;
  // eslint-disable-next-line vue/prop-name-casing
  post_slug?: string;
}>();
const queryClient = useQueryClient();
const formData = ref<Partial<Post>>({});
const vfm = useVfm();
const { closeAll } = vfm;
const quillRef = ref<QuillEditorInstance | null>(null);

const { mutate: postOpinion } = useMutation({
  mutationFn: async (payload: OpinionPayload) => {
    await addOpinion(payload);
  },

  onSuccess: () => {
    closeAll();
    queryClient.invalidateQueries({ queryKey: ["post", props.post_slug] });
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
        }
      }
    };
  },
};

function handleSaveEdit(data: OpinionPayload) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { post_id, slug, ...otherData } = data;
  const generatedSlug = generateSlug(data.title || "unknown-title");
  postOpinion({
    post_id: props.post_id,
    slug: generatedSlug,
    ...otherData,
  } as OpinionPayload);
}
</script>
<template>
  <VueFinalModal
    class="create-opinion-modal"
    content-class="create-opinion-modal-content w-[900px]"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="flex flex-col gap-4">
      <Label
        class="border-b pb-2 ql-align-center justify-center text-xl"
        for="post_id"
        >News article: {{ post_name }}</Label
      >
      <div class="grid gap-2">
        <Label for="title">Title</Label>
        <Input id="title" v-model="formData.title" />
      </div>

      <div>
        <div class="grid">
          <Label class="mb-2" for="content">Content</Label>
          <QuillEditor
            id="content"
            ref="quillRef"
            content-type="html"
            theme="snow"
            style="min-height: 200px"
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
      <div class="grid gap-2">
        <Label for="imageUrl">Cover Image URL</Label>
        <Input id="imageUrl" v-model="formData.url_to_image" />
      </div>
      <Button
        class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
        @click="() => handleSaveEdit(formData as OpinionPayload)"
      >
        Submit Opinion
      </Button>
    </div>
  </VueFinalModal>
</template>

<style>
.create-opinion-modal {
  display: flex;
  justify-content: center;
  align-items: center;
}
.create-opinion-modal-content {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0.5rem;
  max-width: 800px;
  width: 90%;
  padding: 16px;
  max-height: 90vh;
  overflow: auto;
}
.dark .create-opinion-modal-content {
  background: #1f2937;
  color: #e5e7eb;
}
</style>
