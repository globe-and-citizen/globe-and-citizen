<template>
  <DesktopHeader />
  <main>
    <RouterView />
  </main>
  <ModalsContainer />
</template>

<script setup lang="ts">
import DesktopHeader from "../components/Header/DesktopHeader.vue";
import { ModalsContainer } from "vue-final-modal";
</script>
