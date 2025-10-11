import { fetchWithAuth } from "./auth";
import { API_BASE_URL } from "./constants";

export const getPolymarketDataBySlug = async (
  type: "events" | "markets",
  slug: string
) => {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/users/polymarket-data/${type}/${slug}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Polymarket data");
  }
  const res = await response.json();

  return res.data[0];
};
