import type { PolymarketPriceHistoryPoint } from "@/api/polymarket";

export type PolymarketExportFrequency =
  | "minutely"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly";

export function formatIsoTodayUtc(): string {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isBeforeIsoDate(a: string, b: string): boolean {
  const left = a.trim();
  const right = b.trim();
  return Boolean(left && right && left < right);
}

export function unixSecondsFromDateInput(
  dateString: string,
  endOfDay: boolean,
): number {
  const raw = dateString.trim();
  if (!raw) return 0;

  const [year, month, day] = raw.split("-").map(Number);
  if (!year || !month || !day) return 0;

  const milliseconds = endOfDay
    ? Date.UTC(year, month - 1, day, 23, 59, 59)
    : Date.UTC(year, month - 1, day, 0, 0, 0);
  return Math.floor(milliseconds / 1000);
}

export function normalizeExportFrequency(
  value: string,
): PolymarketExportFrequency {
  const normalized = value.toLowerCase().trim();
  if (normalized === "minutely") return "minutely";
  if (normalized === "hourly") return "hourly";
  if (normalized === "weekly") return "weekly";
  if (normalized === "monthly") return "monthly";
  return "daily";
}

function bucketBySeconds(
  points: PolymarketPriceHistoryPoint[],
  bucketSeconds: number,
): PolymarketPriceHistoryPoint[] {
  const lastByBucket = new Map<number, PolymarketPriceHistoryPoint>();
  for (const point of points) {
    lastByBucket.set(Math.floor(point.t / bucketSeconds), point);
  }

  return Array.from(lastByBucket.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucket, point]) => ({
      t: (bucket + 1) * bucketSeconds,
      p: point.p,
    }));
}

export function downsamplePolymarketHistory(
  history: PolymarketPriceHistoryPoint[],
  frequency: PolymarketExportFrequency,
): PolymarketPriceHistoryPoint[] {
  const points = [...history].sort((a, b) => a.t - b.t);
  if (points.length === 0) return points;

  if (frequency === "minutely") return bucketBySeconds(points, 60);
  if (frequency === "hourly") return bucketBySeconds(points, 60 * 60);
  if (frequency === "daily") return bucketBySeconds(points, 60 * 60 * 24);
  if (frequency === "weekly") {
    return bucketBySeconds(points, 60 * 60 * 24 * 7);
  }

  const lastByMonth = new Map<
    string,
    { year: number; monthIndex: number; point: PolymarketPriceHistoryPoint }
  >();
  for (const point of points) {
    const date = new Date(point.t * 1000);
    const key = `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
    lastByMonth.set(key, {
      year: date.getUTCFullYear(),
      monthIndex: date.getUTCMonth(),
      point,
    });
  }

  return Array.from(lastByMonth.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, { year, monthIndex, point }]) => ({
      t: Math.floor(Date.UTC(year, monthIndex + 1, 1) / 1000),
      p: point.p,
    }));
}
