<template>
  <form class="space-y-5" @submit.prevent="$emit('submit')">
    <div class="grid gap-4 lg:grid-cols-2">
      <div
        class="space-y-4 rounded-xl border border-base-300 bg-base-200/40 p-4"
      >
        <div
          class="flex items-center justify-between gap-2 border-b border-base-300 pb-2"
        >
          <div class="badge badge-primary badge-sm font-mono">MARKET ONE</div>
          <span
            class="text-[11px] font-medium uppercase tracking-[0.18em] text-base-content/45"
            >X axis</span
          >
        </div>

        <div class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Event or market URL
          </label>
          <input
            v-model="marketUrlA"
            :disabled="isActive"
            placeholder="https://polymarket.com/event/..."
            class="input input-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          />
        </div>

        <div
          v-if="marketsA?.length > 0"
          class="field-group flex flex-col gap-1.5"
        >
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select market
          </label>
          <select
            v-model="marketA"
            :disabled="isActive"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option v-for="market in marketsA" :key="market.id" :value="market">
              {{ market.question }}
            </option>
          </select>
        </div>

        <div
          v-if="outcomesA?.length > 0"
          class="field-group flex flex-col gap-1.5"
        >
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select outcome
          </label>
          <select
            v-model="tokenIdA"
            :disabled="isActive"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option
              v-for="outcome in outcomesA"
              :key="outcome.tokenId"
              :value="outcome.tokenId"
            >
              {{ outcome.name }}
            </option>
          </select>
        </div>
      </div>

      <div
        class="space-y-4 rounded-xl border border-base-300 bg-base-200/40 p-4"
      >
        <div
          class="flex items-center justify-between gap-2 border-b border-base-300 pb-2"
        >
          <div class="badge badge-secondary badge-sm font-mono">MARKET TWO</div>
          <span
            class="text-[11px] font-medium uppercase tracking-[0.18em] text-base-content/45"
            >Y axis</span
          >
        </div>

        <div class="field-group flex flex-col gap-1.5">
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Event or market URL
          </label>
          <input
            v-model="marketUrlB"
            :disabled="isActive"
            placeholder="https://polymarket.com/event/..."
            class="input input-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          />
        </div>

        <div
          v-if="marketsB?.length > 0"
          class="field-group flex flex-col gap-1.5"
        >
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select market
          </label>
          <select
            v-model="marketB"
            :disabled="isActive"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option v-for="market in marketsB" :key="market.id" :value="market">
              {{ market.question }}
            </option>
          </select>
        </div>

        <div
          v-if="outcomesB?.length > 0"
          class="field-group flex flex-col gap-1.5"
        >
          <label
            class="field-label text-[11px] font-semibold uppercase tracking-wide text-base-content/65"
          >
            Select outcome
          </label>
          <select
            v-model="tokenIdB"
            :disabled="isActive"
            class="select select-bordered h-10 w-full rounded-lg border-base-300 bg-base-100 text-sm border focus:ring-primary/20 px-2"
          >
            <option
              v-for="outcome in outcomesB"
              :key="outcome.tokenId"
              :value="outcome.tokenId"
            >
              {{ outcome.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <button
        v-if="!isActive"
        type="submit"
        :disabled="!canStart"
        :aria-disabled="!canStart"
        class="btn h-11 w-full text-sm font-semibold tracking-wide transition-all duration-200"
        :class="
          canStart
            ? 'btn-primary shadow-md shadow-primary/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30'
            : 'btn-ghost border border-base-300 bg-base-200/80 text-base-content/55'
        "
      >
        <span class="inline-flex items-center gap-2">
          <span
            class="inline-block h-2.5 w-2.5 rounded-full"
            :class="canStart ? 'bg-success' : 'bg-warning'"
            aria-hidden="true"
          />
          {{
            canStart
              ? "START CORRELATION STREAM"
              : "SELECT TWO OUTCOMES TO START"
          }}
        </span>
      </button>

      <p v-if="!isActive" class="text-xs text-base-content/60">
        {{
          canStart
            ? "Ready to stream live prices for both selected outcomes."
            : "Choose one market and one outcome on each side to enable streaming."
        }}
      </p>

      <button
        v-else
        type="button"
        class="btn btn-error h-11 w-full text-sm font-semibold tracking-wide text-error-content shadow-md shadow-error/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-error/35"
        @click="$emit('deactivate')"
      >
        <span class="inline-flex items-center gap-2">
          <span
            class="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-error-content"
            aria-hidden="true"
          />
          STOP STREAM
        </span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PolymarketMarket } from "@/types";

interface MarketOutcome {
  name: string;
  tokenId: string;
}

const marketUrlA = defineModel<string>("marketUrlA", { default: "" });
const marketUrlB = defineModel<string>("marketUrlB", { default: "" });
const marketA = defineModel<PolymarketMarket | null>("marketA", {
  default: null,
});
const marketB = defineModel<PolymarketMarket | null>("marketB", {
  default: null,
});
const tokenIdA = defineModel<string>("tokenIdA", { default: "" });
const tokenIdB = defineModel<string>("tokenIdB", { default: "" });

const canStart = computed(() => {
  return Boolean(
    marketA.value && marketB.value && tokenIdA.value && tokenIdB.value,
  );
});

defineProps<{
  marketsA: PolymarketMarket[];
  marketsB: PolymarketMarket[];
  outcomesA: MarketOutcome[];
  outcomesB: MarketOutcome[];
  isActive: boolean;
}>();

defineEmits(["deactivate", "submit"]);
</script>
