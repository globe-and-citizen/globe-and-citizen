import type { PolymarketLegState } from "@/composables/usePolymarketLeg";
import {
  assignPolymarketColumnTitles,
  createPolymarketColumnInput,
  type PolymarketSeriesRequest,
} from "@/lib/polymarketColumnTitles";
import {
  selectDefaultPolymarketOutcome,
  selectPolymarketOutcomes,
  type PolymarketMarketOption,
  type PolymarketOutcomeOption,
} from "@/lib/polymarketOutcomeSelection";

export function buildPolymarketLegRequests(
  leg: PolymarketLegState,
  marketIds: string[],
): { requests: PolymarketSeriesRequest[]; skippedCount: number } {
  let skippedCount = 0;
  const inputs = marketIds.flatMap((marketId) => {
    const market = leg.marketOptions.find((item) => item.id === marketId);
    if (!market) {
      skippedCount += 1;
      return [];
    }

    const outcomes = resolveLegOutcomes(
      leg,
      market,
      marketId === leg.selectedMarketId,
    );
    if (outcomes.length === 0) {
      skippedCount += 1;
      return [];
    }
    return outcomes.map((outcome) =>
      createPolymarketColumnInput(leg, market, outcome),
    );
  });

  return {
    requests: assignPolymarketColumnTitles(inputs),
    skippedCount,
  };
}

function resolveLegOutcomes(
  leg: PolymarketLegState,
  market: PolymarketMarketOption,
  isActiveMarket: boolean,
): PolymarketOutcomeOption[] {
  if (leg.usePerMarketDefaultOutcome) {
    const outcome = selectDefaultPolymarketOutcome(market);
    return outcome ? [outcome] : [];
  }

  return selectPolymarketOutcomes(
    market,
    leg.insightsOutcomeSelection,
    isActiveMarket ? leg.selectedOutcomeId : "",
    leg.selectedOutcomeName,
  );
}
