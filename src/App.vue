<template>
  <router-view />
  <VueQueryDevtools />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import {
  initEncryptedTunnel,
  ServiceProvider,
} from "layer8-interceptor-production";
import { onMounted } from "vue";
import { useGlobalStore } from "@/store/globalStore";
const globalStore = useGlobalStore();

const layer8Enabled = import.meta.env.VITE_API_BASE_URL.includes(
  "globeandcitizenreverseproxy"
);
const forward_proxy_url = import.meta.env.VITE_FORWARD_PROXY_URL;
const backend_url = import.meta.env.VITE_API_BASE_URL;

async function Layer8Init() {
  try {
    const providers = [ServiceProvider.new(backend_url)];

    await initEncryptedTunnel(forward_proxy_url, providers, false);
  } catch (err) {
    throw new Error(`Failed to initialize encrypted tunnel: ${err}`);
  }
}
onMounted(async () => {
  console.log(layer8Enabled);
  if (layer8Enabled) {
    await Layer8Init();
  }
  globalStore.clearGeneratedPost();
});
</script>
