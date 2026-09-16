<template>
  <section class="space-y-2">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold">{{ title }}</h2>
      <Button
        v-if="actionLabel"
        type="button"
        variant="outline"
        size="sm"
        @click="emit('action')"
      >
        {{ actionLabel }}
      </Button>
    </div>
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
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PostPrediction } from "@/models/Posts";
import { Button } from "@/components/ui/button";

withDefaults(
  defineProps<{
    prediction: PostPrediction;
    title?: string;
    actionLabel?: string;
  }>(),
  {
    title: "Prediction",
    actionLabel: "",
  },
);

const emit = defineEmits<{
  (e: "action"): void;
}>();
</script>
