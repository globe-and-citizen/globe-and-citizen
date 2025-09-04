<template>
  <DesktopHeader />
  <main>
    <RouterView />
  </main>
  <ModalsContainer />
  <Footer />
</template>

<script setup lang="ts">
import DesktopHeader from "../components/DesktopHeader.vue";
import { ModalsContainer } from "vue-final-modal";
import Footer from "@/components/Footer.vue";
</script>
