<template>
  <div class="w-full min-w-0 space-y-6 px-4 py-4 md:px-8 md:py-6 xl:px-10">
    <section
      class="rounded-[28px] border border-slate-200 bg-white/90 shadow-sm overflow-hidden"
    >
      <div
        class="border-b border-slate-200 bg-[linear-gradient(135deg,#ecfeff,transparent_55%),linear-gradient(180deg,#ffffff,#f8fafc)] px-6 py-6 md:px-8"
      >
        <div class="max-w-4xl space-y-3">
          <div
            class="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
          >
            <span>Market Matrix</span>
            <span class="h-px w-12 bg-slate-300"/>
            <span>Contingency Engine</span>
          </div>
          <h1
            class="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl"
          >
            Max contingency table
          </h1>
          <p class="max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
            Configure priors and conditionals, then generate the payout heatmap
            powered by the Python probability engine.
          </p>
        </div>
      </div>

      <div class="px-5 py-5 md:px-8 md:py-7">
        <form
          class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          @submit.prevent="calculateContingencyMatrix"
        >
          <div class="md:col-span-2 xl:col-span-3 grid grid-cols-2 gap-4">
            <label class="space-y-1">
              <span class="field-label">Market A (Horizontal Axis)</span>
              <input
                v-model.trim="form.event_x_name"
                class="field-input"
                type="text"
                required
              />
            </label>

            <label class="space-y-1">
              <span class="field-label">Market B (Vertical Axis)</span>
              <input
                v-model.trim="form.event_y_name"
                class="field-input"
                type="text"
                required
              />
            </label>
          </div>

          <div class="md:col-span-2 xl:col-span-3 grid grid-cols-2 gap-4">
            <label class="space-y-1">
              <span class="field-label">Market A Price ($) / Probability</span>
              <input
                v-model.number="form.prob_event_x_yes"
                class="field-input"
                type="number"
                min="0"
                max="1"
                step="0.01"
                required
              />
            </label>

            <label class="space-y-1">
              <span class="field-label">Market B Price ($) / Probability</span>
              <input
                v-model.number="form.prob_event_y_yes"
                class="field-input"
                type="number"
                min="0"
                max="1"
                step="0.01"
                required
              />
            </label>
          </div>

          <label class="space-y-1">
            <span class="field-label">Capital (Bet A + Bet B)</span>
            <input
              v-model.number="form.capital"
              class="field-input"
              type="number"
              min="0.01"
              step="0.01"
              required
            />
          </label>

          <label class="space-y-1">
            <span class="field-label">Bet A ($)</span>
            <input
              v-model.number="form.guard_bet"
              class="field-input"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </label>

          <label class="space-y-1">
            <span class="field-label">Bet B ($)</span>
            <input
              v-model.number="money_maker"
              class="field-readonly"
              type="number"
              step="0.01"
              min="0"
              readonly
            />
          </label>

          <div
            class="md:col-span-2 xl:col-span-3 flex flex-wrap items-center gap-3 pt-1"
          >
            <button
              class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              :disabled="loading"
            >
              {{ loading ? "Generating..." : "Generate table" }}
            </button>

            <button
              type="button"
              class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="calculateArbitrage"
            >
              Calculate Arbitrage
            </button>

            <button
              type="button"
              class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
              @click="calculateBreakEven"
            >
              Calculate Break Even
            </button>

            <p v-if="errorMessage" class="text-sm font-medium text-rose-700">
              {{ errorMessage }}
            </p>
          </div>
        </form>
      </div>
    </section>

    <section
      v-if="hasHeatmapData"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">
        Contingency matrix view
      </h2>
      <p class="mt-1 text-sm text-slate-600">
        Excel-like contingency matrix values for {{ form.event_x_name }} and
        {{ form.event_y_name }}.
      </p>

      <div class="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table class="matrix-table w-full border-collapse text-center text-xs">
          <thead>
          <tr>
            <th class="matrix-axis-cell sticky left-0 top-0 z-20 bg-white">
              {{ form.event_y_name }} \<br> {{ form.event_x_name }}
            </th>
            <th
              v-for="(xValue, xIndex) in xAxisLabels"
              :key="`x-${xIndex}`"
              class="matrix-axis-cell"
            >
              {{ xValue.toFixed(2) }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(row, rowIndex) in result?.matrix_grid"
            :key="`row-${rowIndex}`"
          >
            <th class="matrix-axis-cell sticky left-0 z-10 bg-white">
              {{ yAxisLabels[rowIndex]?.toFixed(2) ?? "-" }}
            </th>
            <td
              v-for="(value, colIndex) in row"
              :key="`cell-${rowIndex}-${colIndex}`"
              class="matrix-value-cell"
              :style="getMatrixCellStyle(value)"
            >
              {{ formatMatrixValue(value) }}
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  // calculateMaxContingencyTable,
  type MaxContingencyTableRequest,
  type MaxContingencyTableResponse,
} from "@/api/contingency.ts";
import {computed, reactive, ref} from "vue";

const form = reactive<MaxContingencyTableRequest>({
  event_x_name: "Market A",
  event_y_name: "Market B",
  prob_event_x_yes: 0.45,
  prob_event_y_yes: 0.62,
  capital: 100,
  guard_bet: 10,
  matrix_step: 0.05,
});

const loading = ref(false);
const errorMessage = ref("");
const result = ref<MaxContingencyTableResponse | null>(null);

const money_maker = computed<number>({
  get: () => formatDecimal(form.capital - form.guard_bet),
  set: (value: number) => {
    form.guard_bet = formatDecimal(form.capital - Number(value));
  },
});

function formatDecimal(value: number): number {
  return parseFloat(value.toFixed(2));
}

const xAxisLabels = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];

const yAxisLabels = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25, 0.2, 0.15, 0.1, 0.05, 0];

const matrixMinMax = computed(() => {
  const grid = result.value?.matrix_grid ?? [];
  const values = grid.flat();
  if (!values.length) {
    return {min: 0, max: 0};
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
});

const hasHeatmapData = computed(() =>
  Boolean(
    result.value?.matrix_grid?.length && result.value.matrix_grid[0]?.length,
  ),
);

function formatMatrixValue(value: number): string {
  return value.toFixed(2);
}

function getMatrixCellStyle(value: number): {
  backgroundColor: string;
  color: string;
} {
  const {min, max} = matrixMinMax.value;
  const range = max - min;
  const normalized = range === 0 ? 0.5 : (value - min) / range;

  // 0 -> warm red, 1 -> green, midpoint -> yellow for spreadsheet-style heatmap.
  const hue = 5 + normalized * 110;
  const lightness = 70 - normalized * 10;

  return {
    backgroundColor: `hsl(${hue} 85% ${lightness}%)`,
    color: "#111827",
  };
}

function calculateArbitrage() {
  const threshold = form.prob_event_x_yes + form.prob_event_y_yes;
  const roi_target = (1 / threshold) - 1;

  form.guard_bet = formatDecimal(form.prob_event_x_yes * form.capital * (1 + roi_target));
}

function calculateBreakEven() {
  money_maker.value = formatDecimal(form.capital * form.prob_event_y_yes);
}

function calculateContingencyMatrix(): number[][] {
  const sharesA = form.guard_bet / form.prob_event_x_yes;
  const sharesB = money_maker.value / form.prob_event_y_yes;

  const matrix: number[][] = yAxisLabels.map((y) => {
    const payoutB = (y - form.prob_event_y_yes) * sharesB;

    return xAxisLabels.map((x) => {
      const payoutA = (x - form.prob_event_x_yes) * sharesA;
      return payoutA + payoutB;
    });
  });

  result.value = {
    matrix_grid: matrix,
  };

  return matrix
}
</script>

<style scoped>
.field-label {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgb(100 116 139);
}

.field-input {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(203 213 225);
  background: rgb(255 255 255);
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(15 23 42);
  outline: none;
  transition: border-color 150ms ease,
  box-shadow 150ms ease;
}

.field-readonly {
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(203 213 225);
  background: #f3f4f6;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgb(15 23 42);
  outline: none;
  transition: border-color 150ms ease,
  box-shadow 150ms ease;
}

.field-input:focus {
  border-color: rgb(100 116 139);
  box-shadow: 0 0 0 2px rgb(226 232 240);
}

.matrix-table th,
.matrix-table td {
  border: 1px solid rgb(226 232 240);
  white-space: nowrap;
}

.matrix-axis-cell {
  padding: 0.5rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: rgb(51 65 85);
}

.matrix-value-cell {
  min-width: 3.6rem;
  padding: 0.35rem 0.4rem;
  font-weight: 600;
}
</style>
