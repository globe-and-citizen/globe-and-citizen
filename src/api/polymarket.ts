import { fetchWithAuth, interceptorFetch } from "./auth";
import { API_BASE_URL } from "./constants";
import { toast } from "vue3-toastify";

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

const API_V1_BASE_URL = (() => {
  const base = normalizeBaseUrl(API_BASE_URL);
  return base.endsWith("/v1") ? base : `${base}/v1`;
})();

export type AlertOperator = "lt" | "lte" | "gt" | "gte" | "eq";

export type AlertMarketFields = {
  market_url?: string;
  market_id?: string;
  outcome_id?: string;
  outcome_name?: string;
  target_price?: number;
};

export type SumAlertLeg = {
  market_url: string;
  outcome_id: string;
  outcome_name: string;
};

export type CreateSumAlertPayload = {
  alert_type: "sum";
  operator: AlertOperator;
  threshold: number;
  direction: "buy" | "sell";
  legs: SumAlertLeg[];
  notify_discord: boolean;
  discord_webhook?: string;
  repeat: boolean;
} & AlertMarketFields;

export type CreateSingleAlertPayload = {
  market_url: string;
  market_id?: string;
  outcome_id: string;
  outcome_name: string;
  direction: "buy" | "sell";
  operator: AlertOperator;
  target_price: number;
  notify_discord: boolean;
  threshold: number;
  discord_webhook?: string;
  repeat: boolean;
};

export type CreateAlertPayload =
  | CreateSingleAlertPayload
  | CreateSumAlertPayload;

export type UpdateSumAlertPayload = CreateSumAlertPayload & {
  // Keep the shape open for backend compatibility.
};

export type UpdateSingleAlertPayload = CreateSingleAlertPayload & {
  alert_type?: "single";
};

export type UpdateAlertPayload =
  | UpdateSingleAlertPayload
  | UpdateSumAlertPayload;

export const getPolymarketDataBySlug = async (
  type: "events" | "markets",
  slug: string,
) => {
  const response = await fetchWithAuth(
    `${API_V1_BASE_URL}/users/polymarket-data/${type}/${slug}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Polymarket data");
  }
  const res = await response.json();

  return res.data[0];
};

export const getPolymarketForPriceAlerts = async (url: string) => {
  const response = await fetchWithAuth(
    `${API_V1_BASE_URL}/profile/price-alert`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Polymarket data");
  }
  const res = await response.json();

  return res;
};

export const createAlert = async (payload: CreateAlertPayload) => {
  const response = await fetchWithAuth(`${API_V1_BASE_URL}/alerts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Failed to create alert");
  }
  const res = await response.json();
  toast("Alert created successfully!", {
    autoClose: 3000,
    type: "success",
    position: "top-right",
  });
  return res;
};

export const fetchAlerts = async () => {
  const response = await fetchWithAuth(`${API_V1_BASE_URL}/alerts`);
  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }
  const res = await response.json();
  return res;
};

export const deleteAlert = async (alertId: string | number) => {
  const response = await fetchWithAuth(`${API_V1_BASE_URL}/alerts/${alertId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete alert");
  }
  const res = await response.json().catch(() => ({}));
  return res;
};

export const updateAlert = async (
  alertId: string | number,
  payload: UpdateAlertPayload,
) => {
  if (alertId === undefined || alertId === null || alertId === "") {
    throw new Error("Invalid alert id");
  }

  const response = await fetchWithAuth(`${API_V1_BASE_URL}/alerts/${alertId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update alert");
  }

  toast("Alert updated successfully!", {
    autoClose: 3000,
    type: "success",
    position: "top-right",
  });
  const res = await response.json();
  return res;
};

const CLOB_BASE_URL = "https://clob.polymarket.com";

export type PolymarketPriceHistoryPoint = {
  t: number;
  p: number;
};

export type PolymarketPriceHistoryResponse = {
  history: PolymarketPriceHistoryPoint[];
};

export const getPolymarketPricesHistory = async (params: {
  market: string;
  startTs: number;
}): Promise<PolymarketPriceHistoryResponse> => {
  const { market, startTs } = params;
  if (!market?.trim()) {
    throw new Error("Missing CLOB token id");
  }
  if (!Number.isFinite(startTs) || startTs < 0) {
    throw new Error("Invalid start timestamp");
  }

  const url = new URL("/prices-history", CLOB_BASE_URL);
  url.searchParams.set("market", market);
  url.searchParams.set("startTs", String(Math.floor(startTs)));

  const response = await interceptorFetch(url.toString(), { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to fetch price history (${response.status})`);
  }

  const res = (await response.json()) as unknown;
  if (!res || typeof res !== "object" || !("history" in res)) {
    throw new Error("Unexpected price history response");
  }

  return res as PolymarketPriceHistoryResponse;
};

export type PolymarketGammaSearchMarket = {
  id: string;
  question?: string;
  slug?: string;
  image?: string;
  icon?: string;
  outcomes?: string; // JSON string array
  outcomePrices?: string; // JSON string array
  // Orderbook-ish fields (present in some responses)
  lastTradePrice?: number;
  bestBid?: number;
  bestAsk?: number;
  groupItemTitle?: string;
  active?: boolean;
  closed?: boolean;
  volumeNum?: number;
};

export type PolymarketGammaSearchEvent = {
  id: string;
  title?: string;
  slug?: string;
  ticker?: string;
  image?: string;
  icon?: string;
  active?: boolean;
  closed?: boolean;
  markets?: PolymarketGammaSearchMarket[];
};

export type PolymarketGammaPagination = {
  hasMore: boolean;
  totalResults: number;
};

export type PolymarketGammaPublicSearchResponse = {
  events?: PolymarketGammaSearchEvent[];
  markets?: PolymarketGammaSearchMarket[];
  pagination?: PolymarketGammaPagination;
};

type PolymarketGammaPublicSearchEnvelope = {
  data?: PolymarketGammaPublicSearchResponse;
};

export const searchPolymarketPublic = async (params: {
  q: string;
  keepClosedMarkets?: boolean;
  limitPerType?: number;
  page?: number;
}): Promise<PolymarketGammaPublicSearchResponse> => {
  const { q, keepClosedMarkets, limitPerType, page } = params;

  const query = (q ?? "").trim();
  if (!query) {
    return { events: [], markets: [] };
  }

  const base = normalizeBaseUrl(API_BASE_URL);
  const url = new URL("/v1/profile/market-search", `${base}/`);
  url.searchParams.set("q", query);
  if (keepClosedMarkets === true) {
    url.searchParams.set("keep_closed_markets", "1");
  }
  if (Number.isFinite(limitPerType) && (limitPerType ?? 0) > 0) {
    url.searchParams.set("limit_per_type", String(Math.floor(limitPerType!)));
  }
  if (Number.isFinite(page) && (page ?? 0) > 0) {
    url.searchParams.set("page", String(Math.floor(page!)));
  }

  const response = await fetchWithAuth(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to search Polymarket (${response.status})`);
  }

  const res = (await response.json()) as unknown;
  if (!res || typeof res !== "object") {
    throw new Error("Unexpected Polymarket search response");
  }

  const envelope = res as PolymarketGammaPublicSearchEnvelope;
  if (envelope?.data && typeof envelope.data === "object") {
    return envelope.data;
  }

  // Backwards-compat if the backend returns the raw shape.
  return res as PolymarketGammaPublicSearchResponse;
};
