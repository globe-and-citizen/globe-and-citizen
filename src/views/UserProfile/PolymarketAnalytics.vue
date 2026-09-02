<template>
  <div class="w-full min-w-0">
    <section class="rounded-[28px] bg-white/90 overflow-hidden">
      <div class="px-1 py-1 md:px-1 md:py-1 xl:px-1">
        <PolymarketMarketInsights :is-open="true" embedded />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import PolymarketMarketInsights from "@/components/PolymarketMarketInsights.vue";
</script>
