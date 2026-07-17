<template>
  <div class="grid gap-5">
    <div v-if="isInsightsMode" class="grid gap-5">
      <div
        v-if="hasInsightsChartActions"
        class="border rounded-xl p-4 bg-muted/10 grid gap-3"
      >
        <div class="font-semibold">{{ insightsChartPanelTitle }}</div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="grid gap-1">
            <Label>From date</Label>
            <Input
              v-model="compareFromDateModel"
              type="date"
              :min="compareMinDate || undefined"
            />
          </div>
          <div class="grid gap-1">
            <Label>To date</Label>
            <Input
              v-model="compareToDateModel"
              type="date"
              :min="compareMinDate || undefined"
            />
          </div>
          <div class="grid gap-1">
            <Label>Frequency</Label>
            <Select v-model="compareFrequencyModel">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutely">Minutely</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid gap-2">
          <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
            <Button @click="handlePreviewCombinedData">
              Preview Combined Data
            </Button>
            <Button variant="outline" @click="handleDownloadCombinedCompareCsv">
              Export to CSV
            </Button>
            <Button
              variant="outline"
              @click="handleCombinedCompareNotebookAction"
            >
              Send to JupyterLite
            </Button>
          </div>

          <Dialog v-model:open="compareFilenameDialogOpenModel">
            <DialogContent class="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Send to JupyterLite</DialogTitle>
                <DialogDescription>
                  Choose a filename for the exported data.
                </DialogDescription>
              </DialogHeader>

              <div class="grid gap-2">
                <Label>Filename</Label>
                <Input
                  v-model="compareFilenameInputModel"
                  type="text"
                  :placeholder="defaultCombinedCompareNotebookFilename()"
                  :disabled="compareSaveLoading"
                />
                <p v-if="compareFilenameError" class="text-sm text-red-600">
                  {{ compareFilenameError }}
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  :disabled="compareSaveLoading"
                  @click="compareFilenameDialogOpenModel = false"
                >
                  Cancel
                </Button>
                <Button
                  :disabled="compareSaveLoading"
                  @click="handleCompareFilenamePrimaryAction"
                >
                  <span v-if="compareSaveLoading">Sending...</span>
                  <span v-else>{{
                    compareCanGoToNotebooks ? "Go to JupyterLite" : "Send"
                  }}</span>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p v-if="compareChartError" class="text-sm text-red-600">
            {{ compareChartError }}
          </p>
          <p v-if="compareSaveError" class="text-sm text-red-600">
            {{ compareSaveError }}
          </p>
          <p v-if="compareSaveSuccessPath" class="text-sm text-green-700">
            Saved to JupyterLite: {{ compareSaveSuccessPath }}
          </p>
        </div>
      </div>

      <div class="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="border rounded-xl bg-muted/10 overflow-hidden">
          <div class="border-b px-4 py-4 grid gap-3">
            <div>
              <div class="text-sm font-semibold text-foreground">
                Selected Events
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                Add Polymarket events, then choose their markets in the CSV
                workspace.
              </p>
            </div>

            <div class="grid gap-2">
              <Label>Paste market or event URL</Label>
              <div class="flex gap-2">
                <Input
                  v-model="quickAddMarketUrlModel"
                  type="text"
                  placeholder="https://polymarket.com/event/... or /market/..."
                  @keydown.enter.prevent="handleQuickAddMarket"
                />
                <Button
                  :disabled="!canQuickAddMarket"
                  @click="handleQuickAddMarket"
                >
                  Add
                </Button>
              </div>
            </div>

            <Button variant="outline" @click="openMarketSearchDialog">
              Open Search
            </Button>
          </div>

          <div class="max-h-[58vh] overflow-y-auto p-3 space-y-2">
            <div
              v-if="legs.length === 0"
              class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
            >
              Add an event to start charting, exporting, or sending data to
              JupyterLite.
            </div>

            <div
              v-for="(leg, idx) in legs"
              :key="idx"
              class="rounded-lg border p-3 transition-colors cursor-pointer"
              :class="
                idx === activeLegIndex
                  ? 'border-primary bg-background shadow-sm'
                  : 'border-border bg-background/70 hover:bg-background'
              "
              @click="selectLeg(idx)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="text-sm font-medium leading-5 break-words">
                    {{ legDisplayTitle(leg, idx) }}
                  </div>
                  <p
                    class="mt-1 text-xs"
                    :class="
                      leg.error ? 'text-red-600' : 'text-muted-foreground'
                    "
                  >
                    {{ legStatusText(leg) }}
                  </p>
                </div>

                <button
                  v-if="canRemoveLeg(idx)"
                  type="button"
                  class="text-xs text-muted-foreground hover:text-foreground"
                  @click.stop="removeLeg(idx)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </aside>

        <div class="min-w-0 grid gap-5">
          <div
            v-if="activeLeg"
            class="border rounded-xl p-4 grid gap-4 bg-background"
          >
            <div
              class="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between"
            >
              <div>
                <div class="text-lg font-semibold">
                  {{ legDisplayTitle(activeLeg, activeLegIndex) }}
                </div>
                <p class="text-sm text-muted-foreground mt-1">
                  {{
                    activeLeg.title ||
                    "Select a market and configure the preview/export range."
                  }}
                </p>
              </div>
              <div
                class="text-xs uppercase tracking-wide text-muted-foreground"
              >
                {{ activeLegLoading ? "Loading" : "Active event" }}
              </div>
            </div>

            <div class="grid gap-2">
              <Label>Market/Event URL</Label>
              <Input
                :model-value="activeLeg.marketUrl"
                type="text"
                readonly
                placeholder="https://polymarket.com/event/... or /market/..."
              />
              <p v-if="activeLeg.error" class="text-sm text-red-600">
                {{ activeLeg.error }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div class="grid gap-2">
                <Label>Markets</Label>
                <div class="grid gap-2 rounded-lg border p-3 bg-muted/20">
                  <div class="flex items-center gap-2">
                    <Checkbox
                      :id="`insights-select-all-${activeLegIndex}`"
                      :model-value="exportSelectAllState(activeLeg)"
                      :disabled="activeLeg.marketOptions.length === 0"
                      @update:model-value="
                        (value) =>
                          activeLeg && toggleAllExportMarkets(activeLeg, value)
                      "
                    />
                    <Label
                      :for="`insights-select-all-${activeLegIndex}`"
                      class="text-sm cursor-pointer"
                    >
                      Select All
                    </Label>
                  </div>

                  <div
                    v-if="activeLeg.marketOptions.length > 0"
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pl-2"
                  >
                    <div
                      v-for="(market, marketIdx) in activeLeg.marketOptions"
                      :key="market.id"
                      class="flex items-center gap-2"
                    >
                      <Checkbox
                        :id="`insights-market-${activeLegIndex}-${marketIdx}`"
                        :model-value="
                          activeLeg.exportSelectedMarkets.includes(market.id)
                        "
                        @update:model-value="
                          (value) =>
                            activeLeg &&
                            toggleExportMarket(activeLeg, market.id, value)
                        "
                      />
                      <Label
                        :for="`insights-market-${activeLegIndex}-${marketIdx}`"
                        class="text-sm cursor-pointer"
                      >
                        {{ market.title }}
                      </Label>
                    </div>
                  </div>

                  <p v-else class="text-xs text-muted-foreground">
                    Select a market or event to view available markets.
                  </p>
                </div>
              </div>

              <div class="grid gap-2">
                <Label>Outcome Mode</Label>
                <Select
                  :model-value="activeLeg.insightsOutcomeSelection"
                  @update:model-value="
                    (value) => {
                      updateActiveLegField(
                        'insightsOutcomeSelection',
                        String(value ?? ''),
                      );
                      onInsightsOutcomeSelectionChange(activeLegIndex);
                    }
                  "
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="both">Yes and No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div v-if="activeLeg.marketOptions.length > 0" class="grid gap-3">
              <div class="border rounded-lg p-3 bg-muted/20 grid gap-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="grid gap-1">
                    <Label>From date</Label>
                    <Input
                      :model-value="activeLeg.exportFromDate"
                      type="date"
                      :min="activeLeg.minDate || undefined"
                      @update:model-value="
                        (value) =>
                          updateActiveLegField(
                            'exportFromDate',
                            String(value ?? ''),
                          )
                      "
                    />
                  </div>
                  <div class="grid gap-1">
                    <Label>To date</Label>
                    <Input
                      :model-value="activeLeg.exportToDate"
                      type="date"
                      :min="activeLeg.minDate || undefined"
                      @update:model-value="
                        (value) =>
                          updateActiveLegField(
                            'exportToDate',
                            String(value ?? ''),
                          )
                      "
                    />
                  </div>
                </div>

                <div class="grid gap-1">
                  <Label>Frequency</Label>
                  <Select
                    :model-value="activeLeg.exportFrequency"
                    @update:model-value="
                      (value) =>
                        updateActiveLegField(
                          'exportFrequency',
                          String(value ?? ''),
                        )
                    "
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutely">Minutely</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div class="border rounded-lg p-3 bg-muted/20 grid gap-3">
                <div class="font-semibold">
                  Single Market Functions Download
                </div>

                <div class="grid gap-2">
                  <div class="flex flex-col sm:flex-row gap-2">
                    <Button @click="handlePreviewChart(activeLeg)">
                      Preview Chart
                    </Button>
                    <Button
                      variant="outline"
                      @click="handleDownloadExport(activeLeg)"
                    >
                      Download CSV
                    </Button>
                    <Button
                      variant="outline"
                      @click="handleSendSingleMarketToJupyterLite(activeLeg)"
                    >
                      Send to JupyterLite
                    </Button>
                  </div>

                  <p v-if="activeLeg.chartError" class="text-sm text-red-600">
                    {{ activeLeg.chartError }}
                  </p>

                  <p v-if="activeLeg.exportError" class="text-sm text-red-600">
                    {{ activeLeg.exportError }}
                  </p>

                  <p v-if="singleMarketSaveError" class="text-sm text-red-600">
                    {{ singleMarketSaveError }}
                  </p>

                  <p
                    v-if="singleMarketSaveSuccessPath"
                    class="text-sm text-green-700"
                  >
                    Saved to JupyterLite: {{ singleMarketSaveSuccessPath }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="border rounded-xl border-dashed p-8 text-center text-muted-foreground"
          >
            Add an event from the left rail to preview history, export CSV, or
            queue CSV for JupyterLite.
          </div>
        </div>
      </div>
    </div>

    <div v-else class="grid gap-5">
      <div
        v-for="(leg, idx) in legs"
        :key="idx"
        class="border rounded-md p-4 grid gap-3"
      >
        <div class="font-medium">Leg {{ idx + 1 }}</div>

        <div class="grid gap-2">
          <Label>Market/Event URL</Label>
          <div class="flex gap-2">
            <Input
              :model-value="leg.marketUrl"
              type="text"
              placeholder="https://polymarket.com/event/... or /market/..."
              @update:model-value="
                (value) => updateLegField(idx, 'marketUrl', String(value ?? ''))
              "
            />
            <Button
              :disabled="leg.loading || !leg.marketUrl.trim()"
              @click="loadLeg(idx)"
            >
              <span v-if="leg.loading">Loading...</span>
              <span v-else>Load</span>
            </Button>
          </div>
          <p v-if="leg.error" class="text-sm text-red-600">
            {{ leg.error }}
          </p>
          <p v-if="leg.title" class="text-sm text-muted-foreground">
            {{ leg.title }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>Market</Label>
            <Select
              :model-value="leg.selectedMarketId"
              :disabled="getMarketSelectOptions(leg).length === 0"
              @update:model-value="
                (value) => {
                  updateLegField(idx, 'selectedMarketId', String(value ?? ''));
                  onMarketChange(idx);
                }
              "
            >
              <SelectTrigger>
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="m in getMarketSelectOptions(leg)"
                    :key="m.id"
                    :value="m.id"
                  >
                    {{ m.title }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div class="grid gap-2">
            <Label>Outcome</Label>
            <Select
              :model-value="leg.selectedOutcomeId"
              :disabled="getOutcomeSelectOptions(leg).length === 0"
              @update:model-value="
                (value) => {
                  updateLegField(idx, 'selectedOutcomeId', String(value ?? ''));
                  onOutcomeChange(idx);
                }
              "
            >
              <SelectTrigger>
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="o in getOutcomeSelectOptions(leg)"
                    :key="o.id"
                    :value="o.id"
                  >
                    {{ o.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div v-if="showAlertOutcomeMode" class="grid gap-2">
            <Label>Outcome Mode</Label>
            <Select
              :model-value="leg.insightsOutcomeSelection"
              @update:model-value="
                (value) => {
                  updateLegField(
                    idx,
                    'insightsOutcomeSelection',
                    String(value ?? ''),
                  );
                  onInsightsOutcomeSelectionChange(idx);
                }
              "
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="both">Yes and No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>

    <Dialog
      :open="marketSearchDialogOpen"
      @update:open="onMarketSearchDialogOpenUpdate"
    >
      <DialogContent
        class="w-[92vw] max-w-[1200px] max-h-[85vh] overflow-hidden flex flex-col"
      >
        <DialogHeader>
          <DialogTitle>Search Polymarket Events</DialogTitle>
          <DialogDescription>
            Add events here, then choose their markets in the CSV workspace.
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 min-h-0">
          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              v-model="marketSearchQueryModel"
              type="text"
              placeholder="Search events..."
              @keydown.enter.prevent="runMarketSearch"
            />
            <Button
              :disabled="marketSearchLoading || !marketSearchQuery.trim()"
              @click="runMarketSearch"
            >
              {{ marketSearchLoading ? "Searching..." : "Search" }}
            </Button>
          </div>

          <p v-if="marketSearchError" class="text-sm text-red-600">
            {{ marketSearchError }}
          </p>
          <p
            v-else-if="marketSearchQuery.trim() && !marketSearchLoading"
            class="text-sm text-muted-foreground"
          >
            Showing {{ filteredSearchEventResults.length }} event{{
              filteredSearchEventResults.length === 1 ? "" : "s"
            }}
          </p>

          <div
            class="flex items-center justify-between gap-4 rounded-lg border bg-muted/20 px-4 py-3"
          >
            <div>
              <Label for="open-events-only" class="text-sm font-medium">
                Open Events Only
              </Label>
              <p class="mt-0.5 text-xs text-muted-foreground">
                Hide closed or inactive events.
              </p>
            </div>
            <button
              id="open-events-only"
              type="button"
              role="switch"
              aria-label="Open Events Only"
              :aria-checked="showOpenEventsOnly"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              :class="
                showOpenEventsOnly
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30'
              "
              @click="showOpenEventsOnly = !showOpenEventsOnly"
            >
              <span
                class="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm transition-transform"
                :class="showOpenEventsOnly ? 'translate-x-5' : 'translate-x-0.5'"
              />
            </button>
          </div>

          <div
            class="border rounded-lg overflow-hidden min-h-0 flex flex-col"
          >
            <div class="border-b px-4 py-3 text-sm font-medium">Events</div>
            <div class="flex-1 overflow-y-auto p-4 space-y-3">
              <div
                v-if="marketSearchLoading"
                class="text-sm text-muted-foreground"
              >
                Loading events...
              </div>

              <div
                v-for="event in filteredSearchEventResults"
                :key="event.id"
                class="w-full rounded-lg border p-4 transition-colors"
                :class="
                  isSearchEventSelected(event.event)
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                "
              >
                <div
                  class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="flex min-w-0 items-start gap-4">
                    <img
                      :src="event.image"
                      :alt="event.title"
                      class="h-16 w-16 shrink-0 rounded-lg border object-cover"
                      @error="handleSearchImageError"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="text-base font-semibold leading-6">
                        {{ event.title }}
                      </div>
                      <p class="mt-1 text-sm text-muted-foreground">
                        {{ event.subtitle }} available in the CSV workspace
                      </p>
                      <a
                        :href="toPolymarketEventUrl(event.event)"
                        target="_blank"
                        rel="noreferrer"
                        class="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
                      >
                        Open event on Polymarket
                      </a>
                    </div>
                  </div>

                  <Button
                    v-if="isSearchEventSelected(event.event)"
                    variant="outline"
                    class="shrink-0"
                    @click="handleRemoveSearchEvent(event.event)"
                  >
                    Remove Event
                  </Button>
                  <Button
                    v-else
                    class="shrink-0"
                    :disabled="
                      !canAddMoreInsightsMarkets || !isInsightsMode
                    "
                    @click="handleAssignSearchEvent(event.event)"
                  >
                    Add Event
                  </Button>
                </div>
              </div>

              <div
                v-if="
                  !marketSearchLoading && filteredSearchEventResults.length === 0
                "
                class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground"
              >
                {{
                  showOpenEventsOnly && searchEventResults.length > 0
                    ? "No open events found."
                    : "Search for an event to add it to the CSV workspace."
                }}
              </div>

              <div v-if="marketSearchPagination?.hasMore" class="pt-2">
                <Button
                  variant="outline"
                  class="w-full"
                  :disabled="marketSearchLoadingMore"
                  @click="loadMoreMarketSearchResults"
                >
                  {{
                    marketSearchLoadingMore
                      ? "Loading..."
                      : "Load more events"
                  }}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type {
  PolymarketGammaPagination,
  PolymarketGammaSearchEvent,
} from "@/api/polymarket";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CheckboxModelValue = boolean | "indeterminate";
type SearchOutcomeSelection = "yes" | "no" | "both";

type OutcomeOption = { id: string; name: string };
type MarketOption = {
  id: string;
  title: string;
  outcomes: OutcomeOption[];
};

type LegState = {
  marketUrl: string;
  loading: boolean;
  error: string | null;
  title: string;
  compareLabel?: string;
  minDate: string;
  marketOptions: MarketOption[];
  selectedMarketId: string;
  outcomeOptions: OutcomeOption[];
  selectedOutcomeId: string;
  selectedOutcomeName: string;
  insightsOutcomeSelection: SearchOutcomeSelection;
  usePerMarketDefaultOutcome: boolean;
  showExport: boolean;
  exportFromDate: string;
  exportToDate: string;
  exportFrequency: string;
  exportSelectedMarkets: string[];
  exportLoading: boolean;
  exportError: string | null;
  showChart: boolean;
  chartData: Array<{
    name: string;
    data: Array<{ timestamp: number; price: number }>;
  }>;
  chartLoading: boolean;
  chartError: string | null;
};

type SearchEventCardItem = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  event: PolymarketGammaSearchEvent;
};

type MutableLegField =
  | "marketUrl"
  | "selectedMarketId"
  | "selectedOutcomeId"
  | "insightsOutcomeSelection"
  | "exportFromDate"
  | "exportToDate"
  | "exportFrequency";

const props = defineProps<{
  isInsightsMode: boolean;
  isCompareInsightsMode: boolean;
  showAlertOutcomeMode: boolean;
  hasInsightsChartActions: boolean;
  insightsChartPanelTitle: string;
  compareFromDate: string;
  compareToDate: string;
  compareMinDate: string;
  compareFrequency: string;
  compareSaveLoading: boolean;
  compareFilenameDialogOpen: boolean;
  compareFilenameInput: string;
  compareFilenameError: string | null;
  compareCanGoToNotebooks: boolean;
  compareChartError: string | null;
  compareSaveError: string | null;
  compareSaveSuccessPath: string;
  singleMarketSaveError: string | null;
  singleMarketSaveSuccessPath: string;
  legs: LegState[];
  activeLegIndex: number;
  activeLeg: LegState | null;
  activeLegLoading: boolean;
  quickAddMarketUrl: string;
  canQuickAddMarket: boolean;
  canAddMoreInsightsMarkets: boolean;
  marketSearchDialogOpen: boolean;
  marketSearchQuery: string;
  marketSearchLoading: boolean;
  marketSearchLoadingMore: boolean;
  marketSearchError: string | null;
  marketSearchPagination: PolymarketGammaPagination | null;
  searchEventResults: SearchEventCardItem[];
  defaultCombinedCompareNotebookFilename: () => string;
  handlePreviewCombinedData: () => void | Promise<void>;
  handleDownloadCombinedCompareCsv: () => void | Promise<void>;
  handleCombinedCompareNotebookAction: () => void | Promise<void>;
  handleCompareFilenamePrimaryAction: () => void;
  openMarketSearchDialog: () => void;
  closeMarketSearchDialog: () => void;
  handleQuickAddMarket: () => void;
  selectLeg: (index: number) => void;
  legDisplayTitle: (leg: LegState, index: number) => string;
  legStatusText: (leg: LegState) => string;
  canRemoveLeg: (index: number) => boolean;
  removeLeg: (index: number) => void;
  setLegField: (index: number, field: MutableLegField, value: string) => void;
  loadLeg: (index: number) => void;
  getMarketSelectOptions: (leg: LegState) => MarketOption[];
  getOutcomeSelectOptions: (leg: LegState) => OutcomeOption[];
  onMarketChange: (index: number) => void;
  onOutcomeChange: (index: number) => void;
  onInsightsOutcomeSelectionChange: (index: number) => void;
  exportSelectAllState: (leg: LegState) => CheckboxModelValue;
  toggleAllExportMarkets: (leg: LegState, value: CheckboxModelValue) => void;
  toggleExportMarket: (
    leg: LegState,
    marketId: string,
    value: CheckboxModelValue,
  ) => void;
  handlePreviewChart: (leg: LegState) => void | Promise<void>;
  handleDownloadExport: (leg: LegState) => void;
  handleSendSingleMarketToJupyterLite: (leg: LegState) => void | Promise<void>;
  runMarketSearch: () => void;
  handleSearchImageError: (event: Event) => void;
  isSearchEventSelected: (event: PolymarketGammaSearchEvent) => boolean;
  toPolymarketEventUrl: (event: PolymarketGammaSearchEvent) => string;
  handleRemoveSearchEvent: (event: PolymarketGammaSearchEvent) => void;
  handleAssignSearchEvent: (
    event: PolymarketGammaSearchEvent,
  ) => void | Promise<void>;
  loadMoreMarketSearchResults: () => void;
}>();

const emit = defineEmits<{
  (e: "update:compareFromDate", value: string): void;
  (e: "update:compareToDate", value: string): void;
  (e: "update:compareFrequency", value: string): void;
  (e: "update:compareFilenameDialogOpen", value: boolean): void;
  (e: "update:compareFilenameInput", value: string): void;
  (e: "update:quickAddMarketUrl", value: string): void;
  (e: "update:marketSearchDialogOpen", value: boolean): void;
  (e: "update:marketSearchQuery", value: string): void;
}>();

const compareFromDateModel = computed({
  get: () => props.compareFromDate,
  set: (value: string) => emit("update:compareFromDate", value),
});

const compareToDateModel = computed({
  get: () => props.compareToDate,
  set: (value: string) => emit("update:compareToDate", value),
});

const compareFrequencyModel = computed({
  get: () => props.compareFrequency,
  set: (value: string) => emit("update:compareFrequency", value),
});

const compareFilenameDialogOpenModel = computed({
  get: () => props.compareFilenameDialogOpen,
  set: (value: boolean) => emit("update:compareFilenameDialogOpen", value),
});

const compareFilenameInputModel = computed({
  get: () => props.compareFilenameInput,
  set: (value: string) => emit("update:compareFilenameInput", value),
});

const quickAddMarketUrlModel = computed({
  get: () => props.quickAddMarketUrl,
  set: (value: string) => emit("update:quickAddMarketUrl", value),
});

const marketSearchQueryModel = computed({
  get: () => props.marketSearchQuery,
  set: (value: string) => emit("update:marketSearchQuery", value),
});

const showOpenEventsOnly = ref(false);

const filteredSearchEventResults = computed(() => {
  if (!showOpenEventsOnly.value) return props.searchEventResults;
  return props.searchEventResults.filter(
    ({ event }) => event.closed !== true && event.active !== false,
  );
});

function onMarketSearchDialogOpenUpdate(open: boolean) {
  if (!open) {
    props.closeMarketSearchDialog();
    return;
  }
  emit("update:marketSearchDialogOpen", true);
}

function updateLegField(index: number, field: MutableLegField, value: string) {
  props.setLegField(index, field, value);
}

function updateActiveLegField(field: MutableLegField, value: string) {
  if (!props.activeLeg) return;
  props.setLegField(props.activeLegIndex, field, value);
}
</script>
