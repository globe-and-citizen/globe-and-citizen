export type PolymarketCsvPoint = {
  timestamp: number;
  price: number;
};

export type PolymarketCsvSeries = {
  name: string;
  data: PolymarketCsvPoint[];
};

function csvQuote(value: unknown): string {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function formatUtcDate(timestamp: number): string {
  const dateStr = new Date(timestamp * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16);

  return `${dateStr.slice(5, 7)}-${dateStr.slice(8, 10)}-${dateStr.slice(
    0,
    4,
  )} ${dateStr.slice(11, 16)}`;
}

/**
 * Builds a wide CSV table on the union of all series timestamps.
 * A series without an observation at a timestamp receives an empty cell.
 */
export function buildAlignedPolymarketCsv(
  series: PolymarketCsvSeries[],
): string {
  const timestamps = new Set<number>();
  const normalizedSeries = series.map((item, index) => {
    const values = new Map<number, number>();

    for (const point of item.data ?? []) {
      const timestamp = Number(point.timestamp);
      const price = Number(point.price);
      if (!Number.isFinite(timestamp) || !Number.isFinite(price)) continue;

      timestamps.add(timestamp);
      values.set(timestamp, price);
    }

    return {
      name: item.name.trim() || `Market ${index + 1}`,
      values,
    };
  });

  const header = [
    csvQuote("Date (UTC)"),
    csvQuote("Timestamp (UTC)"),
    ...normalizedSeries.map((item) => csvQuote(item.name)),
  ].join(",");

  const rows = Array.from(timestamps)
    .sort((a, b) => a - b)
    .map((timestamp) => {
      const values = normalizedSeries.map((item) => {
        const value = item.values.get(timestamp);
        return value === undefined ? "" : String(value);
      });

      return [
        csvQuote(formatUtcDate(timestamp)),
        String(timestamp),
        ...values,
      ].join(",");
    });

  return [header, ...rows].join("\n");
}
