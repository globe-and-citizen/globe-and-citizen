<template>
  <Dialog :open="isOpen" @update:open="(open) => !open && $emit('close')">
    <DialogContent class="w-[90vw] max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete {{ itemType }}</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this {{ itemType.toLowerCase() }}?
          This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button variant="outline" @click="$emit('close')">Cancel</Button>
        <Button variant="destructive" @click="$emit('confirm')">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  isOpen: boolean;
  itemType?: string;
}

interface Emits {
  (e: "close"): void;
  (e: "confirm"): void;
}

withDefaults(defineProps<Props>(), {
  itemType: "Article",
});

defineEmits<Emits>();
</script>
