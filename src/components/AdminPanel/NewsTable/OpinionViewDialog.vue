<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && $emit('close')">
    <DialogContent
      class="max-h-[85vh] overflow-y-auto no-scrollbar max-w-max w-[90vw]"
    >
      <DialogHeader>
        <DialogTitle>Opinion Preview</DialogTitle>
        <DialogDescription>
          Full details of the selected opinion.
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <h2 class="text-xl font-semibold">{{ opinion?.title }}</h2>
          <p class="text-sm text-muted-foreground">
            By {{ opinion?.user.username || "Unknown" }} |
            {{ formatDate(opinion?.created_at || "") }}
          </p>
          <div v-if="opinion?.url_to_image" class="my-4">
            <img
              :src="opinion?.url_to_image"
              alt="Opinion image"
              class="w-full max-h-64 object-cover rounded-md"
            />
          </div>
          <p class="text-sm">{{ opinion?.description }}</p>
          <div
            className="ql-editor mt-4 !h-fit"
            v-html="sanitizedContent"
          ></div>
        </div>
      </div>
      <DialogFooter>
        <Button @click="$emit('close')">Close</Button>
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
  opinion: Post | null;
}

interface Emits {
  (e: "close"): void;
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
  if (!props.opinion || !props.opinion.content) return "";
  return DOMPurify.sanitize(props.opinion.content);
});
</script>
