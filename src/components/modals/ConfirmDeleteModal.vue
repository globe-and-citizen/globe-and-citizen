<template>
  <VueFinalModal
    class="confirm-delete-modal"
    content-class="confirm-delete-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="p-4">
      <h1 class="text-lg font-semibold mb-4">{{ title }}</h1>
      <div class="mb-6 text-gray-700">
        <slot />
      </div>
      <div class="flex justify-end space-x-3">
        <button
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          @click="$emit('confirm')"
        >
          Confirm
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>

<script setup lang="ts">
import { VueFinalModal } from "vue-final-modal";

defineProps<{
  title?: string;
}>();

defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();
</script>

<style>
.confirm-delete-modal {
  display: flex;
  justify-content: center;
  align-items: center;
}
.confirm-delete-modal-content {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
}
</style>
