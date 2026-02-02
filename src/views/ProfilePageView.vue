<template>
  <div class="px-4 md:px-8 xl:px-[40px] py-4 md:py-10">
    <div class="flex gap-6">
      <div v-if="!isProfileByIdView" class="w-fit hidden md:block">
        <UserProfileSidebarMenu />
      </div>
      <div
        :class="[
          'flex-1 min-w-0 pl-0 md:pl-8',
          { 'border-l-0 md:border-l': !isProfileByIdView },
        ]"
      >
        <RouterView :key="$route.fullPath" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserProfileSidebarMenu from "@/components/UserProfileSidebarMenu.vue";
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isProfileByIdView = computed(() => route.params.id !== undefined);
onMounted(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
</script>

<style scoped></style>
