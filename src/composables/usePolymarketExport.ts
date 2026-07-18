import { ref, type Ref } from "vue";
import { buildAlignedPolymarketCsv } from "@/lib/polymarketCsv";
import type { ScatterSeries } from "@/components/Charts/PriceScatterChart.vue";
import {
  buildSafeCsvFilename,
  queueTextFileForNotebooks,
  syncQueuedNotebookFilesToJupyterLite,
} from "@/composables/jupyterLiteStorage";

export function downloadPolymarketCsv(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function normalizePolymarketCsvFilename(
  input: string,
  fallback: string,
): string {
  const candidate = input.trim() || fallback;
  const filename = candidate.split(/[/\\]/).pop() ?? "";
  const base = filename.replace(/\.csv$/i, "").trim();
  if (!base) throw new Error("Filename cannot be empty.");
  return buildSafeCsvFilename(base);
}

export function createPolymarketGenerationGuard<T extends object>() {
  const promises = new WeakMap<T, Promise<boolean>>();
  return (
    target: T,
    generate: () => Promise<boolean>,
  ): Promise<boolean> => {
    const existing = promises.get(target);
    if (existing) return existing;
    const pending = generate();
    promises.set(target, pending);
    void pending.finally(() => {
      if (promises.get(target) === pending) promises.delete(target);
    });
    return pending;
  };
}

export function usePolymarketNotebookExport() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const successPath = ref("");

  async function save(
    series: Ref<ScatterSeries[]> | ScatterSeries[],
    filename: string,
  ): Promise<boolean> {
    if (loading.value) return false;
    loading.value = true;
    error.value = null;
    successPath.value = "";

    try {
      const data = Array.isArray(series) ? series : series.value;
      const path = `data/${buildSafeCsvFilename(filename.replace(/\.csv$/i, ""))}`;
      await queueTextFileForNotebooks({
        path,
        content: buildAlignedPolymarketCsv(data),
        mimetype: "text/csv",
      });
      const sync = await syncQueuedNotebookFilesToJupyterLite();
      successPath.value = sync.skippedBecauseNotInitialized
        ? `${path} (queued)`
        : path;
      return true;
    } catch (cause) {
      console.error("Failed to save Polymarket data to JupyterLite:", cause);
      error.value =
        cause instanceof Error ? cause.message : "Failed to save to notebooks.";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function reset() {
    loading.value = false;
    error.value = null;
    successPath.value = "";
  }

  return { loading, error, successPath, save, reset };
}
