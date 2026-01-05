import { fetchWithAuth } from "./auth";
import { API_BASE_URL } from "./constants";

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
  slug: string
) => {
  const response = await fetchWithAuth(
    `${API_V1_BASE_URL}/users/polymarket-data/${type}/${slug}`
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
    }
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
  payload: UpdateAlertPayload
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

  const res = await response.json();
  return res;
};
