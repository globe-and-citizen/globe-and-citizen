<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && $emit('close')">
    <DialogContent
      class="max-h-[85vh] overflow-y-auto no-scrollbar max-w-max w-[90vw]"
    >
      <DialogHeader>
        <DialogTitle>Article Preview</DialogTitle>
        <DialogDescription>
          Preview of the article before taking any action.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">{{ post?.title }}</h2>
          <p class="text-sm text-muted-foreground">
            By {{ post?.author || "Unknown" }} |
            {{ post?.source_name || "Unknown Source" }} |
            {{ formatDate(post?.created_at || "") }}
          </p>
          <div v-if="post?.url_to_image" class="my-4">
            <img
              :src="post?.url_to_image"
              alt="Article image"
              class="w-full max-h-64 object-cover rounded-md"
            />
          </div>
          <p class="text-sm">{{ post?.description }}</p>
          <div
            className="ql-editor mt-4 !h-fit"
            v-html="sanitizedContent"
          ></div>
        </div>
      </div>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button @click="$emit('close')">Close</Button>
        <Button
          v-if="post?.source_url"
          variant="outline"
          @click="$emit('view-original')"
        >
          View Original
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Post } from "@/models/Posts";
import DOMPurify from "dompurify";

interface Props {
  isOpen: boolean;
  post: Post | null;
}

interface Emits {
  (e: "close"): void;
  (e: "view-original"): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

// Function to format date
function formatDate(dateString: string): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

const sanitizedContent = computed(() => {
  if (!props.post || !props.post.content) return "";
  return DOMPurify.sanitize(props.post.content);
});
</script>
