import { ref } from "vue";
import {
  queueTextFileForNotebooks,
  syncQueuedNotebookFilesToJupyterLite,
} from "@/composables/jupyterLiteStorage";

export function useNotebookSave() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const successPath = ref("");

  async function save(
    path: string,
    content: string,
    mimetype: string,
  ): Promise<boolean> {
    if (loading.value) return false;
    loading.value = true;
    error.value = null;
    successPath.value = "";

    try {
      await queueTextFileForNotebooks({ path, content, mimetype });
      const sync = await syncQueuedNotebookFilesToJupyterLite();
      successPath.value = sync.skippedBecauseNotInitialized
        ? `${path} (queued)`
        : path;
      return true;
    } catch (cause) {
      console.error("Failed to save data to JupyterLite:", cause);
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
