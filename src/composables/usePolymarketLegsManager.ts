import { computed, ref, toValue, watch, type MaybeRefOrGetter } from "vue";
import type { PolymarketGammaSearchEvent } from "@/api/polymarket";
import {
  usePolymarketLeg,
  type PolymarketLegState,
} from "@/composables/usePolymarketLeg";
import { toPolymarketEventUrl } from "@/composables/usePolymarketMarketSearch";
import {
  polymarketOutcomeSelectionLabel,
  selectPolymarketOutcomes,
} from "@/lib/polymarketOutcomeSelection";

export type PolymarketCompareMarketInput = {
  marketUrl: string;
  marketId: string;
  label?: string;
};

export type MutablePolymarketLegField =
  | "marketUrl"
  | "selectedMarketId"
  | "selectedOutcomeId"
  | "insightsOutcomeSelection"
  | "exportFromDate"
  | "exportToDate"
  | "exportFrequency";

export type CheckboxModelValue = boolean | "indeterminate";

export function usePolymarketLegsManager(options: {
  initialSelectedMarketIds: MaybeRefOrGetter<string[] | undefined>;
  lockExportToActiveMarket?: MaybeRefOrGetter<boolean>;
  maxLegs?: number;
}) {
  const maxLegs = options.maxLegs ?? 10;
  const legs = ref<PolymarketLegState[]>([]);
  const activeLegIndex = ref(0);
  const quickAddMarketUrl = ref("");
  const activeLeg = computed(() => legs.value[activeLegIndex.value] ?? null);
  const canAddMoreInsightsMarkets = computed(
    () => legs.value.length < maxLegs,
  );
  const canQuickAddMarket = computed(
    () =>
      Boolean(quickAddMarketUrl.value.trim()) &&
      canAddMoreInsightsMarkets.value,
  );
  const {
    createEmptyLeg,
    loadLeg: loadSharedLeg,
  } = usePolymarketLeg();

  watch(
    () => legs.value.length,
    (length) => {
      if (length === 0) activeLegIndex.value = 0;
      else if (activeLegIndex.value >= length) {
        activeLegIndex.value = length - 1;
      }
    },
    { immediate: true },
  );

  function createInsightsLeg(url = ""): PolymarketLegState {
    return createEmptyLeg({ marketUrl: url, showChart: true });
  }

  function appendInsightsLeg(url = ""): number {
    const index = legs.value.length;
    legs.value.push(createInsightsLeg(url));
    activeLegIndex.value = index;
    return index;
  }

  function selectLeg(index: number) {
    if (index >= 0 && index < legs.value.length) activeLegIndex.value = index;
  }

  function canRemoveLeg(index: number): boolean {
    return index >= 0 && index < legs.value.length;
  }

  function removeLeg(index: number) {
    if (canRemoveLeg(index)) legs.value.splice(index, 1);
  }

  function setLegField(
    index: number,
    field: MutablePolymarketLegField,
    value: string,
  ) {
    const leg = legs.value[index];
    if (!leg) return;
    if (field === "insightsOutcomeSelection") {
      leg.insightsOutcomeSelection =
        value === "no" || value === "both" ? value : "yes";
    } else {
      leg[field] = value;
    }
  }

  function legDisplayTitle(leg: PolymarketLegState, index: number): string {
    const explicit = leg.compareLabel?.trim();
    if (explicit) return explicit;
    if (leg.title.trim()) return leg.title.trim();
    const market = leg.marketOptions.find(
      (item) => item.id === leg.selectedMarketId,
    );
    return market?.title?.trim() || leg.marketUrl.trim() || `Leg ${index + 1}`;
  }

  function legStatusText(leg: PolymarketLegState): string {
    if (leg.loading) return "Loading market data";
    if (leg.error) return leg.error;
    if (!leg.marketUrl.trim()) return "No market selected";
    if (!leg.selectedMarketId) return "Choose a market";
    if (!leg.selectedOutcomeId) return "Choose an outcome";
    return `Outcome: ${polymarketOutcomeSelectionLabel(
      leg.insightsOutcomeSelection,
    )}`;
  }

  async function loadLeg(index: number) {
    const leg = legs.value[index];
    if (!leg) return;
    const initialIds =
      index === 0
        ? (toValue(options.initialSelectedMarketIds) ?? [])
            .map(String)
            .filter(Boolean)
            .slice(0, maxLegs)
        : [];
    await loadSharedLeg(leg, {
      initialSelectedMarketIds: initialIds,
      lockExportToActiveMarket:
        legs.value.length > 1 ||
        Boolean(
          options.lockExportToActiveMarket === undefined
            ? false
            : toValue(options.lockExportToActiveMarket),
        ),
      preserveInsightsTab: true,
    });
  }

  async function handleQuickAddMarket() {
    const url = quickAddMarketUrl.value.trim();
    if (!url || !canAddMoreInsightsMarkets.value) return;
    const index = appendInsightsLeg(url);
    quickAddMarketUrl.value = "";
    await loadLeg(index);
  }

  async function handleAssignSearchEvent(event: PolymarketGammaSearchEvent) {
    if (!canAddMoreInsightsMarkets.value || isSearchEventSelected(event)) return;
    const eventUrl = toPolymarketEventUrl(event);
    const index = appendInsightsLeg(eventUrl);
    const leg = legs.value[index];
    if (!leg) return;
    leg.compareLabel = event.title?.trim() || "Event";
    quickAddMarketUrl.value = eventUrl;
    await loadLeg(index);
  }

  function findLegIndexForEvent(event: PolymarketGammaSearchEvent): number {
    const eventUrl = toPolymarketEventUrl(event);
    return legs.value.findIndex((leg) => leg.marketUrl.trim() === eventUrl);
  }

  function isSearchEventSelected(event: PolymarketGammaSearchEvent): boolean {
    return findLegIndexForEvent(event) !== -1;
  }

  function handleRemoveSearchEvent(event: PolymarketGammaSearchEvent) {
    const index = findLegIndexForEvent(event);
    if (index !== -1) removeLeg(index);
  }

  function onInsightsOutcomeSelectionChange(index: number) {
    const leg = legs.value[index];
    if (!leg) return;
    const market = leg.marketOptions.find(
      (item) => item.id === leg.selectedMarketId,
    );
    if (!market) return;
    const outcome = selectPolymarketOutcomes(
      market,
      leg.insightsOutcomeSelection,
      leg.selectedOutcomeId,
      leg.selectedOutcomeName,
    )[0];
    if (outcome) {
      leg.selectedOutcomeId = outcome.id;
      leg.selectedOutcomeName = outcome.name;
    }
  }

  function loadCompareLegs(items: PolymarketCompareMarketInput[]) {
    legs.value = items.slice(0, maxLegs).map((item) =>
      createEmptyLeg({
        marketUrl: item.marketUrl,
        compareLabel: item.label,
        selectedMarketId: item.marketId,
        exportSelectedMarkets: [item.marketId],
        showChart: true,
        showExport: false,
      }),
    );
    activeLegIndex.value = 0;
    void Promise.allSettled(legs.value.map((_, index) => loadLeg(index)));
  }

  function exportSelectAllState(
    leg: PolymarketLegState,
  ): CheckboxModelValue {
    if (leg.marketOptions.length === 0) return false;
    const selectedCount = leg.marketOptions.filter((market) =>
      leg.exportSelectedMarkets.includes(market.id),
    ).length;
    if (selectedCount === leg.marketOptions.length) return true;
    return selectedCount > 0 ? "indeterminate" : false;
  }

  function toggleAllExportMarkets(
    leg: PolymarketLegState,
    checked: CheckboxModelValue,
  ) {
    leg.exportSelectedMarkets =
      checked === true || checked === "indeterminate"
        ? leg.marketOptions.map((market) => market.id)
        : [];
  }

  function toggleExportMarket(
    leg: PolymarketLegState,
    marketId: string,
    checked: CheckboxModelValue,
  ) {
    if (checked === true || checked === "indeterminate") {
      if (!leg.exportSelectedMarkets.includes(marketId)) {
        leg.exportSelectedMarkets.push(marketId);
      }
    } else {
      leg.exportSelectedMarkets = leg.exportSelectedMarkets.filter(
        (id) => id !== marketId,
      );
    }
  }

  function reset() {
    legs.value = [];
    activeLegIndex.value = 0;
    quickAddMarketUrl.value = "";
  }

  return {
    legs,
    activeLegIndex,
    activeLeg,
    quickAddMarketUrl,
    canAddMoreInsightsMarkets,
    canQuickAddMarket,
    appendInsightsLeg,
    selectLeg,
    canRemoveLeg,
    removeLeg,
    setLegField,
    legDisplayTitle,
    legStatusText,
    loadLeg,
    handleQuickAddMarket,
    handleAssignSearchEvent,
    isSearchEventSelected,
    handleRemoveSearchEvent,
    onInsightsOutcomeSelectionChange,
    loadCompareLegs,
    exportSelectAllState,
    toggleAllExportMarkets,
    toggleExportMarket,
    reset,
  };
}
