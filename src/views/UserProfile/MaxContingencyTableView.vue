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
            <span class="h-px w-12 bg-slate-300" />
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
          @submit.prevent="handleSubmit"
        >
          <label class="space-y-1">
            <span class="field-label">Event X name</span>
            <input
              v-model.trim="form.event_x_name"
              class="field-input"
              type="text"
              required
            />
          </label>

          <label class="space-y-1">
            <span class="field-label">Event Y name</span>
            <input
              v-model.trim="form.event_y_name"
              class="field-input"
              type="text"
              required
            />
          </label>

          <label class="space-y-1">
            <span class="field-label">Capital</span>
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
            <span class="field-label">Guard bet</span>
            <input
              v-model.number="form.guard_bet"
              class="field-input"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </label>

          <label class="space-y-1">
            <span class="field-label">P(X=1)</span>
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
            <span class="field-label">P(Y=1)</span>
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

          <label class="space-y-1">
            <span class="field-label">P(Y=1 | X=0)</span>
            <input
              v-model.number="form.prob_event_y_yes_given_x_no"
              class="field-input"
              type="number"
              min="0"
              max="1"
              step="0.01"
              required
            />
          </label>

          <label class="space-y-1">
            <span class="field-label">P(Y=1 | X=1)</span>
            <input
              v-model.number="form.prob_event_y_yes_given_x_yes"
              class="field-input"
              type="number"
              min="0"
              max="1"
              step="0.01"
              required
            />
          </label>

          <label class="space-y-1">
            <span class="field-label">Matrix step</span>
            <input
              v-model.number="form.matrix_step"
              class="field-input"
              type="number"
              min="0.01"
              max="1"
              step="0.01"
              required
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
            <p v-if="errorMessage" class="text-sm font-medium text-rose-700">
              {{ errorMessage }}
            </p>
          </div>
        </form>
      </div>
    </section>

    <section v-if="result" class="grid gap-4 md:grid-cols-3">
      <article
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Expected value
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ formatMoney(result.payout_snapshot.expected_value) }}
        </p>
      </article>
      <article
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Best payout
        </p>
        <p class="mt-2 text-2xl font-semibold text-emerald-700">
          {{ formatMoney(bestPoint?.payout ?? 0) }}
        </p>
      </article>
      <article
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Best probability point
        </p>
        <p class="mt-2 text-sm font-semibold text-slate-900">
          X={{ bestPoint?.col_event_x_yes_prob.toFixed(2) ?? "-" }} | Y={{
            bestPoint?.row_event_y_yes_prob.toFixed(2) ?? "-"
          }}
        </p>
      </article>
    </section>

    <section
      v-if="payToPlayCells.length"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">
        Pay-To-Play cell outputs
      </h2>
      <p class="mt-1 text-sm text-slate-600">
        Computed outputs shown by calculation meaning.
      </p>

      <div class="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr
              class="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
            >
              <th class="px-3 py-2">Output</th>
              <th class="px-3 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in payToPlayCells"
              :key="item.name"
              class="border-b border-slate-100"
            >
              <td class="px-3 py-2 text-slate-700">{{ item.name }}</td>
              <td
                class="px-3 py-2 font-semibold"
                :class="item.value >= 0 ? 'text-emerald-700' : 'text-rose-700'"
              >
                {{ formatMoney(item.value) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section
      v-if="details"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">
        Automatic bet allocation
      </h2>
      <div class="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr
              class="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
            >
              <th class="px-3 py-2">Metric</th>
              <th class="px-3 py-2">
                Guard ({{ details.automatic_bet_allocation.guard.label }})
              </th>
              <th class="px-3 py-2">
                Money maker ({{
                  details.automatic_bet_allocation.money_maker.label
                }})
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-slate-100">
              <td class="px-3 py-2 text-slate-700">Capital total</td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{
                  formatMoney(details.automatic_bet_allocation.capital_total)
                }}
              </td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{
                  formatMoney(details.automatic_bet_allocation.capital_total)
                }}
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="px-3 py-2 text-slate-700">Bet allocation</td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{ formatMoney(details.automatic_bet_allocation.guard.bet) }}
              </td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{
                  formatMoney(details.automatic_bet_allocation.money_maker.bet)
                }}
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="px-3 py-2 text-slate-700">Market percentage</td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{
                  formatPercent(
                    details.automatic_bet_allocation.guard.percentage,
                  )
                }}
              </td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{
                  formatPercent(
                    details.automatic_bet_allocation.money_maker.percentage,
                  )
                }}
              </td>
            </tr>
            <tr class="border-b border-slate-100">
              <td class="px-3 py-2 text-slate-700">Shares</td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{
                  formatNumber(details.automatic_bet_allocation.guard.shares)
                }}
              </td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{
                  formatNumber(
                    details.automatic_bet_allocation.money_maker.shares,
                  )
                }}
              </td>
            </tr>
            <tr>
              <td class="px-3 py-2 text-slate-700">Earnings</td>
              <td
                class="px-3 py-2 font-semibold"
                :class="
                  details.automatic_bet_allocation.guard.earnings >= 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                "
              >
                {{
                  formatMoney(details.automatic_bet_allocation.guard.earnings)
                }}
              </td>
              <td
                class="px-3 py-2 font-semibold"
                :class="
                  details.automatic_bet_allocation.money_maker.earnings >= 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                "
              >
                {{
                  formatMoney(
                    details.automatic_bet_allocation.money_maker.earnings,
                  )
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-sm text-slate-600">
        Combined hold:
        <span class="font-semibold text-slate-900">{{
          formatPercent(details.automatic_bet_allocation.hold_percentage)
        }}</span>
      </p>
    </section>

    <section
      v-if="details"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">Possible outcomes</h2>
      <div class="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr
              class="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
            >
              <th class="px-3 py-2">Outcome</th>
              <th class="px-3 py-2">Guard</th>
              <th class="px-3 py-2">Money maker</th>
              <th class="px-3 py-2">Total</th>
              <th class="px-3 py-2">Expectation contribution</th>
              <th class="px-3 py-2">ROI</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="outcome in details.possible_outcomes"
              :key="outcome.name"
              class="border-b border-slate-100"
            >
              <td class="px-3 py-2 text-slate-700">
                {{ outcome.name }}
                <span
                  v-if="outcome.is_logically_impossible"
                  class="ml-2 text-xs text-rose-600"
                  >(logically impossible)</span
                >
              </td>
              <td
                class="px-3 py-2"
                :class="
                  outcome.guard >= 0 ? 'text-emerald-700' : 'text-rose-700'
                "
              >
                {{ formatMoney(outcome.guard) }}
              </td>
              <td
                class="px-3 py-2"
                :class="
                  outcome.money_maker >= 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                "
              >
                {{ formatMoney(outcome.money_maker) }}
              </td>
              <td
                class="px-3 py-2 font-semibold"
                :class="
                  outcome.total >= 0 ? 'text-emerald-700' : 'text-rose-700'
                "
              >
                {{ formatMoney(outcome.total) }}
              </td>
              <td
                class="px-3 py-2"
                :class="
                  outcome.expected_contribution >= 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                "
              >
                {{ formatMoney(outcome.expected_contribution) }}
                <span class="text-xs text-slate-500"
                  >({{ formatProbability(outcome.joint_probability) }})</span
                >
              </td>
              <td
                class="px-3 py-2"
                :class="
                  outcome.roi_percent >= 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                "
              >
                {{ formatPercent(outcome.roi_percent) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p
            class="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold"
          >
            Expectation
          </p>
          <p
            class="mt-2 text-2xl font-semibold"
            :class="
              details.expectation.expected_value >= 0
                ? 'text-emerald-700'
                : 'text-rose-700'
            "
          >
            {{ formatMoney(details.expectation.expected_value) }}
          </p>
        </article>
        <article class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p
            class="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold"
          >
            ROI
          </p>
          <p
            class="mt-2 text-2xl font-semibold"
            :class="
              details.expectation.roi_percent >= 0
                ? 'text-emerald-700'
                : 'text-rose-700'
            "
          >
            {{ formatPercent(details.expectation.roi_percent) }}
          </p>
        </article>
      </div>
    </section>

    <section
      v-if="details"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">
        Joint probability table
      </h2>
      <div class="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table class="min-w-130 border-collapse text-sm">
          <thead>
            <tr
              class="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
            >
              <th class="px-3 py-2">
                {{ form.event_y_name }} \ {{ form.event_x_name }}
              </th>
              <th class="px-3 py-2">
                {{ details.joint_probability_table.column_labels.x_no }}
              </th>
              <th class="px-3 py-2">
                {{ details.joint_probability_table.column_labels.x_yes }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in details.joint_probability_table.rows"
              :key="row.row_key"
              class="border-b border-slate-100"
            >
              <td class="px-3 py-2 text-slate-700">
                {{
                  row.row_key === "y_yes"
                    ? details.joint_probability_table.row_labels.y_yes
                    : details.joint_probability_table.row_labels.y_no
                }}
              </td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{ formatProbability(row.x_no) }}
              </td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{ formatProbability(row.x_yes) }}
              </td>
            </tr>
          </tbody>
        </table>
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
                {{ form.event_y_name }} \ {{ form.event_x_name }}
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

    <section
      v-if="topRows.length"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">Top 5 payout points</h2>
      <div class="mt-4 overflow-auto">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr
              class="border-b border-slate-200 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
            >
              <th class="px-2 py-2">#</th>
              <th class="px-2 py-2">X probability</th>
              <th class="px-2 py-2">Y probability</th>
              <th class="px-2 py-2">Payout</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in topRows"
              :key="`${row.col_event_x_yes_prob}-${row.row_event_y_yes_prob}`"
              class="border-b border-slate-100"
            >
              <td class="px-2 py-2">{{ index + 1 }}</td>
              <td class="px-2 py-2">
                {{ row.col_event_x_yes_prob.toFixed(2) }}
              </td>
              <td class="px-2 py-2">
                {{ row.row_event_y_yes_prob.toFixed(2) }}
              </td>
              <td
                class="px-2 py-2 font-semibold"
                :class="row.payout >= 0 ? 'text-emerald-700' : 'text-rose-700'"
              >
                {{ formatMoney(row.payout) }}
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
  calculateMaxContingencyTable,
  type MaxContingencyTableMatrixRow,
  type MaxContingencyTableRequest,
  type MaxContingencyTableResponse,
} from "@/api/contingency.ts";
import { computed, reactive, ref } from "vue";

const form = reactive<MaxContingencyTableRequest>({
  event_x_name: "Event X",
  event_y_name: "Event Y",
  prob_event_x_yes: 0.45,
  prob_event_y_yes: 0.62,
  capital: 100,
  guard_bet: 10,
  prob_event_y_yes_given_x_no: 1,
  prob_event_y_yes_given_x_yes: 0.58,
  matrix_step: 0.05,
});

const loading = ref(false);
const errorMessage = ref("");
const result = ref<MaxContingencyTableResponse | null>(null);

const xAxisLabels = computed(
  () => result.value?.matrix_axes.col_event_x_yes_probabilities ?? [],
);

const yAxisLabels = computed(
  () => result.value?.matrix_axes.row_event_y_yes_probabilities ?? [],
);

const matrixMinMax = computed(() => {
  const grid = result.value?.matrix_grid ?? [];
  const values = grid.flat();
  if (!values.length) {
    return { min: 0, max: 0 };
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

const topRows = computed(() => {
  if (!result.value) {
    return [] as MaxContingencyTableMatrixRow[];
  }

  return [...result.value.allocation_matrix]
    .sort((a, b) => b.payout - a.payout)
    .slice(0, 5);
});

const bestPoint = computed(() => topRows.value[0] ?? null);

const payToPlayCells = computed(() => result.value?.pay_to_play_cells ?? []);

const details = computed(() => result.value?.spreadsheet_details ?? null);

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMatrixValue(value: number): string {
  return value.toFixed(2);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function formatProbability(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function getMatrixCellStyle(value: number): {
  backgroundColor: string;
  color: string;
} {
  const { min, max } = matrixMinMax.value;
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

async function handleSubmit() {
  errorMessage.value = "";

  if (form.guard_bet > form.capital) {
    errorMessage.value = "Guard bet must be less than or equal to capital.";
    return;
  }

  loading.value = true;
  try {
    result.value = await calculateMaxContingencyTable({ ...form });
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Failed to generate contingency table.";
  } finally {
    loading.value = false;
  }
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
  transition:
    border-color 150ms ease,
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
