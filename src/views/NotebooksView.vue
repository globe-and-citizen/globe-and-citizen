<template>
  <div class="w-full bg-white">
    <div class="max-w-7xl mx-auto py-10 px-6 space-y-6">
      <div
        class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div class="space-y-1">
          <h1 class="text-3xl font-bold tracking-tight text-gray-900">
            Notebooks
          </h1>
          <p class="text-sm text-gray-600">
            Runs fully in your browser via JupyterLite (WebAssembly). Best for
            lightweight demos and education.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label class="text-sm text-gray-700 flex items-center gap-2">
            <span class="font-medium">Mode</span>
            <select
              v-model="mode"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="lab">JupyterLab</option>
              <option value="repl">REPL</option>
            </select>
          </label>
        </div>
      </div>

      <div class="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <iframe
          :key="iframeSrc"
          :src="iframeSrc"
          class="w-full"
          :style="{ height: iframeHeight }"
          title="JupyterLite"
          loading="lazy"
          referrerpolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-downloads allow-modals allow-popups"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type Mode = "lab" | "repl";

const mode = ref<Mode>("lab");

const baseUrl =
  (import.meta.env.VITE_JUPYTERLITE_BASE_URL as string | undefined) ??
  "https://jupyterlite.github.io/demo";

const iframeSrc = computed(() => {
  const normalized = baseUrl.replace(/\/$/, "");
  if (mode.value === "repl") {
    return `${normalized}/repl/index.html?kernel=python&toolbar=1`;
  }

  // JupyterLab
  return `${normalized}/lab/index.html`;
});

const iframeHeight = "75vh";
</script>
