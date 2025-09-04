<template>
  <div class="px-4 md:px-8 xl:px-[120px] my-4 md:my-10">
    <div class="flex gap-6 gc-container">
      <div class="w-fit hidden md:block">
        <UserProfileSidebarMenu />
      </div>
      <div class="w-full border-l-0 md:border-l pl-0 md:pl-8">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserProfileSidebarMenu from "@/components/UserProfileSidebarMenu.vue";
</script>

<style scoped></style>
