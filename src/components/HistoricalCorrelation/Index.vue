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
            Historical Correlation
          </h1>
          <p class="max-w-2xl text-sm leading-relaxed text-base-content/70">
            Pick any two markets/outcomes + date range, then generate historical correlation scatter.
          </p>
        </div>

        <RouterLink to="/correlation-graph" class="btn btn-sm btn-ghost">
          Back to Live Correlation
        </RouterLink>
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
        :is-loading="isLoading"
        @generate="onGenerate"
      />
    </section>

    <HistoricalScatterPlot
      v-model:paired-samples-count="pairedSamplesCount"
      :x-history="marketAHistory"
      :y-history="marketBHistory"
      :x-label="xAxisName"
      :y-label="yAxisName"
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
import {RouterLink} from "vue-router";
import {toast} from "vue-sonner";
import HistoricalScatterPlot from "./HistoricalScatterPlot.vue";
import MarketSelectionForm from "./MarketSelectionForm.vue";
import {getPolymarketPricesHistory, type PolymarketPriceHistoryResponse} from "@/api/polymarket.ts";

defineOptions({name: "HistoricalCorrelationPage"});

const isLoading = ref(false);
const statusMessage = ref("Choose two markets, dates, then click Generate.");

const xAxisName = ref("");
const yAxisName = ref("");
const tokenIdA = ref("");
const tokenIdB = ref("");
const startDate = ref("");
const endDate = ref("");
const pairedSamplesCount = ref(0);

const marketAHistory = ref<PolymarketPriceHistoryResponse>({history: []});
const marketBHistory = ref<PolymarketPriceHistoryResponse>({history: []});

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

  isLoading.value = true;
  statusMessage.value = "Generating historical correlation...";
  try {
    await new Promise((resolve) => setTimeout(resolve, 450));

    // the limit of the API is 15 days, so we need to chunk the requests
    const chunkSec = 15 * 24 * 60 * 60;

    let curStart = startMs;
    while (curStart <= endMs) {
      const chunkEnd = Math.min(endMs, curStart + chunkSec - 1);
      const [aRes, bRes] = await Promise.all([
        getPolymarketPricesHistory({ market: tokenIdA.value, startTs: curStart, endTs: chunkEnd }),
        getPolymarketPricesHistory({ market: tokenIdB.value, startTs: curStart, endTs: chunkEnd }),
      ]);

      marketAHistory.value.history.push(...(aRes.history || []));
      marketBHistory.value.history.push(...(bRes.history || []));

      curStart = chunkEnd + 1;
    }

    // dedupe by timestamp and sort ascending
    const normalize = (arr: { t: number; p: number }[]) => {
      const map = new Map<number, { t: number; p: number }>();
      for (const it of arr) map.set(it.t, it);
      return Array.from(map.values()).sort((a, b) => a.t - b.t);
    };

    marketAHistory.value.history = normalize(marketAHistory.value.history);
    marketBHistory.value.history = normalize(marketBHistory.value.history);

    watch(pairedSamplesCount, (v) => {
      statusMessage.value = `Generated ${v} historical paired samples from ${startDate.value} to ${endDate.value}.`;
    });
    toast.success("Historical correlation generated");
  } catch (error) {
    console.error(error);
    statusMessage.value = "Failed to generate historical correlation.";
    toast.error("Failed to generate historical correlation");
  } finally {
    isLoading.value = false;
  }
};
</script>
