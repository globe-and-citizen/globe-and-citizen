<template>
  <main class="flex w-full flex-col gap-6 px-4 py-4 md:px-6 md:py-8 xl:px-8">
    <header class="w-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="h-2 w-2 rounded-full bg-secondary animate-pulse"/>
            <span class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/60">
              Correlation Monitor
            </span>
          </div>
          <h1 class="text-2xl font-semibold tracking-tight text-base-content lg:text-3xl">
            Historical Price Correlation
          </h1>
          <p class="max-w-2xl text-sm leading-relaxed text-base-content/70">
            Pick any two markets/outcomes + date range, then generate historical correlation scatter.
          </p>
        </div>
      </div>
    </header>

    <section class="w-full rounded-xl border border-base-300 bg-base-100 p-5 shadow-sm lg:p-6">
      <MarketSelectionForm
        v-model:x-axis-name="xAxisName"
        v-model:y-axis-name="yAxisName"
        v-model:token-id-a="tokenIdA"
        v-model:token-id-b="tokenIdB"
        v-model:start-date="startDate"
        v-model:end-date="endDate"
        v-model:interval="historyInterval"
        :is-loading="isLoading"
        @generate="onGenerate"
        @update:chart-title="t => chartTitle = t"
        @update:fidelity="t => historyFidelity = t"
      />
    </section>

    <div
      v-if="errorMsg"
      class="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      role="alert"
    >
      <strong>Error:</strong>
      <div class="whitespace-pre-wrap break-words mt-1">{{ errorMsg }}</div>
    </div>

    <HistoricalScatterPlot
      v-model:paired-samples-count="pairedSamplesCount"
      :x-history="marketAHistory"
      :y-history="marketBHistory"
      :x-label="xAxisName"
      :y-label="yAxisName"
      :title="chartTitle"
      :tolerance="historyFidelity"
    />

    <div class="rounded-md border border-base-300 bg-base-200/60 px-3 py-2.5">
      <p class="font-mono text-xs leading-relaxed text-base-content/70">
        {{ statusMessage }}
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import {ref, watch} from "vue";
import {toast} from "vue-sonner";
import HistoricalScatterPlot from "./HistoricalScatterPlot.vue";
import MarketSelectionForm from "./MarketSelectionForm.vue";
import {
  getPolymarketPricesHistories,
  type PolymarketPriceHistoryPoint,
} from "@/api/polymarket.ts";

defineOptions({name: "HistoricalCorrelationPage"});

const isLoading = ref(false);
const statusMessage = ref("Choose two markets, dates, then click Generate.");

const xAxisName = ref("");
const yAxisName = ref("");
const tokenIdA = ref("");
const tokenIdB = ref("");
const startDate = ref("");
const endDate = ref("");
const historyInterval = ref("all");
const historyFidelity = ref(1);
const pairedSamplesCount = ref(0);
const chartTitle = ref("");
const errorMsg = ref("");

const marketAHistory = ref<PolymarketPriceHistoryPoint[]>([]);
const marketBHistory = ref<PolymarketPriceHistoryPoint[]>([]);

watch(pairedSamplesCount, (v) => {
  statusMessage.value = v
    ? `Generated ${v} historical paired samples from ${startDate.value} to ${endDate.value}.`
    : "No paired samples generated.";
}, { immediate: true });

const onGenerate = async () => {
  if (!tokenIdA.value || !tokenIdB.value) {
    toast.error("Select two outcomes first.");
    return;
  }

  if (!startDate.value || !endDate.value) {
    toast.error("Select begin and end date.");
    return;
  }

  const startMs = Math.floor(new Date(startDate.value).getTime() / 1000);
  const endMs = Math.floor(new Date(endDate.value).getTime() / 1000);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    toast.error("Invalid date range.");
    return;
  }

  // clear previous history
  marketAHistory.value = [];
  marketBHistory.value = [];

  isLoading.value = true;
  statusMessage.value = "Generating historical correlation...";
  try {
    errorMsg.value = "";
    await new Promise((resolve) => setTimeout(resolve, 450));

    // the limit of the API is 15 days, so we need to chunk the requests
    const chunkSec = 15 * 24 * 60 * 60;

    let curStart = startMs;
    while (curStart <= endMs) {
      const chunkEnd = Math.min(endMs, curStart + chunkSec - 1);
      const res = await getPolymarketPricesHistories({
        market_a: tokenIdA.value,
        market_b: tokenIdB.value,
        startTs: curStart,
        endTs: chunkEnd,
        interval: historyInterval.value,
        fidelity: historyFidelity.value,
      });

      marketAHistory.value.push(...(res.history_a || []));
      marketBHistory.value.push(...(res.history_b || []));

      curStart = chunkEnd + 1;
    }

    // dedupe by timestamp and sort ascending
    const normalize = (arr: { t: number; p: number }[]) => {
      const map = new Map<number, { t: number; p: number }>();
      for (const it of arr) map.set(it.t, it);
      return Array.from(map.values()).sort((a, b) => a.t - b.t);
    };

    marketAHistory.value = normalize(marketAHistory.value);
    marketBHistory.value = normalize(marketBHistory.value);

    toast.success("Historical correlation generated");
  } catch (error) {
    console.error(error);
    errorMsg.value = error instanceof Error ? error.message : String(error);
    statusMessage.value = "Failed to generate historical correlation.";
    toast.error("Failed to generate historical correlation");
  } finally {
    isLoading.value = false;
  }
};
</script>
