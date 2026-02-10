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
  payload?: string | number | null;
}
const props = withDefaults(defineProps<Props>(), {
  itemType: "Tracker",
  payload: null,
});

const emit = defineEmits<{
  (e: "close"): void;
  (e: "confirm", payload: string | number | null): void;
}>();

const closeModal = () => {
  emit("close");
};

const confirmDeletion = () => {
  emit("confirm", props.payload);
  emit("close");
};
</script>

<template>
  <Dialog
    :open="props.isOpen"
    @update:open="(open: boolean) => !open && closeModal()"
  >
    <DialogContent class="w-[90vw] max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Delete {{ props.itemType }}</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this
          {{ props.itemType.toLowerCase() }}? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter class="flex-col-reverse sm:flex-row sm:gap-1 md:gap-2">
        <Button variant="outline" @click="closeModal">Cancel</Button>
        <Button variant="destructive" @click="confirmDeletion">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
