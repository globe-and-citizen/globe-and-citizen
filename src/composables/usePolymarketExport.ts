import { buildSafeCsvFilename } from "@/composables/jupyterLiteStorage";

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
