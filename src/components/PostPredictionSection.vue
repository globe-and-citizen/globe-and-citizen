<template>
  <section class="space-y-2">
    <h2 class="text-lg font-semibold">Prediction</h2>
    <div class="space-y-2 rounded-md border bg-muted/30 p-4">
      <p class="text-sm font-medium">
        {{ prediction.market_question }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ prediction.event_title }}
      </p>
      <p class="text-sm">
        Position:
        <span
          class="font-semibold"
          :class="prediction.outcome === 'Yes' ? 'text-green-600' : 'text-red-600'"
        >
          {{ prediction.outcome }}
        </span>
      </p>
      <a
        :href="prediction.url"
        target="_blank"
        rel="noreferrer"
        class="inline-block break-all text-sm text-primary underline-offset-4 hover:underline"
      >
        Open on Polymarket
      </a>
      <p v-if="showImmutableNotice" class="text-xs text-muted-foreground">
        The selected prediction is locked after the article is published.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PostPrediction } from "@/models/Posts";

withDefaults(
  defineProps<{
    prediction: PostPrediction;
    showImmutableNotice?: boolean;
  }>(),
  {
    showImmutableNotice: false,
  },
);
</script>
