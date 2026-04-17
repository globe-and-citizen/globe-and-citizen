<template>
  <div :class="containerClass">
    <RouterView :key="$route.fullPath" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const containerClass = computed(() => {
  if (route.meta.fullWidth) {
    return "w-full";
  }

  return "px-4 py-4 md:px-8 md:py-10 xl:px-[40px]";
});

watch(
  () => route.fullPath,
  () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  { immediate: true },
);
</script>
