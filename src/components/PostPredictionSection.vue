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
    <div
      class="grid items-stretch gap-3"
      :class="
        showChart && prediction.token_id
          ? 'md:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]'
          : ''
      "
    >
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
            :class="
              prediction.outcome === 'Yes' ? 'text-green-600' : 'text-red-600'
            "
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
      <PolymarketPriceChart
        v-if="showChart && prediction.token_id"
        :token-id="prediction.token_id"
        :label="title"
        :accent-color="title === 'Hedge' ? '#84cc16' : '#0ea5e9'"
      >
      </PolymarketPriceChart>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PostPrediction } from "@/models/Posts";
import { Button } from "@/components/ui/button";
import PolymarketPriceChart from "@/components/Charts/PolymarketPriceChart.vue";

withDefaults(
  defineProps<{
    prediction: PostPrediction;
    title?: string;
    actionLabel?: string;
    showChart?: boolean;
  }>(),
  {
    title: "Prediction",
    actionLabel: "",
    showChart: true,
  },
);

const emit = defineEmits<{
  (e: "action"): void;
}>();
</script>
