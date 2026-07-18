import type { PolymarketLegState } from "@/composables/usePolymarketLeg";
import type {
  PolymarketMarketOption,
  PolymarketOutcomeOption,
} from "@/lib/polymarketOutcomeSelection";

export type PolymarketMarketColumnInput = {
  eventName: string;
  marketId: string;
  marketName: string;
  outcomeId: string;
  outcomeName: string;
};

export type PolymarketSeriesRequest = PolymarketMarketColumnInput & {
  columnTitle: string;
};

export function assignPolymarketColumnTitles<
  T extends PolymarketMarketColumnInput,
>(items: T[]): Array<T & { columnTitle: string }> {
  const baseTitles = items.map(
    (item) => `${item.eventName} - ${item.marketName}`,
  );
  const baseTitleCounts = countTitles(baseTitles);

  const candidates = items.map((item, index) => {
    const baseTitle =
      baseTitles[index] ?? `${item.eventName} - ${item.marketName}`;
    return baseTitleCounts.get(baseTitle) === 1
      ? baseTitle
      : `${baseTitle} (${item.outcomeName})`;
  });
  const candidateCounts = countTitles(candidates);

  const preliminary = items.map((item, index) => {
    const candidate =
      candidates[index] ?? `${item.eventName} - ${item.marketName}`;
    return {
      item,
      title:
        candidateCounts.get(candidate) === 1
          ? candidate
          : `${candidate} [${item.marketId}]`,
    };
  });
  const preliminaryCounts = countTitles(
    preliminary.map(({ title }) => title),
  );
  const seen = new Map<string, number>();

  return preliminary.map(({ item, title }) => {
    const occurrence = (seen.get(title) ?? 0) + 1;
    seen.set(title, occurrence);
    return {
      ...item,
      columnTitle:
        preliminaryCounts.get(title) === 1
          ? title
          : `${title} #${occurrence}`,
    };
  });
}

export function eventNameForPolymarketLeg(leg: PolymarketLegState): string {
  return (
    leg.compareLabel?.trim() || leg.title.trim() || "Polymarket Event"
  );
}

export function createPolymarketColumnInput(
  leg: PolymarketLegState,
  market: PolymarketMarketOption,
  outcome: PolymarketOutcomeOption,
): PolymarketMarketColumnInput {
  return {
    eventName: eventNameForPolymarketLeg(leg),
    marketId: market.id,
    marketName: market.title.trim() || market.id,
    outcomeId: outcome.id,
    outcomeName: outcome.name,
  };
}

function countTitles(titles: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const title of titles) {
    counts.set(title, (counts.get(title) ?? 0) + 1);
  }
  return counts;
}
