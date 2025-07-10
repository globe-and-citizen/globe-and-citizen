<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && $emit('close')">
    <DialogContent
      class="max-h-[95vh] md:max-w-[80vw] overflow-y-auto no-scrollbar"
    >
      <DialogHeader>
        <DialogTitle>Edit Article</DialogTitle>
        <DialogDescription>
          Make changes to the article. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="title">Title</Label>
          <Input id="title" v-model="formData.title" />
        </div>
        <div class="grid gap-2">
          <Label for="slug">Slug</Label>
          <Input id="slug" v-model="formData.slug" />
        </div>
        <div class="grid gap-2">
          <Label for="author">Author</Label>
          <Input id="author" v-model="formData.author" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="formData.description" />
        </div>
        <div class="grid gap-2">
          <Label for="content">Content</Label>
          <QuillEditor
            id="content"
            content-type="html"
            theme="snow"
            style="min-height: 200px"
            :content="formData.content || ''"
            :options="{
              modules: {
                toolbar: [
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ header: 1 }, { header: 2 }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  [{ script: 'sub' }, { script: 'super' }],
                  [{ indent: '-1' }, { indent: '+1' }],
                  [{ direction: 'rtl' }],
                  [{ size: ['small', false, 'large', 'huge'] }],
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  [{ color: [] }, { background: [] }],
                  [{ font: [] }],
                  [{ align: [] }],
                  ['clean'],
                  ['link', 'image'],
                ],
              },
            }"
            @update:content="(content) => (formData.content = content)"
          />
        </div>
        <div class="grid gap-2">
          <Label for="imageUrl">Image URL</Label>
          <Input id="imageUrl" v-model="formData.url_to_image" />
        </div>
        <div class="grid gap-2">
          <Label for="source_name">Source Name</Label>
          <Input id="source_name" v-model="formData.source_name" />
        </div>
        <div class="grid gap-2">
          <Label for="source_url">Source URL</Label>
          <Input id="source_url" v-model="formData.source_url" />
        </div>
      </div>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button variant="outline" @click="$emit('close')">Cancel</Button>
        <Button type="submit" @click="$emit('save', formData)"
          >Save changes</Button
        >
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { watch, ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import type { Post } from "@/models/Posts";

interface Props {
  isOpen: boolean;
  post: Post | null;
}

interface Emits {
  (e: "close"): void;
  (e: "save", formData: Partial<Post>): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const formData = ref<Partial<Post>>({});

// Watch for post changes to update form data
watch(
  () => props.post,
  (newPost) => {
    if (newPost) {
      formData.value = { ...newPost };
    } else {
      formData.value = {};
    }
  },
  { immediate: true }
);
</script>
