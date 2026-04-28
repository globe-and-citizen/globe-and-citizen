<template>
  <div class="grid gap-3">
    <div class="rounded-md border p-4 text-sm grid gap-2">
      <div class="font-medium">Summary</div>

      <div v-if="isSum">
        <div>Type: Sum ({{ legsCount }} legs)</div>
        <div>Direction: {{ direction.toUpperCase() }}</div>
        <div>
          Trigger: p1 + ... + p{{ legsCount }} {{ operator }} {{ threshold }}
        </div>
      </div>
      <div v-else>
        <div>Type: Single</div>
        <div>
          Trigger: {{ direction.toUpperCase() }}
          {{ operatorSymbol(singleOperator) }}
          {{ targetPrice }}
        </div>
      </div>

      <div class="break-all">
        Notify Discord: {{ notifyDiscord ? "Yes" : "No" }}
      </div>
      <div v-if="notifyDiscord && discordWebhook" class="break-all">
        Webhook: {{ discordWebhook }}
      </div>
      <div>Repeat: {{ repeat ? "Yes" : "No" }}</div>

      <div class="pt-2">
        <div class="font-medium">Legs</div>
        <div v-for="(leg, idx) in legs" :key="idx">
          {{ idx + 1 }}. {{ leg.marketUrl }} -
          {{ leg.selectedOutcomeName || "-" }}
        </div>
      </div>
    </div>

    <p v-if="submitError" class="text-sm text-red-600">
      {{ submitError }}
    </p>
  </div>
</template>

<script setup lang="ts">
type AlertOperator = "lt" | "lte" | "gt" | "gte" | "eq";
type AlertDirection = "buy" | "sell";

defineProps<{
  isSum: boolean;
  legsCount: number;
  direction: AlertDirection;
  operator: AlertOperator;
  singleOperator: AlertOperator;
  threshold: number;
  targetPrice: number;
  notifyDiscord: boolean;
  discordWebhook: string;
  repeat: boolean;
  legs: Array<{
    marketUrl: string;
    selectedOutcomeName: string;
  }>;
  submitError: string;
  operatorSymbol: (op: AlertOperator) => string;
}>();
</script>
