import { getPolymarketDataBySlug } from "@/api/polymarket";
import type { ScatterSeries } from "@/components/Charts/PriceScatterChart.vue";
import { formatIsoTodayUtc, isBeforeIsoDate } from "@/lib/polymarketDates";
import {
  normalizePolymarketOutcomeName,
  selectPolymarketOutcomes,
  type PolymarketMarketOption,
  type PolymarketOutcomeOption,
  type PolymarketOutcomeSelection,
} from "@/lib/polymarketOutcomeSelection";

type UnknownRecord = Record<string, unknown>;

export type PolymarketLegState = {
  marketUrl: string;
  loading: boolean;
  error: string | null;
  title: string;
  compareLabel?: string;
  minDate: string;
  marketOptions: PolymarketMarketOption[];
  selectedMarketId: string;
  outcomeOptions: PolymarketOutcomeOption[];
  selectedOutcomeId: string;
  selectedOutcomeName: string;
  insightsOutcomeSelection: PolymarketOutcomeSelection;
  usePerMarketDefaultOutcome: boolean;
  showExport: boolean;
  exportFromDate: string;
  exportToDate: string;
  exportFrequency: string;
  exportSelectedMarkets: string[];
  exportLoading: boolean;
  exportError: string | null;
  showChart: boolean;
  chartData: ScatterSeries[];
  chartLoading: boolean;
  chartError: string | null;
};

export type LoadPolymarketLegOptions = {
  initialSelectedMarketIds?: string[];
  lockExportToActiveMarket?: boolean;
  preserveInsightsTab?: boolean;
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function asString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function asDateInput(value: unknown): string {
  if (value === null || value === undefined) return "";
  const raw = asString(value).trim();
  if (!raw) return "";
  const numeric = /^\d+$/.test(raw) ? Number(raw) : null;
  const date = new Date(
    numeric === null ? raw : numeric > 1e12 ? numeric : numeric * 1000,
  );
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function eventStartDate(data: unknown): string {
  const record = asRecord(data);
  if (!record) return "";
  const candidates = [
    record.startDate,
    record.creationDate,
    record.createdAt,
  ].map(asDateInput);
  const firstMarket = Array.isArray(record.markets)
    ? asRecord(record.markets[0])
    : null;
  if (firstMarket) {
    candidates.push(asDateInput(firstMarket.startDate));
    candidates.push(asDateInput(firstMarket.createdAt));
  }
  return candidates.filter(Boolean).sort()[0] ?? "";
}

function parseClobTokenIds(value: unknown): PolymarketOutcomeOption[] {
  try {
    const ids = typeof value === "string" ? JSON.parse(value) : value;
    if (!Array.isArray(ids)) return [];
    return ids.flatMap((id, index) => {
      const tokenId = asString(id);
      if (!tokenId) return [];
      const name =
        ids.length === 2
          ? index === 0
            ? "Yes"
            : "No"
          : `Outcome ${index + 1}`;
      return [{ id: tokenId, name }];
    });
  } catch {
    return [];
  }
}

function normalizeMarket(value: unknown): PolymarketMarketOption | null {
  const market = asRecord(value);
  const id = asString(market?.id ?? market?.market_id ?? market?.marketId);
  if (!id) return null;
  const title =
    asString(market?.groupItemTitle ?? market?.title ?? market?.name) ||
    `Market ${id}`;
  let outcomes: PolymarketOutcomeOption[] = [];

  if (Array.isArray(market?.outcomes)) {
    outcomes = market.outcomes.flatMap((value) => {
      const outcome = asRecord(value);
      const outcomeId = asString(
        outcome?.clobTokenId ??
          outcome?.tokenId ??
          outcome?.outcome_id ??
          outcome?.id,
      );
      const name = asString(
        outcome?.name ?? outcome?.title ?? outcome?.outcome_name,
      );
      return outcomeId && name ? [{ id: outcomeId, name }] : [];
    });
  }
  if (outcomes.length === 0 && market?.clobTokenIds) {
    outcomes = parseClobTokenIds(market.clobTokenIds);
  }

  const defaultOutcome =
    outcomes.find(
      (outcome) => normalizePolymarketOutcomeName(outcome.name) === "yes",
    ) ?? outcomes[0];
  return {
    id,
    title,
    outcomes,
    defaultOutcomeId: defaultOutcome?.id,
    defaultOutcomeName: defaultOutcome?.name,
  };
}

function normalizeMarketOptions(data: unknown): PolymarketMarketOption[] {
  const record = asRecord(data);
  if (Array.isArray(record?.markets)) {
    return record.markets.flatMap((market) => {
      const normalized = normalizeMarket(market);
      return normalized ? [normalized] : [];
    });
  }
  const single = normalizeMarket(data);
  return single ? [single] : [];
}

function parsePolymarketUrl(input: string): {
  type: "events" | "markets";
  slug: string;
} {
  const url = new URL(input);
  const parts = url.pathname.split("/").filter(Boolean);
  const type =
    parts[0] === "event" ? "events" : parts[0] === "market" ? "markets" : null;
  const slug = parts[1];
  if (!type || !slug) throw new Error("Invalid Polymarket URL.");
  return { type, slug };
}

export function createEmptyPolymarketLeg(
  overrides: Partial<PolymarketLegState> = {},
): PolymarketLegState {
  return {
    marketUrl: "",
    loading: false,
    error: null,
    title: "",
    minDate: "",
    marketOptions: [],
    selectedMarketId: "",
    outcomeOptions: [],
    selectedOutcomeId: "",
    selectedOutcomeName: "",
    insightsOutcomeSelection: "yes",
    usePerMarketDefaultOutcome: false,
    showExport: false,
    exportFromDate: "",
    exportToDate: "",
    exportFrequency: "daily",
    exportSelectedMarkets: [],
    exportLoading: false,
    exportError: null,
    showChart: false,
    chartData: [],
    chartLoading: false,
    chartError: null,
    ...overrides,
  };
}

export async function loadPolymarketLeg(
  leg: PolymarketLegState,
  options: LoadPolymarketLegOptions = {},
): Promise<void> {
  const marketUrl = leg.marketUrl.trim();
  if (!marketUrl || leg.loading) return;

  const selectedMarketId = leg.selectedMarketId;
  const selectedOutcomeId = leg.selectedOutcomeId;
  const selectedOutcomeName = leg.selectedOutcomeName;
  const selectedExports = [...leg.exportSelectedMarkets];
  const previousTab = leg.showExport
    ? "export"
    : leg.showChart
      ? "chart"
      : null;

  leg.loading = true;
  leg.error = null;
  leg.title = "";
  leg.minDate = "";
  leg.marketOptions = [];
  leg.outcomeOptions = [];
  leg.chartData = [];
  leg.chartError = null;
  leg.exportError = null;

  try {
    const { type, slug } = parsePolymarketUrl(marketUrl);
    const data = await getPolymarketDataBySlug(type, slug);
    const record = asRecord(data);
    leg.title = asString(record?.title ?? record?.name);
    leg.marketOptions = normalizeMarketOptions(data);
    leg.minDate = eventStartDate(data);

    if (!leg.exportToDate) leg.exportToDate = formatIsoTodayUtc();
    if (leg.minDate) {
      if (
        !leg.exportFromDate ||
        isBeforeIsoDate(leg.exportFromDate, leg.minDate)
      ) {
        leg.exportFromDate = leg.minDate;
      }
      if (isBeforeIsoDate(leg.exportToDate, leg.minDate)) {
        leg.exportToDate = leg.minDate;
      }
    }

    const initialIds = (options.initialSelectedMarketIds ?? []).filter(Boolean);
    const preferredMarketId = selectedMarketId || initialIds[0];
    const preferredMarket =
      leg.marketOptions.find((market) => market.id === preferredMarketId) ??
      leg.marketOptions.find((market) =>
        market.outcomes.some((outcome) => outcome.id === selectedOutcomeId),
      ) ??
      leg.marketOptions[0];

    if (preferredMarket) {
      leg.selectedMarketId = preferredMarket.id;
      leg.outcomeOptions = preferredMarket.outcomes;
      const outcome =
        preferredMarket.outcomes.find(
          (item) => item.id === selectedOutcomeId,
        ) ??
        selectPolymarketOutcomes(
          preferredMarket,
          leg.insightsOutcomeSelection,
          selectedOutcomeId,
          selectedOutcomeName,
        )[0];
      leg.selectedOutcomeId = outcome?.id ?? selectedOutcomeId;
      leg.selectedOutcomeName = outcome?.name ?? selectedOutcomeName;
    }

    const availableIds = new Set(leg.marketOptions.map((market) => market.id));
    const restoredExports = [...initialIds, ...selectedExports].filter(
      (id, index, ids) => availableIds.has(id) && ids.indexOf(id) === index,
    );
    if (
      leg.selectedMarketId &&
      !restoredExports.includes(leg.selectedMarketId)
    ) {
      restoredExports.unshift(leg.selectedMarketId);
    }
    leg.exportSelectedMarkets = options.lockExportToActiveMarket
      ? leg.selectedMarketId
        ? [leg.selectedMarketId]
        : []
      : restoredExports;

    if (leg.marketOptions.length === 0) {
      leg.error = "No markets found for this URL.";
    } else if (options.preserveInsightsTab) {
      leg.showChart = previousTab !== "export";
      leg.showExport = previousTab === "export";
    }
  } catch (error) {
    console.error("Failed to load Polymarket leg:", error);
    leg.error =
      error instanceof Error ? error.message : "Could not load market data.";
  } finally {
    leg.loading = false;
  }
}

export function usePolymarketLeg() {
  return {
    createEmptyLeg: createEmptyPolymarketLeg,
    loadLeg: loadPolymarketLeg,
  };
}
