// src/api/latency.ts
import {API_BASE_URL, POSTS_URL} from "@/api/constants";
import {interceptorFetch} from "@/api/auth";
import {toast, type ToastOptions} from "vue3-toastify";

export interface LatencyResult {
  request: number;
  sizeInKB: number;
  latency: number | null;
  status?: number;
}

export async function runLatencyTest(): Promise<LatencyResult[]> {
  console.log("🔍 Starting latency test...");
  toast("Test started", {
    autoClose: 2000,
    type: "info",
    position: toast.POSITION.BOTTOM_RIGHT,
  } as ToastOptions);

  const results: LatencyResult[] = [];

  for (let i = 0; i < 10; i++) {
    const sizeInKB = Math.floor(Math.random() * 100) + 1;
    const payload = "x".repeat(sizeInKB * 1024);
    const start = performance.now();

    try {
      await interceptorFetch(`${API_BASE_URL}/latency-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({data: payload}),
      });

      const end = performance.now();
      const latency = Number((end - start).toFixed(2));
      console.log(`Request ${i + 1}: ${sizeInKB}KB - ${latency} ms`);
      results.push({request: i + 1, sizeInKB, latency});
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error);
      results.push({request: i + 1, sizeInKB, latency: null});
    }
  }

  toast("Test completed. See logs", {
    autoClose: 3000,
    type: "success",
    position: toast.POSITION.BOTTOM_RIGHT,
  } as ToastOptions);

  const validResults = results.filter((r) => r.latency !== null);
  const totalLatency = validResults.reduce(
    (sum, r) => sum + (r.latency ?? 0),
    0
  );
  const totalSize = validResults.reduce((sum, r) => sum + r.sizeInKB, 0);

  const avgLatencyPer10KB =
    totalSize > 0 ? ((totalLatency / totalSize) * 10).toFixed(2) : "N/A";

  console.log("✅ Latency check completed. Results:", results);
  console.log(`📊 Average latency: ${avgLatencyPer10KB} ms per 10KB`);

  return results;
}


export interface LatencySummary {
  count: number;
  min: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
  average: number;
}

const WARMUP_REQUESTS = 5;
const MEASUREMENT_REQUESTS = 100;

// Retry policy: a failed request is retried up to MAX_RETRIES times
// (so up to MAX_RETRIES + 1 attempts in total). If it still fails,
// the whole test is aborted and no report is produced, so we never
// publish numbers from a run that had missing samples.
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500; // multiplied by the attempt number (linear backoff)

// Use fixed sizes so results are comparable between runs.
const PAYLOAD_SIZES_KB = [1, 10, 50, 100];

// --------------------------------------------------
// Retry helpers
// --------------------------------------------------

class LatencyTestAbortedError extends Error {
  readonly lastError: unknown;

  constructor(message: string, lastError: unknown) {
    super(message);
    this.name = "LatencyTestAbortedError";
    this.lastError = lastError;
  }
}

interface RetryCounter {
  retries: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Runs `fn` and retries on failure. The latency timer lives inside `fn`,
 * so only the successful attempt is ever measured (failed attempts and
 * the backoff delay never leak into the statistics).
 * Throws LatencyTestAbortedError once all retries are exhausted.
 */
async function withRetry<T>(
  label: string,
  counter: RetryCounter,
  fn: () => Promise<T>
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES) {
        counter.retries++;
        console.warn(
          `${label} failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying...`,
          error
        );
        await sleep(RETRY_DELAY_MS * (attempt + 1));
      }
    }
  }

  throw new LatencyTestAbortedError(
    `${label} failed after ${MAX_RETRIES} retries`,
    lastError
  );
}

/**
 * Wraps a test run: on abort it notifies the user, discards partial
 * data (no report/download) and returns null so the test can be re-run.
 */
async function runGuarded<T>(
  testName: string,
  run: () => Promise<T>
): Promise<T | null> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof LatencyTestAbortedError) {
      console.error(
        `❌ ${testName} aborted: ${error.message}. Results are discarded, please re-run the test.`,
        error.lastError
      );

      toast(`${testName} aborted: ${error.message}. Please re-run.`, {
        autoClose: 5000,
        type: "error",
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);

      return null;
    }

    throw error; // unexpected error, don't hide it
  }
}

// --------------------------------------------------
// Payload / statistics helpers
// --------------------------------------------------

function generateRandomBytes(sizeInBytes: number): Uint8Array {
  const bytes = new Uint8Array(sizeInBytes);
  const MAX_CHUNK = 65536; // crypto.getRandomValues limit per call

  for (let offset = 0; offset < sizeInBytes; offset += MAX_CHUNK) {
    const end = Math.min(offset + MAX_CHUNK, sizeInBytes);
    crypto.getRandomValues(bytes.subarray(offset, end));
  }

  return bytes;
}

function generateRandomPayload(sizeInKB: number): string {
  const sizeInBytes = sizeInKB * 1024;
  const bytes = generateRandomBytes(sizeInBytes);
  return btoa(String.fromCharCode(...bytes));
}

function getPercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;

  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

function summarize(latencies: number[]): LatencySummary {
  if (latencies.length === 0) {
    throw new Error("No successful requests to summarize");
  }

  const sorted = [...latencies].sort((a, b) => a - b);

  const average =
    latencies.reduce((sum, latency) => sum + latency, 0) /
    latencies.length;

  return {
    count: latencies.length,
    min: sorted[0],
    p50: getPercentile(sorted, 50),
    p95: getPercentile(sorted, 95),
    p99: getPercentile(sorted, 99),
    max: sorted[sorted.length - 1],
    average,
  };
}

// --------------------------------------------------
// POST test
// --------------------------------------------------

async function sendPOSTLatencyRequest(payload: string): Promise<{
  latency: number;
  status: number;
}> {
  const start = performance.now();

  const response = await interceptorFetch(
    `${API_BASE_URL}/latency-test`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({data: payload}),
    }
  );

  // Ensure the entire response has been received before stopping the timer.
  await response.arrayBuffer();

  const latency = performance.now() - start;

  // A non-2xx response is a failure, not a valid latency sample.
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return {
    latency,
    status: response.status,
  };
}

async function executePOSTLatencyTest() {
  console.log("🔍 Starting POST latency test...");
  const startPostTest = performance.now();
  const totalRetries: RetryCounter = {retries: 0};

  toast("Latency test started", {
    autoClose: 2000,
    type: "info",
    position: toast.POSITION.BOTTOM_RIGHT,
  } as ToastOptions);

  const tableResults: Array<{
    payload: string;
    p50: number;
    p95: number;
    average: number;
    min: number;
    p99: number;
    max: number;
    successful: number;
    retries: number;
  }> = [];

  for (const sizeInKB of PAYLOAD_SIZES_KB) {
    console.log(`📦 Payload size: ${sizeInKB} KB`);

    const sizeRetries: RetryCounter = {retries: 0};
    const payload = generateRandomPayload(sizeInKB);

    // --------------------------------------------------
    // Warm-up
    // --------------------------------------------------

    console.log(`🔥 Warming up with ${WARMUP_REQUESTS} requests...`);

    for (let i = 0; i < WARMUP_REQUESTS; i++) {
      await withRetry(
        `Warm-up request ${i + 1}/${WARMUP_REQUESTS} (${sizeInKB} KB)`,
        sizeRetries,
        () => sendPOSTLatencyRequest(payload)
      );
    }

    // --------------------------------------------------
    // Measurement
    // --------------------------------------------------

    console.log(`📊 Measuring ${MEASUREMENT_REQUESTS} requests...`);

    const latencies: number[] = [];

    for (let i = 0; i < MEASUREMENT_REQUESTS; i++) {
      const {latency} = await withRetry(
        `Request ${i + 1}/${MEASUREMENT_REQUESTS} (${sizeInKB} KB)`,
        sizeRetries,
        () => sendPOSTLatencyRequest(payload)
      );

      latencies.push(Number(latency.toFixed(2)));
    }

    // --------------------------------------------------
    // Statistics
    // --------------------------------------------------

    const summary = summarize(latencies);
    totalRetries.retries += sizeRetries.retries;

    tableResults.push({
      payload: `${sizeInKB} KB`,
      p50: summary.p50,
      p95: summary.p95,
      average: summary.average,
      min: summary.min,
      p99: summary.p99,
      max: summary.max,
      successful: latencies.length,
      retries: sizeRetries.retries,
    });
  }

  // --------------------------------------------------
  // Final report
  // --------------------------------------------------

  console.log("");
  console.log("📊 POST LATENCY TEST RESULTS");

  // Detailed statistics, if needed
  console.log("📊 Detailed statistics:");
  console.table(
    tableResults.map((result) => ({
      "Payload": result.payload,
      "Min (ms)": result.min.toFixed(2),
      "P50 (ms)": result.p50.toFixed(2),
      "Avg (ms)": result.average.toFixed(2),
      "P95 (ms)": result.p95.toFixed(2),
      "P99 (ms)": result.p99.toFixed(2),
      "Max (ms)": result.max.toFixed(2),
      "Success": result.successful,
      "Retries": result.retries,
    }))
  );

  console.log("========================================");

  toast("Latency test completed. See console for results.", {
    autoClose: 3000,
    type: "success",
    position: toast.POSITION.BOTTOM_RIGHT,
  } as ToastOptions);

  // Export for offline old-vs-new diffing
  const report = {
    version: import.meta.env.VITE_APP_VERSION,
    testType: "POST",
    endpoint: "/latency-test",
    payloadSizes: PAYLOAD_SIZES_KB,
    timestamp: new Date().toISOString(),
    duration: `${(performance.now() - startPostTest) / 60000} min`,
    maxRetriesPerRequest: MAX_RETRIES,
    totalRetries: totalRetries.retries,
    results: tableResults,
    timeUnit: "ms",
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `post-latency-v.${import.meta.env.VITE_APP_VERSION}-${Date.now()}.json`;
  a.click();

  return report;
}

/** Returns the report, or null if the test was aborted (re-run it). */
export function runPOSTLatencyTest() {
  return runGuarded("POST latency test", executePOSTLatencyTest);
}

// --------------------------------------------------
// GET test
// --------------------------------------------------

const GET_PAGE_SIZES = [10, 20]; // items per page, analog of PAYLOAD_SIZES_KB
const FIXED_PAGE = 1; // keep page constant so dataset offset doesn't vary latency independent of your fix

async function sendGETLatencyRequest(size: number): Promise<{
  latency: number;
  status: number;
  responseBytes: number;
}> {
  const start = performance.now();

  const response = await interceptorFetch(
    `${API_BASE_URL}${POSTS_URL}?size=${size}&page=${FIXED_PAGE}`,
    {
      method: "GET",
      cache: "no-store", // bypass browser cache so we measure real backend latency, not a cache hit
    }
  );

  const text = await response.text(); // read full body before stopping the timer, same principle as POST test
  const latency = performance.now() - start;

  // A non-2xx response is a failure, not a valid latency sample.
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const responseBytes = new Blob([text]).size;

  return {
    latency,
    status: response.status,
    responseBytes,
  };
}

async function executeGETLatencyTest() {
  console.log("🔍 Starting GET latency test (fetchAllPosts)...");
  const startGetTest = performance.now();
  const totalRetries: RetryCounter = {retries: 0};

  toast("GET latency test started", {
    autoClose: 2000,
    type: "info",
    position: toast.POSITION.BOTTOM_RIGHT,
  } as ToastOptions);

  const tableResults: Array<{
    pageSize: number;
    p50: number;
    p95: number;
    average: number;
    min: number;
    p99: number;
    max: number;
    avgResponseKB: number;
    successful: number;
    retries: number;
  }> = [];

  for (const size of GET_PAGE_SIZES) {
    console.log(`📄 Page size: ${size} items`);

    const sizeRetries: RetryCounter = {retries: 0};

    // --------------------------------------------------
    // Warm-up
    // --------------------------------------------------

    console.log(`🔥 Warming up with ${WARMUP_REQUESTS} requests...`);

    for (let i = 0; i < WARMUP_REQUESTS; i++) {
      await withRetry(
        `Warm-up request ${i + 1}/${WARMUP_REQUESTS} (size=${size})`,
        sizeRetries,
        () => sendGETLatencyRequest(size)
      );
    }

    // --------------------------------------------------
    // Measurement
    // --------------------------------------------------

    console.log(`📊 Measuring ${MEASUREMENT_REQUESTS} requests...`);

    const latencies: number[] = [];
    const responseSizes: number[] = [];

    for (let i = 0; i < MEASUREMENT_REQUESTS; i++) {
      const {latency, responseBytes} = await withRetry(
        `Request ${i + 1}/${MEASUREMENT_REQUESTS} (size=${size})`,
        sizeRetries,
        () => sendGETLatencyRequest(size)
      );

      latencies.push(Number(latency.toFixed(2)));
      responseSizes.push(responseBytes);
    }

    // --------------------------------------------------
    // Statistics
    // --------------------------------------------------

    const summary = summarize(latencies);
    const avgResponseKB =
      responseSizes.reduce((sum, b) => sum + b, 0) / responseSizes.length / 1024;

    totalRetries.retries += sizeRetries.retries;

    tableResults.push({
      pageSize: size,
      p50: summary.p50,
      p95: summary.p95,
      average: summary.average,
      min: summary.min,
      p99: summary.p99,
      max: summary.max,
      avgResponseKB,
      successful: latencies.length,
      retries: sizeRetries.retries,
    });
  }

  // --------------------------------------------------
  // Final report
  // --------------------------------------------------

  console.log("");
  console.log("📊 GET LATENCY TEST RESULTS (fetchAllPosts)");

  console.table(
    tableResults.map((result) => ({
      "Page Size": result.pageSize,
      "Avg Resp (KB)": result.avgResponseKB.toFixed(2),
      "Min (ms)": result.min.toFixed(2),
      "P50 (ms)": result.p50.toFixed(2),
      "Avg (ms)": result.average.toFixed(2),
      "P95 (ms)": result.p95.toFixed(2),
      "P99 (ms)": result.p99.toFixed(2),
      "Max (ms)": result.max.toFixed(2),
      "Success": result.successful,
      "Retries": result.retries,
    }))
  );

  console.log("========================================");

  toast("GET latency test completed. See console for results.", {
    autoClose: 3000,
    type: "success",
    position: toast.POSITION.BOTTOM_RIGHT,
  } as ToastOptions);

  // Export for offline old-vs-new diffing, same pattern as discussed for POST
  const report = {
    version: import.meta.env.VITE_APP_VERSION,
    testType: "GET",
    endpoint: POSTS_URL,
    fixedPage: FIXED_PAGE,
    timestamp: new Date().toISOString(),
    duration: `${(performance.now() - startGetTest) / 60000} min`,
    maxRetriesPerRequest: MAX_RETRIES,
    totalRetries: totalRetries.retries,
    results: tableResults,
    timeUnit: "ms",
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `get-latency-v.${import.meta.env.VITE_APP_VERSION}-${Date.now()}.json`;
  a.click();

  return report;
}

/** Returns the report, or null if the test was aborted (re-run it). */
export function runGETLatencyTest() {
  return runGuarded("GET latency test", executeGETLatencyTest);
}
