export type JupyterLiteFileEntry = {
  name: string;
  path: string;
  last_modified: string;
  created: string;
  format: "text";
  mimetype: string;
  type: "file";
  writable: true;
  size: number;
  content: string;
  contentProviderId?: string;
};

type NotebookBridgeQueuedFile = JupyterLiteFileEntry & {
  queued_at: string;
};

const NOTEBOOK_BRIDGE_DB_NAME = "CF Notebook Bridge";
const NOTEBOOK_BRIDGE_DB_VERSION = 1;
const NOTEBOOK_BRIDGE_STORE = "queued_files";

function ensureTrailingSlash(pathname: string): string {
  const p = (pathname ?? "").trim();
  if (!p) return "/";
  return p.endsWith("/") ? p : `${p}/`;
}

function normalizeRelativeFilePath(path: string): string {
  const p = (path ?? "").trim();
  if (!p) throw new Error("Missing file path");
  return p.replace(/^\/+/, "");
}

function inferJupyterLiteBasePath(baseUrl: string): string {
  const raw = (baseUrl ?? "").trim();

  if (!raw) return "/jupyterlite/";

  if (raw.startsWith("/")) return ensureTrailingSlash(raw);

  // Absolute URL
  const url = new URL(raw);
  if (url.origin !== window.location.origin) {
    throw new Error(
      `JupyterLite must be hosted on the same origin to write its IndexedDB. Set VITE_JUPYTERLITE_BASE_URL to a same-origin path like /demo (current: ${url.origin}).`,
    );
  }
  return ensureTrailingSlash(url.pathname);
}

function getJupyterLiteDbName(basePath: string): string {
  return `JupyterLite Storage - ${ensureTrailingSlash(basePath)}`;
}

async function openNotebookBridgeDb(): Promise<IDBDatabase> {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(
      NOTEBOOK_BRIDGE_DB_NAME,
      NOTEBOOK_BRIDGE_DB_VERSION,
    );

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(NOTEBOOK_BRIDGE_STORE)) {
        db.createObjectStore(NOTEBOOK_BRIDGE_STORE, { keyPath: "path" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB error"));
  });
}

async function openExistingJupyterLiteDb(dbName: string): Promise<IDBDatabase> {
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    // If this fires, the DB didn't exist (or version upgrade is needed).
    // We explicitly do NOT want to create/duplicate JupyterLite's DB.
    request.onupgradeneeded = () => {
      request.transaction?.abort();
      reject(new Error("JupyterLite storage is not initialized yet."));
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB error"));
  });
}

async function doesIndexedDbDatabaseExist(dbName: string): Promise<boolean> {
  // `indexedDB.databases()` is supported in modern Chromium/Firefox.
  // If unavailable, we can't reliably check without opening (which may create).
  const anyIdb = indexedDB as unknown as {
    databases?: () => Promise<Array<{ name?: string }>>;
  };

  if (typeof anyIdb.databases === "function") {
    const dbs = await anyIdb.databases();
    return dbs.some((d) => d?.name === dbName);
  }

  // Fallback: attempt to open without creating JupyterLite's schema.
  // If the DB doesn't exist, `onupgradeneeded` fires and we abort.
  try {
    const db = await openExistingJupyterLiteDb(dbName);
    db.close();
    return true;
  } catch {
    return false;
  }
}

export type SaveToJupyterLiteOptions = {
  /** JupyterLite base URL, e.g. `/demo` or `https://my-site.com/demo` */
  jupyterLiteBaseUrl?: string;
  /** Relative file path inside JupyterLite, e.g. `data/TestJson.json` */
  path: string;
  /** File content (text) */
  content: string;
  mimetype?: string;
};

export type QueueToNotebooksResult = {
  queued: NotebookBridgeQueuedFile;
};

export async function queueTextFileForNotebooks(
  options: SaveToJupyterLiteOptions,
): Promise<QueueToNotebooksResult> {
  if (typeof window === "undefined") {
    throw new Error("queueTextFileForNotebooks can only run in the browser");
  }

  const nowIso = new Date().toISOString();
  const path = normalizeRelativeFilePath(options.path);
  const name = path.split("/").pop() || "data.json";
  const content = options.content ?? "";
  const mimetype = options.mimetype ?? "text/plain";
  const size = new Blob([content]).size;

  const entry: NotebookBridgeQueuedFile = {
    name,
    path,
    last_modified: nowIso,
    created: nowIso,
    format: "text",
    mimetype,
    type: "file",
    writable: true,
    size,
    content,
    contentProviderId: undefined,
    queued_at: nowIso,
  };

  const db = await openNotebookBridgeDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([NOTEBOOK_BRIDGE_STORE], "readwrite");
      const store = tx.objectStore(NOTEBOOK_BRIDGE_STORE);
      store.put(entry);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB tx error"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB tx aborted"));
    });
    return { queued: entry };
  } finally {
    db.close();
  }
}

export type SyncToJupyterLiteResult = {
  attempted: number;
  synced: number;
  skippedBecauseNotInitialized: boolean;
};

export async function syncQueuedNotebookFilesToJupyterLite(
  jupyterLiteBaseUrl?: string,
): Promise<SyncToJupyterLiteResult> {
  if (typeof window === "undefined") {
    throw new Error(
      "syncQueuedNotebookFilesToJupyterLite can only run in the browser",
    );
  }

  const baseUrl =
    jupyterLiteBaseUrl ??
    (import.meta.env.VITE_JUPYTERLITE_BASE_URL as string | undefined) ??
    "/jupyterlite";
  const basePath = inferJupyterLiteBasePath(baseUrl);
  const jupyterDbName = getJupyterLiteDbName(basePath);
  const exists = await doesIndexedDbDatabaseExist(jupyterDbName);

  if (!exists) {
    return { attempted: 0, synced: 0, skippedBecauseNotInitialized: true };
  }

  const bridgeDb = await openNotebookBridgeDb();
  let queued: NotebookBridgeQueuedFile[] = [];
  try {
    queued = await new Promise<NotebookBridgeQueuedFile[]>(
      (resolve, reject) => {
        const tx = bridgeDb.transaction([NOTEBOOK_BRIDGE_STORE], "readonly");
        const store = tx.objectStore(NOTEBOOK_BRIDGE_STORE);
        const req = store.getAll();
        req.onsuccess = () =>
          resolve((req.result ?? []) as NotebookBridgeQueuedFile[]);
        req.onerror = () =>
          reject(req.error ?? new Error("IndexedDB read error"));
      },
    );
  } finally {
    bridgeDb.close();
  }

  if (queued.length === 0) {
    return { attempted: 0, synced: 0, skippedBecauseNotInitialized: false };
  }

  const jupyterDb = await openExistingJupyterLiteDb(jupyterDbName);
  try {
    if (!jupyterDb.objectStoreNames.contains("files")) {
      throw new Error("JupyterLite storage schema missing 'files' store.");
    }

    await new Promise<void>((resolve, reject) => {
      const tx = jupyterDb.transaction(["files"], "readwrite");
      const store = tx.objectStore("files");
      for (const f of queued) {
        const entry = { ...f } as Record<string, unknown>;
        delete entry.queued_at;

        // JupyterLite's `files` store may use out-of-line keys (no keyPath + no key generator).
        // In that case, we must provide the key explicitly.
        const keyPath = store.keyPath;
        const hasInlineKey =
          keyPath !== null &&
          keyPath !== undefined &&
          !(typeof keyPath === "string" && keyPath.length === 0);

        if (hasInlineKey || store.autoIncrement) {
          store.put(entry as unknown as JupyterLiteFileEntry);
        } else {
          store.put(entry as unknown as JupyterLiteFileEntry, f.path);
        }
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB tx error"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB tx aborted"));
    });
  } finally {
    jupyterDb.close();
  }

  // Only clear the queue after successful write.
  const bridgeDb2 = await openNotebookBridgeDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = bridgeDb2.transaction([NOTEBOOK_BRIDGE_STORE], "readwrite");
      const store = tx.objectStore(NOTEBOOK_BRIDGE_STORE);
      for (const f of queued) {
        store.delete(f.path);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB tx error"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB tx aborted"));
    });
  } finally {
    bridgeDb2.close();
  }

  return {
    attempted: queued.length,
    synced: queued.length,
    skippedBecauseNotInitialized: false,
  };
}

export function buildSafeJsonFilename(base: string): string {
  const raw = (base ?? "").trim() || "data";
  const safe = raw
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safe || "data"}.json`;
}
