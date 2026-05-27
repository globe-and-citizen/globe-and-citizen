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
            <Button
              :disabled="isCombinedCompareChartDisabled"
              @click="handleViewCombinedCompareChart"
            >
              <span v-if="compareChartLoading">Loading...</span>
              <span v-else>{{ insightsGenerateChartLabel }}</span>
            </Button>
            <Button
              variant="outline"
              :disabled="compareChartLoading || compareChartDataLength === 0"
              @click="openCombinedCompareChartPreview"
            >
              Preview Generated Chart
            </Button>
            <Button
              variant="outline"
              :disabled="compareChartLoading || compareChartDataLength === 0"
              @click="handleDownloadCombinedCompareCsv"
            >
              Export to CSV
            </Button>
            <Button
              variant="outline"
              :disabled="isCompareNotebookActionDisabled"
              @click="handleCombinedCompareNotebookAction"
            >
              <span v-if="compareSaveLoading">Sending...</span>
              <span v-else>{{ compareNotebookActionLabel }}</span>
            </Button>
          </div>

          <Dialog v-model:open="compareFilenameDialogOpenModel">
            <DialogContent class="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Send to Jupyter</DialogTitle>
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
                    compareCanGoToNotebooks ? "Go to notebooks" : "Send"
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
                Selected Markets
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                Paste a Polymarket URL or open search, then preview charts or
                export data to notebooks.
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

            <div class="text-xs text-muted-foreground">
              {{ legs.length }} market{{ legs.length === 1 ? "" : "s" }}
              added
              <span v-if="isCompareInsightsMode">
                for cross-event comparison
              </span>
            </div>
          </div>

          <div class="max-h-[58vh] overflow-y-auto p-3 space-y-2">
            <div
              v-if="legs.length === 0"
              class="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
            >
              Add a market to start charting, exporting, or sending data to
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
                {{ activeLegLoading ? "Loading" : "Active market" }}
              </div>
            </div>

            <div class="grid gap-2">
              <Label>Market/Event URL</Label>
              <div class="flex gap-2">
                <Input
                  :model-value="activeLeg.marketUrl"
                  type="text"
                  placeholder="https://polymarket.com/event/... or /market/..."
                  @update:model-value="
                    (value) =>
                      updateActiveLegField('marketUrl', String(value ?? ''))
                  "
                  @keydown.enter.prevent="loadLeg(activeLegIndex)"
                />
                <Button
                  :disabled="activeLeg.loading || !activeLeg.marketUrl.trim()"
                  @click="loadLeg(activeLegIndex)"
                >
                  <span v-if="activeLeg.loading">Loading...</span>
                  <span v-else>Load</span>
                </Button>
              </div>
              <p v-if="activeLeg.error" class="text-sm text-red-600">
                {{ activeLeg.error }}
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label>Market</Label>
                <Select
                  :model-value="activeLeg.selectedMarketId"
                  :disabled="getMarketSelectOptions(activeLeg).length === 0"
                  @update:model-value="
                    (value) => {
                      updateActiveLegField(
                        'selectedMarketId',
                        String(value ?? ''),
                      );
                      onMarketChange(activeLegIndex);
                    }
                  "
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select market" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="market in getMarketSelectOptions(activeLeg)"
                        :key="market.id"
                        :value="market.id"
                      >
                        {{ market.title }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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

                <div class="grid gap-2">
                  <div class="flex items-center justify-between gap-2">
                    <Label>Markets</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-7 px-2 text-xs"
                      @click="toggleExportMarketList"
                    >
                      {{
                        showExportMarketList ? "Hide list" : "Select markets"
                      }}
                    </Button>
                  </div>
                  <p class="text-xs text-muted-foreground">
                    Selected market:
                    {{ activeLegSelectedMarketLabel(activeLeg) }}
                  </p>
                  <div v-if="showExportMarketList" class="grid gap-2">
                    <div class="flex items-center gap-2">
                      <Checkbox
                        :id="`insights-select-all-${activeLegIndex}`"
                        :model-value="exportSelectAllState(activeLeg)"
                        @update:model-value="
                          (value) =>
                            activeLeg &&
                            toggleAllExportMarkets(activeLeg, value)
                        "
                      />
                      <Label
                        :for="`insights-select-all-${activeLegIndex}`"
                        class="text-sm cursor-pointer"
                      >
                        Select All
                      </Label>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
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
                  </div>
                </div>
              </div>

              <div class="border rounded-lg p-3 bg-muted/20 grid gap-3">
                <div class="font-semibold">Price Insights Actions</div>

                <div class="grid gap-2">
                  <div class="flex flex-col sm:flex-row gap-2">
                    <Button
                      :disabled="activeLeg.chartLoading"
                      @click="handleViewChart(activeLeg)"
                    >
                      <span v-if="activeLeg.chartLoading">Loading...</span>
                      <span v-else>Generate Chart</span>
                    </Button>
                    <Button
                      variant="outline"
                      :disabled="
                        activeLeg.chartLoading ||
                        activeLeg.chartData.length === 0
                      "
                      @click="openLegChartPreview(activeLeg)"
                    >
                      Preview Generated Chart
                    </Button>
                    <Button
                      :disabled="activeLeg.exportLoading"
                      @click="handleDownloadExport(activeLeg)"
                    >
                      <span v-if="activeLeg.exportLoading">Downloading...</span>
                      <span v-else>Download (.csv)</span>
                    </Button>
                  </div>

                  <p v-if="activeLeg.chartError" class="text-sm text-red-600">
                    {{ activeLeg.chartError }}
                  </p>

                  <p v-if="activeLeg.exportError" class="text-sm text-red-600">
                    {{ activeLeg.exportError }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            v-else
            class="border rounded-xl border-dashed p-8 text-center text-muted-foreground"
          >
            Add a market from the left rail to preview history, export CSV, or
            queue JSON for JupyterLite.
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
          <DialogTitle>Search Polymarket Markets</DialogTitle>
          <DialogDescription>
            Search events, then choose a market to load into the analytics
            workspace.
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 min-h-0">
          <div class="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              v-model="marketSearchQueryModel"
              type="text"
              placeholder="Search markets..."
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
            Showing {{ searchEventResults.length }} event{{
              searchEventResults.length === 1 ? "" : "s"
            }}
          </p>

          <div class="grid gap-4 min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div
              class="border rounded-lg overflow-hidden min-h-0 flex flex-col"
            >
              <div class="border-b px-4 py-3 text-sm font-medium">Events</div>
              <div class="flex-1 overflow-y-auto p-3 space-y-2">
                <div
                  v-if="marketSearchLoading"
                  class="text-sm text-muted-foreground"
                >
                  Loading events...
                </div>
                <button
                  v-for="event in searchEventResults"
                  :key="event.id"
                  type="button"
                  class="w-full rounded-lg border p-3 text-left transition-colors"
                  :class="
                    selectedSearchEvent?.id === event.id
                      ? 'border-primary bg-muted/30'
                      : 'border-border hover:bg-muted/20'
                  "
                  @click="selectSearchEvent(event.event)"
                >
                  <div class="flex items-start gap-3">
                    <img
                      :src="event.image"
                      :alt="event.title"
                      class="w-10 h-10 rounded-lg object-cover border"
                      @error="handleSearchImageError"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium line-clamp-2">
                        {{ event.title }}
                      </div>
                      <div class="mt-1 text-xs text-muted-foreground">
                        {{ event.subtitle }}
                      </div>
                      <div class="mt-2 text-xs font-semibold text-foreground">
                        {{ event.chanceText }}
                      </div>
                    </div>
                  </div>
                </button>

                <div
                  v-if="!marketSearchLoading && searchEventResults.length === 0"
                  class="text-sm text-muted-foreground"
                >
                  Search for an event to view its markets.
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

            <div
              class="border rounded-lg overflow-hidden min-h-0 flex flex-col"
            >
              <div
                class="border-b px-4 py-3 flex items-center justify-between gap-3"
              >
                <div>
                  <div class="text-sm font-medium">
                    {{ selectedSearchEvent?.title ?? "Markets" }}
                  </div>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ selectedSearchEvent?.markets?.length ?? 0 }} market{{
                      (selectedSearchEvent?.markets?.length ?? 0) === 1
                        ? ""
                        : "s"
                    }}
                    available
                  </p>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto p-4 space-y-3">
                <div
                  v-if="!selectedSearchEvent"
                  class="h-full flex items-center justify-center text-sm text-muted-foreground"
                >
                  Select an event to view and add its markets.
                </div>

                <div
                  v-for="market in selectedSearchEvent?.markets ?? []"
                  :key="market.id"
                  class="rounded-lg border p-4 grid gap-3"
                  :class="
                    isSearchMarketSelected(selectedSearchEvent, market)
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  "
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <div class="text-sm font-semibold line-clamp-2">
                        {{
                          (market.groupItemTitle ?? "").trim() ||
                          market.question ||
                          "Market"
                        }}
                      </div>
                      <p
                        class="mt-1 text-xs text-muted-foreground line-clamp-2"
                      >
                        {{
                          computeChance(market).subtitle ||
                          selectedSearchEvent?.title ||
                          ""
                        }}
                      </p>
                      <a
                        :href="toPolymarketMarketUrl(market)"
                        target="_blank"
                        rel="noreferrer"
                        class="mt-2 inline-block text-xs text-primary underline-offset-4 hover:underline"
                      >
                        Open on Polymarket
                      </a>
                    </div>

                    <div
                      class="text-sm font-semibold whitespace-nowrap text-right"
                    >
                      <div>{{ computeChance(market).text }}</div>
                      <div
                        v-if="
                          isSearchMarketSelected(selectedSearchEvent, market)
                        "
                        class="mt-1 text-xs font-medium text-primary"
                      >
                        Selected
                      </div>
                    </div>
                  </div>

                  <div class="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      class="h-full bg-primary"
                      :style="{ width: computeChance(market).pct + '%' }"
                    />
                  </div>

                  <div
                    class="grid gap-2 sm:grid-cols-[minmax(0,220px)_auto] sm:items-end"
                  >
                    <div class="grid gap-1">
                      <Label class="text-xs">Outcome</Label>
                      <Select
                        :model-value="
                          getSearchOutcomeSelection(selectedSearchEvent, market)
                        "
                        @update:model-value="
                          (value) =>
                            selectedSearchEvent &&
                            setSearchOutcomeSelection(
                              selectedSearchEvent,
                              market,
                              String(value ?? ''),
                            )
                        "
                      >
                        <SelectTrigger class="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="both">Yes and No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div class="flex justify-end gap-2">
                      <Button
                        v-if="
                          isSearchMarketSelected(selectedSearchEvent, market)
                        "
                        variant="outline"
                        @click="
                          selectedSearchEvent &&
                          handleRemoveSearchMarket(selectedSearchEvent, market)
                        "
                      >
                        Remove
                      </Button>
                      <Button
                        v-else
                        :disabled="
                          (!canAddMoreInsightsMarkets && isInsightsMode) ||
                          !selectedSearchEvent
                        "
                        @click="
                          selectedSearchEvent &&
                          handleAssignSearchMarket(selectedSearchEvent, market)
                        "
                      >
                        Add market
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  PolymarketGammaPagination,
  PolymarketGammaSearchEvent,
  PolymarketGammaSearchMarket,
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
  chancePct: number;
  chanceText: string;
  image: string;
  event: PolymarketGammaSearchEvent;
};

type MarketChanceInfo = {
  pct: number;
  text: string;
  subtitle: string;
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
  isCombinedCompareChartDisabled: boolean;
  compareChartLoading: boolean;
  insightsGenerateChartLabel: string;
  compareChartDataLength: number;
  isCompareNotebookActionDisabled: boolean;
  compareSaveLoading: boolean;
  compareNotebookActionLabel: string;
  compareFilenameDialogOpen: boolean;
  compareFilenameInput: string;
  compareFilenameError: string | null;
  compareCanGoToNotebooks: boolean;
  compareChartError: string | null;
  compareSaveError: string | null;
  compareSaveSuccessPath: string;
  legs: LegState[];
  activeLegIndex: number;
  activeLeg: LegState | null;
  activeLegLoading: boolean;
  quickAddMarketUrl: string;
  canQuickAddMarket: boolean;
  canAddMoreInsightsMarkets: boolean;
  showExportMarketList: boolean;
  marketSearchDialogOpen: boolean;
  marketSearchQuery: string;
  marketSearchLoading: boolean;
  marketSearchLoadingMore: boolean;
  marketSearchError: string | null;
  marketSearchPagination: PolymarketGammaPagination | null;
  searchEventResults: SearchEventCardItem[];
  selectedSearchEvent: PolymarketGammaSearchEvent | null;
  defaultCombinedCompareNotebookFilename: () => string;
  handleViewCombinedCompareChart: () => void;
  openCombinedCompareChartPreview: () => void;
  handleDownloadCombinedCompareCsv: () => void;
  handleCombinedCompareNotebookAction: () => void;
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
  toggleExportMarketList: () => void;
  activeLegSelectedMarketLabel: (leg: LegState) => string;
  exportSelectAllState: (leg: LegState) => CheckboxModelValue;
  toggleAllExportMarkets: (leg: LegState, value: CheckboxModelValue) => void;
  toggleExportMarket: (
    leg: LegState,
    marketId: string,
    value: CheckboxModelValue,
  ) => void;
  handleViewChart: (leg: LegState) => void;
  openLegChartPreview: (leg: LegState) => void;
  handleDownloadExport: (leg: LegState) => void;
  runMarketSearch: () => void;
  selectSearchEvent: (event: PolymarketGammaSearchEvent) => void;
  handleSearchImageError: (event: Event) => void;
  isSearchMarketSelected: (
    event: PolymarketGammaSearchEvent | null,
    market: PolymarketGammaSearchMarket,
  ) => boolean;
  computeChance: (market: PolymarketGammaSearchMarket) => MarketChanceInfo;
  toPolymarketMarketUrl: (market: PolymarketGammaSearchMarket) => string;
  getSearchOutcomeSelection: (
    event: PolymarketGammaSearchEvent | null,
    market: PolymarketGammaSearchMarket,
  ) => SearchOutcomeSelection;
  setSearchOutcomeSelection: (
    event: PolymarketGammaSearchEvent | null,
    market: PolymarketGammaSearchMarket,
    value: string,
  ) => void;
  handleRemoveSearchMarket: (
    event: PolymarketGammaSearchEvent,
    market: PolymarketGammaSearchMarket,
  ) => void;
  handleAssignSearchMarket: (
    event: PolymarketGammaSearchEvent,
    market: PolymarketGammaSearchMarket,
  ) => void;
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
