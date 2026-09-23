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

// Use fixed sizes so results are comparable between runs.
const PAYLOAD_SIZES_KB = [1, 100];

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

  return {
    latency,
    status: response.status,
  };
}

export async function runPOSTLatencyTest() {
  console.log("🔍 Starting POST latency test...");

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
    failed: number;
  }> = [];

  for (const sizeInKB of PAYLOAD_SIZES_KB) {
    console.log(`📦 Payload size: ${sizeInKB} KB`);

    // --------------------------------------------------
    // Warm-up
    // --------------------------------------------------

    console.log(
      `🔥 Warming up with ${WARMUP_REQUESTS} requests...`
    );

    const payload = generateRandomPayload(sizeInKB);

    for (let i = 0; i < WARMUP_REQUESTS; i++) {
      try {
        await sendPOSTLatencyRequest(payload);
      } catch (error) {
        console.warn(
          `Warm-up request ${i + 1} failed`,
          error
        );
      }
    }

    // --------------------------------------------------
    // Measurement
    // --------------------------------------------------

    console.log(
      `📊 Measuring ${MEASUREMENT_REQUESTS} requests...`
    );

    const results: LatencyResult[] = [];

    for (let i = 0; i < MEASUREMENT_REQUESTS; i++) {
      try {
        const { latency, status } =
          await sendPOSTLatencyRequest(payload);

        results.push({
          request: i + 1,
          sizeInKB,
          latency: Number(latency.toFixed(2)),
          status,
        });
      } catch (error) {
        console.error(
          `Request ${i + 1}/${MEASUREMENT_REQUESTS} failed:`,
          error
        );

        results.push({
          request: i + 1,
          sizeInKB,
          latency: null,
        });
      }
    }

    // --------------------------------------------------
    // Statistics
    // --------------------------------------------------

    const validLatencies = results
      .map((result) => result.latency)
      .filter((latency): latency is number => latency !== null);

    const failed = results.length - validLatencies.length;

    if (validLatencies.length === 0) {
      console.error(
        `❌ All requests failed for ${sizeInKB} KB`
      );
      continue;
    }

    const summary = summarize(validLatencies);

    tableResults.push({
      payload: `${sizeInKB} KB`,
      p50: summary.p50,
      p95: summary.p95,
      average: summary.average,
      min: summary.min,
      p99: summary.p99,
      max: summary.max,
      successful: validLatencies.length,
      failed,
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
      "Failed": result.failed,
    }))
  );

  console.log("========================================");

  toast("Latency test completed. See console for results.", {
    autoClose: 3000,
    type: "success",
    position: toast.POSITION.BOTTOM_RIGHT,
  } as ToastOptions);

  // return tableResults;

  // Export for offline old-vs-new diffing
  const report = {
    version: import.meta.env.VITE_APP_VERSION,
    testType: "POST",
    endpoint: "/latency-test",
    payloadSizes: PAYLOAD_SIZES_KB,
    timestamp: new Date().toISOString(),
    results: tableResults,
    timeUnit: "ms",
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `post-latency-v.${import.meta.env.VITE_APP_VERSION}-${Date.now()}.json`;
  a.click();

  return report;
}


const GET_PAGE_SIZES = [10, 20]; // items per page, analog of PAYLOAD_SIZES_KB
const FIXED_PAGE = 1; // keep page constant so dataset offset doesn't vary latency independent of your fix

interface GETLatencyResult {
  request: number;
  pageSize: number;
  latency: number | null;
  responseBytes: number | null;
  status: number | null;
}

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
      headers: {
        "Content-Type": "Application/Json",
      },
      cache: "no-store", // bypass browser cache so we measure real backend latency, not a cache hit
    }
  );

  const text = await response.text(); // read full body before stopping the timer, same principle as POST test
  const latency = performance.now() - start;
  const responseBytes = new Blob([text]).size;

  return {
    latency,
    status: response.status,
    responseBytes,
  };
}

export async function runGETLatencyTest() {
  console.log("🔍 Starting GET latency test (fetchAllPosts)...");

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
    failed: number;
  }> = [];

  for (const size of GET_PAGE_SIZES) {
    console.log(`📄 Page size: ${size} items`);

    // --------------------------------------------------
    // Warm-up
    // --------------------------------------------------

    console.log(`🔥 Warming up with ${WARMUP_REQUESTS} requests...`);

    for (let i = 0; i < WARMUP_REQUESTS; i++) {
      try {
        await sendGETLatencyRequest(size);
      } catch (error) {
        console.warn(`Warm-up request ${i + 1} failed`, error);
      }
    }

    // --------------------------------------------------
    // Measurement
    // --------------------------------------------------

    console.log(`📊 Measuring ${MEASUREMENT_REQUESTS} requests...`);

    const results: GETLatencyResult[] = [];

    for (let i = 0; i < MEASUREMENT_REQUESTS; i++) {
      try {
        const { latency, status, responseBytes } = await sendGETLatencyRequest(size);

        results.push({
          request: i + 1,
          pageSize: size,
          latency: Number(latency.toFixed(2)),
          responseBytes,
          status,
        });
      } catch (error) {
        console.error(`Request ${i + 1}/${MEASUREMENT_REQUESTS} failed:`, error);

        results.push({
          request: i + 1,
          pageSize: size,
          latency: null,
          responseBytes: null,
          status: null,
        });
      }
    }

    // --------------------------------------------------
    // Statistics
    // --------------------------------------------------

    const validLatencies = results
      .map((r) => r.latency)
      .filter((l): l is number => l !== null);

    const validBytes = results
      .map((r) => r.responseBytes)
      .filter((b): b is number => b !== null);

    const failed = results.length - validLatencies.length;

    if (validLatencies.length === 0) {
      console.error(`❌ All requests failed for size=${size}`);
      continue;
    }

    const summary = summarize(validLatencies);
    const avgResponseKB =
      validBytes.reduce((sum, b) => sum + b, 0) / validBytes.length / 1024;

    tableResults.push({
      pageSize: size,
      p50: summary.p50,
      p95: summary.p95,
      average: summary.average,
      min: summary.min,
      p99: summary.p99,
      max: summary.max,
      avgResponseKB,
      successful: validLatencies.length,
      failed,
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
      "Failed": result.failed,
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
    results: tableResults,
    timeUnit: "ms",
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `get-latency-v.${import.meta.env.VITE_APP_VERSION}-${Date.now()}.json`;
  a.click();

  return report;
}
