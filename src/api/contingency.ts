import { API_BASE_URL } from "@/api/constants";
import { fetchWithAuth } from "@/api/auth";

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

const API_V1_BASE_URL = (() => {
  const base = normalizeBaseUrl(API_BASE_URL);
  return base.endsWith("/v1") ? base : `${base}/v1`;
})();

export type MaxContingencyTableRequest = {
  event_x_name: string;
  event_y_name: string;
  prob_event_x_yes: number;
  prob_event_y_yes: number;
  capital: number;
  guard_bet: number;
  matrix_step: number;
};

export type MaxContingencyTableMatrixRow = {
  row_event_y_yes_prob: number;
  col_event_x_yes_prob: number;
  row_no_invasion_prob: number;
  col_clash_prob: number;
  payout: number;
};

export type MaxContingencyTableResponse = {
  matrix_grid: number[][];
};

type Envelope = {
  data: MaxContingencyTableResponse;
  error?: string;
};

export async function calculateMaxContingencyTable(
  payload: MaxContingencyTableRequest,
): Promise<MaxContingencyTableResponse> {
  const response = await fetchWithAuth(
    `${API_V1_BASE_URL}/max-contingency-table`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const result = (await response.json().catch(() => ({}))) as Envelope;
  if (!response.ok) {
    throw new Error(
      result.error || "Failed to calculate max contingency table",
    );
  }

  return result.data;
}
