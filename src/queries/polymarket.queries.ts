import { useQuery } from "@tanstack/vue-query";
import statsApiClient from "@/lib/statsApi";
import type { PolymarketMarket } from "@/types/";
import type { MaybeRefOrGetter } from "vue";
import { toValue, computed } from "vue";

interface PolymarketEvent {
  markets: PolymarketMarket[];
}

interface SafeBalance {
  balance: string;
  tokenAddress: string | null;
  token: {
    symbol: string;
    decimals: number;
    tokenAddress: string;
    name: string;
  } | null;
}

export interface SafeBalancesResponse {
  results: SafeBalance[];
}

/**
 * Fetch market data for polymarket event
 *
 * @endpoint GET /polymarket/market-data
 * @params none
 * @queryParams { url: string } - the polymarket event URL
 * @body none
 */
export const useMarketData = (
  endpoint: MaybeRefOrGetter<string | null>,
  queryId = "default",
) => {
  return useQuery({
    queryKey: computed(() => ["marketData", queryId, toValue(endpoint)]),
    queryFn: async () => {
      try {
        // Query params: passed as URL query string (?url=xxx)
        const queryParams = { url: toValue(endpoint) };

        const { data } = await statsApiClient.get<
          PolymarketEvent | PolymarketMarket
        >("/v1/polymarket/market-data", {
          params: queryParams,
        });

        return data;
      } catch (error) {
        console.error("Failed to fetch market data:", error);
        throw error; // Important: let Vue Query know it failed
      }
    },
    // refetchInterval: 10000,
    enabled: computed(() => !!toValue(endpoint)),
  });
};
