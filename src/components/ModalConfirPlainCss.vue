<script setup lang="ts">
import { VueFinalModal } from "vue-final-modal";

defineProps<{
  title?: string;
}>();

const emit = defineEmits<{
  (e: "confirm"): void;
}>();
</script>

<template>
  <VueFinalModal
    class="confirm-modal"
    content-class="confirm-modal-content"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="flex flex-col">
      <h1>{{ title }}</h1>
      <slot />
      <button
        class="mt-4 bg-blue-500 text-white rounded-md px-4 py-2 cursor-pointer hover:bg-blue-600 transition-colors"
        @click="emit('confirm')"
      >
        Confirm
      </button>
    </div>
  </VueFinalModal>
</template>

<style>
.confirm-modal {
  display: flex;
  justify-content: center;
  align-items: center;
}
.confirm-modal-content {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
  padding: 16px;
}
</style>
