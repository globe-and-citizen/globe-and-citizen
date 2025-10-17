// src/api/latency.ts
import { API_BASE_URL } from "@/api/constants";
import { interceptorFetch } from "@/api/auth";
import { toast, type ToastOptions } from "vue3-toastify";

export interface LatencyResult {
  request: number;
  sizeInKB: number;
  latency: number | null;
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
        body: JSON.stringify({ data: payload }),
      });

      const end = performance.now();
      const latency = Number((end - start).toFixed(2));
      console.log(`Request ${i + 1}: ${sizeInKB}KB - ${latency} ms`);
      results.push({ request: i + 1, sizeInKB, latency });
    } catch (error) {
      console.error(`Request ${i + 1} failed:`, error);
      results.push({ request: i + 1, sizeInKB, latency: null });
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
