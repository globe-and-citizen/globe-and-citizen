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

const forward_proxy_url = import.meta.env.VITE_FORWARD_PROXY_URL;
const backend_url = import.meta.env.VITE_API_BASE_URL;

async function Layer8Init() {
  try {
    const providers = [ServiceProvider.new(backend_url)];

    initEncryptedTunnel(forward_proxy_url, providers, true);
  } catch (err) {
    throw new Error(`Failed to initialize encrypted tunnel: ${err}`);
  }
}

onMounted(async () => {
  await Layer8Init();
});
</script>
