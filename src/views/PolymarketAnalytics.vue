<template>
  <div class="w-full min-w-0 space-y-6">
    <section
      class="rounded-[28px] border border-slate-200 bg-white/90 shadow-sm overflow-hidden"
    >
      <div
        class="border-b border-slate-200 bg-[linear-gradient(135deg,#fff7ed,transparent_55%),linear-gradient(180deg,#ffffff,#f8fafc)] px-6 py-6 md:px-8"
      >
        <div
          class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"
        >
          <div class="max-w-3xl space-y-3">
            <div
              class="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              <span>Polymarket Analytics</span>
              <span class="h-px w-12 bg-slate-300" />
              <span>Market Insights</span>
            </div>
            <div class="space-y-2">
              <h1
                class="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl"
              >
                Build charts, export price history, and queue notebook data from
                the start.
              </h1>
              <p
                class="max-w-2xl text-sm leading-6 text-slate-600 md:text-base"
              >
                The analytics page now opens directly into the Market Insights
                workspace. Paste a market URL or use the search modal to add
                markets, compare them, export CSVs, and send JSON payloads to
                JupyterLite.
              </p>
            </div>
          </div>

          <div
            class="grid gap-3 text-sm text-slate-600 sm:grid-cols-3 xl:min-w-[420px]"
          >
            <div
              class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
            >
              <div
                class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Entry Points
              </div>
              <div class="mt-2 font-medium text-slate-900">
                Paste URL or search
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
            >
              <div
                class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Output
              </div>
              <div class="mt-2 font-medium text-slate-900">
                Charts and CSV export
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
            >
              <div
                class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Notebook Flow
              </div>
              <div class="mt-2 font-medium text-slate-900">
                Queue directly to JupyterLite
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 py-4 md:px-6 md:py-6 xl:px-8">
        <PolymarketAlertWizardModal
          :is-open="true"
          variant="insights"
          embedded
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import PolymarketAlertWizardModal from "@/components/PolymarketAlertWizardModal.vue";
</script>
