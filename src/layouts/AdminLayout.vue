<template>
  <SidebarProvider class="bg-[#f5f5f5]">
    <!--    <main>-->
    <AdminPanel />
    <SidebarTrigger />
    <slot />
    <div
      class="flex flex-col px-[45px] m-8 border rounded-xl pt-[28px] w-full bg-white"
    >
      <RouterView />
    </div>
    <!--    </main>-->
  </SidebarProvider>
</template>

<script setup lang="ts">
import { SidebarProvider } from "../components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import AdminPanel from "@/components/AdminPanel/index.vue";
</script>
