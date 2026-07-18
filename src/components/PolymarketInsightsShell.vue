<template>
  <div v-if="embedded" class="grid gap-6">
    <div class="grid gap-6 py-1">
      <slot />
    </div>
  </div>

  <Dialog
    v-else
    :open="isOpen"
    @update:open="(open: boolean) => !open && emit('close')"
  >
    <DialogContent
      class="w-[90vw] max-w-[1750px] max-h-[85vh] overflow-y-auto border-0"
    >
      <DialogHeader>
        <DialogTitle>Polymarket Market Insights</DialogTitle>
        <DialogDescription>
          Export data and generate charts for one or more markets.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-6 py-4">
        <slot />
      </div>

      <DialogFooter class="flex-col-reverse sm:flex-row gap-2">
        <Button variant="outline" @click="emit('close')">Close</Button>
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

defineProps<{
  embedded: boolean;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();
</script>
