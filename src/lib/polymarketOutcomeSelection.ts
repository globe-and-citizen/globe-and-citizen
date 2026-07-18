export type PolymarketOutcomeSelection = "yes" | "no" | "both";

export type PolymarketOutcomeOption = { id: string; name: string };

export type PolymarketMarketOption = {
  id: string;
  title: string;
  outcomes: PolymarketOutcomeOption[];
  defaultOutcomeId?: string;
  defaultOutcomeName?: string;
};

export function normalizePolymarketOutcomeName(value: string): string {
  return value.trim().toLowerCase();
}

export function polymarketOutcomeSelectionLabel(
  selection: PolymarketOutcomeSelection,
): string {
  if (selection === "no") return "No";
  if (selection === "both") return "Yes and No";
  return "Yes";
}

export function selectPolymarketOutcomes(
  market: PolymarketMarketOption,
  selection: PolymarketOutcomeSelection,
  desiredOutcomeId = "",
  desiredOutcomeName = "",
): PolymarketOutcomeOption[] {
  const outcomes = market.outcomes ?? [];
  if (outcomes.length === 0) return [];

  const byName = (name: "yes" | "no") =>
    outcomes.find(
      (outcome) => normalizePolymarketOutcomeName(outcome.name) === name,
    );
  const yesOutcome = byName("yes");
  const noOutcome = byName("no");

  if (selection === "both") {
    const binaryOutcomes = [yesOutcome, noOutcome].filter(
      (outcome): outcome is PolymarketOutcomeOption => Boolean(outcome),
    );
    return binaryOutcomes.length > 0 ? binaryOutcomes : [...outcomes];
  }

  if (selection === "no") {
    return [noOutcome ?? yesOutcome ?? outcomes[0]].filter(
      (outcome): outcome is PolymarketOutcomeOption => Boolean(outcome),
    );
  }

  if (desiredOutcomeId) {
    const desiredById = outcomes.find(
      (outcome) => outcome.id === desiredOutcomeId,
    );
    if (desiredById) return [desiredById];
  }

  const normalizedDesiredName =
    normalizePolymarketOutcomeName(desiredOutcomeName);
  if (normalizedDesiredName) {
    const desiredByName = outcomes.find(
      (outcome) =>
        normalizePolymarketOutcomeName(outcome.name) === normalizedDesiredName,
    );
    if (desiredByName) return [desiredByName];
  }

  return [yesOutcome ?? noOutcome ?? outcomes[0]].filter(
    (outcome): outcome is PolymarketOutcomeOption => Boolean(outcome),
  );
}

export function selectDefaultPolymarketOutcome(
  market: PolymarketMarketOption,
): PolymarketOutcomeOption | null {
  const outcomes = market.outcomes ?? [];
  if (outcomes.length === 0) return null;
  const defaultId = market.defaultOutcomeId?.trim();
  if (defaultId) {
    return outcomes.find((item) => item.id === defaultId) ?? outcomes[0] ?? null;
  }
  const yesOutcome = outcomes.find(
    (item) => normalizePolymarketOutcomeName(item.name) === "yes",
  );
  return yesOutcome ?? outcomes[0] ?? null;
}
