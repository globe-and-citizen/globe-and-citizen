<template>
  <SidebarProvider class="bg-[#f5f5f5]">
    <!--    <main>-->
    <AdminPanel />
    <SidebarTrigger />
    <slot />
    <SidebarContent
      class="px-6 lg:px-[45px] m-3 lg:m-8 border rounded-xl pt-[28px] w-full bg-white"
    >
      <RouterView />
    </SidebarContent>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarProvider } from "../components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AdminPanel from "@/components/AdminPanel/index.vue";
import SidebarContent from "@/components/ui/sidebar/SidebarContent.vue";
</script>
