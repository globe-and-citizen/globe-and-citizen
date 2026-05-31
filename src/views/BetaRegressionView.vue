<template>
  <div class="w-full min-w-0 space-y-6 px-4 py-4 md:px-8 md:py-6 xl:px-10">
    <section
      class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
    >
      <div class="space-y-2">
        <p
          class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
        >
          Polymarket Beta Regression
        </p>
        <h1
          class="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl"
        >
          Beta Regression Graph With Date Picker
        </h1>
        <p class="max-w-4xl text-sm text-slate-600 md:text-base">
          Upload the exact CSV exported from Search Polymarket Markets. This
          tool keeps that export schema unchanged and only runs beta regression
          on selected output columns. Maximum upload size is 10MB.
        </p>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-2">
        <label class="space-y-1">
          <span class="field-label">Exported CSV file</span>
          <input
            class="field-input"
            type="file"
            accept=".csv,text/csv"
            @change="handleFileChange"
          />
        </label>

        <div
          class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
        >
          <p>
            <span class="font-semibold">Loaded:</span>
            {{ loadedFileName || "None" }}
          </p>
          <p><span class="font-semibold">Rows:</span> {{ parsedRowCount }}</p>
        </div>

        <label class="space-y-1">
          <span class="field-label">X column</span>
          <select
            v-model="xColumn"
            class="field-input"
            :disabled="numericColumns.length === 0"
          >
            <option
              v-for="column in numericColumns"
              :key="`x-${column}`"
              :value="column"
            >
              {{ column }}
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="field-label">Y column</span>
          <select
            v-model="yColumn"
            class="field-input"
            :disabled="numericColumns.length === 0"
          >
            <option
              v-for="column in numericColumns"
              :key="`y-${column}`"
              :value="column"
            >
              {{ column }}
            </option>
          </select>
        </label>

        <label class="space-y-1">
          <span class="field-label">Start date (UTC)</span>
          <input
            v-model="startDate"
            class="field-input"
            type="date"
            :min="minDate"
            :max="maxDate"
          />
        </label>

        <label class="space-y-1">
          <span class="field-label">End date (UTC)</span>
          <input
            v-model="endDate"
            class="field-input"
            type="date"
            :min="minDate"
            :max="maxDate"
          />
        </label>
      </div>

      <div class="mt-5 flex flex-wrap items-center gap-3">
        <button
          class="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
          type="button"
          :disabled="isRunDisabled"
          @click="runRegression"
        >
          {{ loading ? "Running..." : "Run Beta Regression" }}
        </button>

        <span v-if="errorMessage" class="text-sm font-medium text-rose-700">{{
          errorMessage
        }}</span>
      </div>
    </section>

    <section v-if="result" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Sample count
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ result.summary.sample_count }}
        </p>
      </article>
      <article
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Predicted y @ x=0
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ formatProbability(result.summary.intercept_x0) }}
        </p>
      </article>
      <article
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Predicted y @ x=1
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ formatProbability(result.summary.intercept_x1) }}
        </p>
      </article>
      <article
        class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p
          class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
        >
          Pseudo R²
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ result.summary.pseudo_r_squared.toFixed(4) }}
        </p>
      </article>
    </section>

    <section
      v-if="result"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">Regression chart</h2>
      <p class="mt-1 text-sm text-slate-600">
        X={{ result.metadata.x_column }} and Y={{ result.metadata.y_column }}.
        Bounds are the 95% interval from the beta distribution.
      </p>
      <div
        ref="chartHost"
        class="mt-4 h-120 w-full rounded-xl border border-slate-200"
      />
    </section>

    <section
      v-if="result"
      class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6"
    >
      <h2 class="text-xl font-semibold text-slate-900">Predictions table</h2>
      <div class="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table class="min-w-full border-collapse text-sm">
          <thead>
            <tr
              class="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500"
            >
              <th class="px-3 py-2">X input</th>
              <th class="px-3 py-2">Predicted Y</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in result.predictions_at"
              :key="row.x"
              class="border-b border-slate-100"
            >
              <td class="px-3 py-2 text-slate-700">{{ row.x.toFixed(2) }}</td>
              <td class="px-3 py-2 font-semibold text-slate-900">
                {{ formatProbability(row.predicted_y) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import * as echarts from "echarts/core";
import { ScatterChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";
import {
  calculateBetaRegression,
  type BetaRegressionResponse,
} from "@/api/betaRegression";

echarts.use([
  ScatterChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

const loadedFileName = ref("");
const csvText = ref("");
const parsedRowCount = ref(0);
const numericColumns = ref<string[]>([]);
const xColumn = ref("");
const yColumn = ref("");
const minDate = ref("");
const maxDate = ref("");
const startDate = ref("");
const endDate = ref("");

const loading = ref(false);
const errorMessage = ref("");
const result = ref<BetaRegressionResponse | null>(null);

const chartHost = ref<HTMLDivElement | null>(null);
let chart: echarts.EChartsType | null = null;
const MAX_CSV_FILE_BYTES = 10 * 1024 * 1024;

function initChartIfNeeded() {
  if (!chartHost.value || chart) return;
  chart = echarts.init(chartHost.value);
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  values.push(current.trim());
  return values;
}

function extractMetadataFromCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error("CSV must include a header and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]);
  const timestampIndex = headers.findIndex(
    (header) => header === "Timestamp (UTC)",
  );
  if (timestampIndex === -1) {
    throw new Error(
      "CSV must include the 'Timestamp (UTC)' column from market export.",
    );
  }

  const filteredNumericColumns = headers.filter(
    (header) => header !== "Date (UTC)" && header !== "Timestamp (UTC)",
  );

  let minTs: number | null = null;
  let maxTs: number | null = null;

  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const tsRaw = Number(cols[timestampIndex]);
    if (!Number.isFinite(tsRaw)) continue;

    const ts = Math.floor(tsRaw);
    if (minTs === null || ts < minTs) minTs = ts;
    if (maxTs === null || ts > maxTs) maxTs = ts;
  }

  return {
    rowCount: lines.length - 1,
    headers,
    numericColumns: filteredNumericColumns,
    minTs,
    maxTs,
  };
}

function toIsoDateFromUnixSeconds(ts: number): string {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

async function handleFileChange(event: Event) {
  errorMessage.value = "";
  result.value = null;

  const target = event.target as HTMLInputElement | null;
  const file = target?.files?.[0];
  if (!file) return;

  if (file.size > MAX_CSV_FILE_BYTES) {
    csvText.value = "";
    loadedFileName.value = "";
    numericColumns.value = [];
    xColumn.value = "";
    yColumn.value = "";
    parsedRowCount.value = 0;
    minDate.value = "";
    maxDate.value = "";
    startDate.value = "";
    endDate.value = "";
    if (target) target.value = "";
    errorMessage.value =
      "CSV file is too large. Please upload a file up to 10MB.";
    return;
  }

  loadedFileName.value = file.name;
  const text = await file.text();

  try {
    const metadata = extractMetadataFromCsv(text);
    csvText.value = text;
    parsedRowCount.value = metadata.rowCount;
    numericColumns.value = metadata.numericColumns;

    xColumn.value = metadata.numericColumns[0] ?? "";
    yColumn.value =
      metadata.numericColumns[1] ?? metadata.numericColumns[0] ?? "";

    if (metadata.minTs !== null && metadata.maxTs !== null) {
      minDate.value = toIsoDateFromUnixSeconds(metadata.minTs);
      maxDate.value = toIsoDateFromUnixSeconds(metadata.maxTs);
      startDate.value = minDate.value;
      endDate.value = maxDate.value;
    } else {
      minDate.value = "";
      maxDate.value = "";
      startDate.value = "";
      endDate.value = "";
    }
  } catch (err) {
    csvText.value = "";
    numericColumns.value = [];
    xColumn.value = "";
    yColumn.value = "";
    parsedRowCount.value = 0;
    errorMessage.value =
      err instanceof Error ? err.message : "Failed to parse CSV file.";
  }
}

const isRunDisabled = computed(() => {
  if (loading.value) return true;
  if (!csvText.value.trim()) return true;
  if (!xColumn.value || !yColumn.value) return true;
  if (xColumn.value === yColumn.value) return true;
  if (startDate.value && endDate.value && endDate.value < startDate.value)
    return true;
  return false;
});

async function runRegression() {
  if (isRunDisabled.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    result.value = await calculateBetaRegression({
      csv_text: csvText.value,
      x_column: xColumn.value,
      y_column: yColumn.value,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined,
      max_scatter_points: 1800,
      grid_points: 220,
    });
  } catch (err) {
    result.value = null;
    errorMessage.value =
      err instanceof Error ? err.message : "Failed to run beta regression.";
  } finally {
    loading.value = false;
  }
}

function formatProbability(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function renderChart() {
  if (!chart || !result.value) return;

  const scatter = result.value.scatter_points.map((point) => [
    point.x,
    point.y,
  ]);
  const meanLine = result.value.regression_curve.map((point) => [
    point.x,
    point.mean,
  ]);
  const lowerLine = result.value.regression_curve.map((point) => [
    point.x,
    point.lower_95,
  ]);
  const upperLine = result.value.regression_curve.map((point) => [
    point.x,
    point.upper_95,
  ]);

  const option: EChartsOption = {
    animationDuration: 250,
    grid: {
      left: 62,
      right: 84,
      top: 52,
      bottom: 86,
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        filterMode: "none",
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
      {
        type: "inside",
        yAxisIndex: 0,
        filterMode: "none",
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        moveOnMouseWheel: true,
      },
      {
        type: "slider",
        xAxisIndex: 0,
        bottom: 18,
        height: 20,
        filterMode: "none",
      },
      {
        type: "slider",
        yAxisIndex: 0,
        orient: "vertical",
        right: 18,
        top: 52,
        width: 18,
        filterMode: "none",
      },
    ],
    legend: {
      top: 10,
      data: ["Observations", "Beta mean", "95% lower", "95% upper"],
    },
    tooltip: {
      trigger: "item",
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params;
        if (!item || !Array.isArray(item.value)) return "";
        return `${item.seriesName}<br/>x: ${Number(item.value[0]).toFixed(4)}<br/>y: ${Number(item.value[1]).toFixed(4)}`;
      },
    },
    xAxis: {
      type: "value",
      min: 0,
      max: 1,
      name: result.value.metadata.x_column,
      nameLocation: "middle",
      nameGap: 34,
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 1,
      name: result.value.metadata.y_column,
      nameLocation: "middle",
      nameGap: 40,
    },
    series: [
      {
        name: "Observations",
        type: "scatter",
        data: scatter,
        symbolSize: 5,
        itemStyle: {
          color: "#0f766e",
          opacity: 0.26,
        },
      },
      {
        name: "Beta mean",
        type: "line",
        data: meanLine,
        showSymbol: false,
        lineStyle: {
          color: "#dc2626",
          width: 2.2,
        },
      },
      {
        name: "95% lower",
        type: "line",
        data: lowerLine,
        showSymbol: false,
        lineStyle: {
          color: "#f59e0b",
          width: 1.4,
          type: "dashed",
        },
      },
      {
        name: "95% upper",
        type: "line",
        data: upperLine,
        showSymbol: false,
        lineStyle: {
          color: "#f59e0b",
          width: 1.4,
          type: "dashed",
        },
      },
    ],
  };

  chart.setOption(option, {
    notMerge: true,
    lazyUpdate: true,
  });
}

onMounted(() => {
  const state = history.state as Record<string, unknown> | null;
  if (state && typeof state.csvText === "string" && state.csvText.trim()) {
    try {
      const metadata = extractMetadataFromCsv(state.csvText);
      csvText.value = state.csvText;
      loadedFileName.value = "From Polymarket Analytics";
      parsedRowCount.value = metadata.rowCount;
      numericColumns.value = metadata.numericColumns;
      xColumn.value =
        typeof state.xColumn === "string" &&
        metadata.numericColumns.includes(state.xColumn)
          ? state.xColumn
          : (metadata.numericColumns[0] ?? "");
      yColumn.value =
        typeof state.yColumn === "string" &&
        metadata.numericColumns.includes(state.yColumn)
          ? state.yColumn
          : (metadata.numericColumns[1] ?? metadata.numericColumns[0] ?? "");
      if (metadata.minTs !== null && metadata.maxTs !== null) {
        minDate.value = toIsoDateFromUnixSeconds(metadata.minTs);
        maxDate.value = toIsoDateFromUnixSeconds(metadata.maxTs);
        startDate.value = minDate.value;
        endDate.value = maxDate.value;
      }
    } catch {
      // Silently ignore malformed state
    }
  }

  const onResize = () => chart?.resize();
  window.addEventListener("resize", onResize);

  initChartIfNeeded();

  onUnmounted(() => {
    window.removeEventListener("resize", onResize);
    chart?.dispose();
    chart = null;
  });
});

watch(result, async () => {
  await nextTick();
  initChartIfNeeded();
  renderChart();
  chart?.resize();
});
</script>

<style scoped>
.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: rgb(100 116 139);
}

.field-input {
  height: 2.5rem;
  width: 100%;
  border-radius: 0.75rem;
  border: 1px solid rgb(203 213 225);
  background-color: rgb(255 255 255);
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  font-size: 0.875rem;
  color: rgb(15 23 42);
  outline: none;
  align-content: center;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.field-input:focus {
  border-color: rgb(148 163 184);
  box-shadow: 0 0 0 2px rgb(226 232 240);
}
</style>
