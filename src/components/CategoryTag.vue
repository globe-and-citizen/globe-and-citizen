<template>
  <div
    class="inline-flex items-center px-4 py-2 text-sm font-medium text-[rgba(0, 0, 0, 0.6)] bg-[#D4D4D4] rounded-full"
  >
    {{ categoryName }}
  </div>
</template>

<script setup lang="ts">
defineProps({
  categoryName: {
    type: String,
    required: true,
  },
});
</script>
