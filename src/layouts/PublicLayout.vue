<template>
  <div class="flex min-h-screen flex-col bg-white">
    <DesktopHeader />
    <main class="flex-1">
      <RouterView />
    </main>
    <ModalsContainer />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import DesktopHeader from "../components/DesktopHeader.vue";
import { ModalsContainer } from "vue-final-modal";
import Footer from "@/components/Footer.vue";
</script>
