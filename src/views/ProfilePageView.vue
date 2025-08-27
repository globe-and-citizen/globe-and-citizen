<template>
  <div class="px-4 md:px-8 xl:px-[120px] my-4 md:my-10">
    <div class="flex gap-9 gc-container">
      <div class="w-fit hidden md:block">
        <SidebarMenu />
      </div>
      <div class="w-full">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SidebarMenu from "@/components/Profile/SidebarMenu/SidebarMenu.vue";
</script>

<style scoped></style>
