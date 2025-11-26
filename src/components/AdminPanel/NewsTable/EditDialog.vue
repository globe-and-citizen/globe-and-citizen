<template>
  <Dialog
    :open="isOpen"
    @update:open="(open: boolean) => !open && $emit('close')"
  >
    <DialogContent
      class="max-h-[95vh] md:max-w-[80vw] overflow-y-auto no-scrollbar"
    >
      <DialogHeader>
        <DialogTitle>Edit post</DialogTitle>
        <DialogDescription>
          Make changes to the post. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="title">Title</Label>
          <Input id="title" v-model="formData.title" />
        </div>
        <div class="grid gap-2">
          <Label for="slug">Slug</Label>
          <Input id="slug" v-model="formData.slug" :disabled="!isAdmin" />
        </div>
        <div class="grid gap-2">
          <Label for="author">Author</Label>
          <Input id="author" v-model="formData.author" :disabled="!isAdmin" />
        </div>
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="formData.description" />
        </div>
        <div class="grid gap-2">
          <Label for="content">Content</Label>
          <TipTap
            id="content"
            v-model="formData.content"
            placeholder="Write your post content..."
            min-height="250px"
          />
        </div>
        <div class="grid gap-2">
          <Label>Cover Image</Label>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                :disabled="imageUploading"
                @click="triggerImageSelect"
              >
                <component
                  :is="LoaderIcon"
                  v-if="imageUploading"
                  class="size-4 animate-spin mr-2"
                />
                {{
                  imageUploading
                    ? "Uploading..."
                    : formData.url_to_image
                    ? "Replace Image"
                    : "Upload Image"
                }}
              </Button>
              <Button
                v-if="formData.url_to_image && !imageUploading"
                type="button"
                variant="ghost"
                size="sm"
                @click="removeUploadedImage"
              >
                Remove
              </Button>
            </div>
            <input
              ref="hiddenImageInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onImageFileChange"
            />
            <div
              v-if="formData.url_to_image"
              class="relative w-40 h-24 rounded border overflow-hidden"
            >
              <img
                :src="formData.url_to_image"
                alt="Cover"
                class="object-cover w-full h-full"
              />
            </div>
            <p class="text-xs text-muted-foreground">Upload a cover image.</p>
            <span v-if="imageUploadError" class="text-xs text-destructive">{{
              imageUploadError
            }}</span>
          </div>
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
import { watch, ref, computed } from "vue";
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
import TipTap from "@/components/Editor/TipTap.vue";
import type { Post } from "@/models/Posts";
import LoaderIcon from "@/assets/icons/loader.svg";
import { uploadToCloudinary } from "@/api/images.ts";
import { useAuthStore } from "@/store/authStore";

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
const hiddenImageInput = ref<HTMLInputElement | null>(null);
const imageUploading = ref(false);
const imageUploadError = ref("");
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.user?.role.name === "admin");

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

function triggerImageSelect() {
  imageUploadError.value = "";
  hiddenImageInput.value?.click();
}

async function onImageFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  imageUploading.value = true;
  imageUploadError.value = "";
  try {
    const url = await uploadToCloudinary(file);
    formData.value.url_to_image = url;
  } catch (err) {
    console.error(err);
    imageUploadError.value = "Failed to upload image. Please try again.";
  } finally {
    imageUploading.value = false;
    if (target) target.value = "";
  }
}

function removeUploadedImage() {
  formData.value.url_to_image = undefined;
}
</script>
