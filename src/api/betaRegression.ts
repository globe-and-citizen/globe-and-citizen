import { API_BASE_URL } from "@/api/constants";
import { fetchWithAuth } from "@/api/auth";

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

export type BetaRegressionRequest = {
  csv_text: string;
  x_column: string;
  y_column: string;
  start_date?: string;
  end_date?: string;
  max_scatter_points?: number;
  grid_points?: number;
};

export type BetaRegressionScatterPoint = {
  x: number;
  y: number;
  timestamp: number;
  date_utc: string;
};

export type BetaRegressionCurvePoint = {
  x: number;
  mean: number;
  lower_95: number;
  upper_95: number;
};

export type BetaRegressionPredictionPoint = {
  x: number;
  predicted_y: number;
};

export type BetaRegressionResponse = {
  metadata: {
    x_column: string;
    y_column: string;
    required_columns: string[];
    filter: {
      start_date?: string | null;
      end_date?: string | null;
    };
  };
  summary: {
    sample_count: number;
    rows_dropped: number;
    intercept_x0: number;
    intercept_x1: number;
    pseudo_r_squared: number;
    log_likelihood: number;
    slope: number;
    precision_log: number;
    precision_phi: number;
    start_timestamp: number;
    end_timestamp: number;
    start_date_utc: string;
    end_date_utc: string;
  };
  scatter_points: BetaRegressionScatterPoint[];
  regression_curve: BetaRegressionCurvePoint[];
  predictions_at: BetaRegressionPredictionPoint[];
};

export async function calculateBetaRegression(
  payload: BetaRegressionRequest,
): Promise<BetaRegressionResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/beta-regression`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });
  console.log("Beta regression API response status:", response.status);
  const result = (await response.json().catch(() => ({}))) as
    | { data?: BetaRegressionResponse; error?: string }
    | { detail?: string };

  if (!response.ok) {
    const detailCandidate =
      (result as { error?: unknown }).error ??
      (result as { detail?: unknown }).detail;
    const detail =
      typeof detailCandidate === "string"
        ? detailCandidate
        : "Failed to calculate beta regression";
    throw new Error(detail);
  }

  if (
    result &&
    typeof result === "object" &&
    "data" in result &&
    (result as { data?: BetaRegressionResponse }).data
  ) {
    return (result as { data: BetaRegressionResponse }).data;
  }

  return result as BetaRegressionResponse;
}
