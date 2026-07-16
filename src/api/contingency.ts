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
  // probabilities: {
  //   event_labels: {
  //     event_x: string;
  //     event_y: string;
  //   };
  //   marginal: Record<string, number>;
  //   conditional: Record<string, number>;
  //   joint_table: Record<string, number>;
  // };
  // payout_snapshot: {
  //   guard_bet: number;
  //   money_maker_bet: number;
  //   win_lose_guard: number;
  //   lose_win_money_maker: number;
  //   win_win_middle: number;
  //   lose_lose: number;
  //   expected_value: number;
  // };
  // pay_to_play_cells: Array<{
  //   cell: string;
  //   name: string;
  //   formula: string;
  //   value: number;
  // }>;
  // spreadsheet_details: {
  //   automatic_bet_allocation: {
  //     capital_total: number;
  //     hold_percentage: number;
  //     guard: {
  //       label: string;
  //       bet: number;
  //       percentage: number;
  //       shares: number;
  //       earnings: number;
  //     };
  //     money_maker: {
  //       label: string;
  //       bet: number;
  //       percentage: number;
  //       shares: number;
  //       earnings: number;
  //     };
  //   };
  //   possible_outcomes: Array<{
  //     name: string;
  //     guard: number;
  //     money_maker: number;
  //     total: number;
  //     joint_probability: number;
  //     expected_contribution: number;
  //     roi_percent: number;
  //     is_logically_impossible?: boolean;
  //   }>;
  //   expectation: {
  //     expected_value: number;
  //     roi_percent: number;
  //   };
  //   joint_probability_table: {
  //     column_labels: {
  //       x_no: string;
  //       x_yes: string;
  //     };
  //     row_labels: {
  //       y_yes: string;
  //       y_no: string;
  //     };
  //     rows: Array<{
  //       row_key: "y_yes" | "y_no";
  //       x_no: number;
  //       x_yes: number;
  //     }>;
  //   };
  // };
  // matrix_axes: {
  //   row_event_y_yes_probabilities: number[];
  //   col_event_x_yes_probabilities: number[];
  //   row_no_invasion_probabilities: number[];
  //   col_clash_probabilities: number[];
  // };
  // allocation_matrix: MaxContingencyTableMatrixRow[];
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
