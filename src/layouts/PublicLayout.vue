<template>
  <DesktopHeader />
  <main>
    <div class="min-h-[calc(100vh-457px)]">
      <RouterView />
    </div>
  </main>
  <ModalsContainer />
  <Footer />
</template>

<script setup lang="ts">
import DesktopHeader from "../components/DesktopHeader.vue";
import { ModalsContainer } from "vue-final-modal";
import Footer from "@/components/Footer.vue";
</script>
