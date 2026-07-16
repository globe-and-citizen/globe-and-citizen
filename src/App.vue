<template>
  <router-view />
  <Toaster />
  <VueQueryDevtools />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import {
  initEncryptedTunnel,
  ServiceProvider,
} from "l8-intercept";
import { onMounted } from "vue";
import { useGlobalStore } from "@/store/globalStore";
const globalStore = useGlobalStore();
// const layer8Enabled = import.meta.env.VITE_API_BASE_URL.includes(
//   "globeandcitizenreverseproxy",
// );
const layer8Enabled = import.meta.env.VITE_LAYER8_ENABLED === "true";
const forward_proxy_url = import.meta.env.VITE_FORWARD_PROXY_URL;
const backend_url = import.meta.env.VITE_API_BASE_URL;

function Layer8Init() {
  try {
    const providers = [ServiceProvider.new(backend_url)];

    initEncryptedTunnel(forward_proxy_url, providers);
  } catch (err) {
    throw new Error(`Failed to initialize encrypted tunnel: ${err}`);
  }
}

onMounted(() => {
  globalStore.clearGeneratedPost();
  setTimeout(async () => {
    if (layer8Enabled) Layer8Init();
  }, 0);
});
</script>
