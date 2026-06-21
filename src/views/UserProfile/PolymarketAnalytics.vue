<template>
  <div class="w-full min-w-0 space-y-6">
    <section
      class="rounded-[28px] border border-slate-200 bg-white/90 shadow-sm overflow-hidden"
    >
      <div
        class="border-b border-slate-200 bg-[linear-gradient(135deg,#fff7ed,transparent_55%),linear-gradient(180deg,#ffffff,#f8fafc)] px-6 py-6 md:px-8"
      >
        <div
          class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between"
        >
          <div class="max-w-3xl space-y-3">
            <div
              class="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              <span>Polymarket Analytics</span>
              <span class="h-px w-12 bg-slate-300" />
              <span>Market Insights</span>
            </div>
            <div class="space-y-2">
              <h1
                class="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl"
              >
                Build charts, export price history, and queue notebook data from
                the start.
              </h1>
              <p
                class="max-w-2xl text-sm leading-6 text-slate-600 md:text-base"
              >
                The analytics page now opens directly into the Market Insights
                workspace. Paste a market URL or use the search modal to add
                markets, compare them, export CSVs, and send JSON payloads to
                JupyterLite.
              </p>
            </div>
          </div>

          <div
            class="grid gap-3 text-sm text-slate-600 sm:grid-cols-3 xl:min-w-[420px]"
          >
            <div
              class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
            >
              <div
                class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Entry Points
              </div>
              <div class="mt-2 font-medium text-slate-900">
                Paste URL or search
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
            >
              <div
                class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Output
              </div>
              <div class="mt-2 font-medium text-slate-900">
                Charts and CSV export
              </div>
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
            >
              <div
                class="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500"
              >
                Notebook Flow
              </div>
              <div class="mt-2 font-medium text-slate-900">
                Queue directly to JupyterLite
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 py-4 md:px-6 md:py-6 xl:px-8">
        <PolymarketAlertWizardModal
          :is-open="true"
          variant="insights"
          embedded
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import PolymarketAlertWizardModal from "@/components/PolymarketAlertWizardModal.vue";
</script>

<!-- Response example: -->
<!-- {
    "events": [
        {
            "id": "902823",
            "ticker": "mississippi-gubernatorial-election-presley-d-vs-reeves-r",
            "slug": "mississippi-gubernatorial-election-presley-d-vs-reeves-r",
            "title": "Mississippi gubernatorial election: Presley (D) vs. Reeves (R)",
            "description": "This market will resolve to \"Presley\" if Brandon Presley (D) wins the 2023 Mississippi gubernatorial election, scheduled for November 7, 2023. This market will resolve to \"Reeves\" if Tate Reeves (R) wins.\n\nDetermination of the winner of the 2023 U.S. Gubernatorial election for Mississippi will be based on a consensus of credible reporting, or if there is ambiguity, the final state election authority certification or other final official determination of the 2023 election results.\n",
            "resolutionSource": "",
            "startDate": "2023-11-06T16:28:08.892Z",
            "creationDate": "2023-11-06T16:29:08.874Z",
            "endDate": "2023-11-07T00:00:00Z",
            "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
            "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
            "active": true,
            "closed": true,
            "archived": false,
            "new": false,
            "featured": false,
            "restricted": true,
            "liquidity": 0,
            "volume": 60047.36,
            "openInterest": 0,
            "sortBy": "ascending",
            "published_at": "2023-11-06 15:52:14.532+00",
            "createdAt": "2023-11-06T15:52:14.553Z",
            "updatedAt": "2024-03-22T02:05:00.039465Z",
            "commentsEnabled": false,
            "competitive": 0,
            "volume24hr": 0,
            "volume1wk": 0,
            "volume1mo": 0,
            "volume1yr": 0,
            "enableOrderBook": true,
            "liquidityAmm": 0,
            "liquidityClob": 0,
            "commentCount": 17,
            "markets": [
                {
                    "id": "252944",
                    "question": "Mississippi gubernatorial election: Presley (D) vs. Reeves (R)",
                    "conditionId": "0xf14e0571c287e3c5eeec66870481433a44c5e3cb8f58a65949ea5c2741e76bd1",
                    "slug": "mississippi-gubernatorial-election-presley-d-vs-reeves-r",
                    "resolutionSource": "",
                    "endDate": "2023-11-07T00:00:00Z",
                    "liquidity": "0",
                    "startDate": "2023-11-06T16:28:08.892Z",
                    "fee": "20000000000000000",
                    "image": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
                    "icon": "https://polymarket-upload.s3.us-east-2.amazonaws.com/mississippi+flag.png",
                    "description": "This market will resolve to \"Presley\" if Brandon Presley (D) wins the 2023 Mississippi gubernatorial election, scheduled for November 7, 2023. This market will resolve to \"Reeves\" if Tate Reeves (R) wins.\n\nDetermination of the winner of the 2023 U.S. Gubernatorial election for Mississippi will be based on a consensus of credible reporting, or if there is ambiguity, the final state election authority certification or other final official determination of the 2023 election results.\n",
                    "outcomes": "[\"Presley\", \"Reeves\"]",
                    "outcomePrices": "[\"0\", \"1\"]",
                    "volume": "60047.359488999995",
                    "active": true,
                    "marketType": "normal",
                    "closed": true,
                    "marketMakerAddress": "0x6727477E334D408ABb296aa77849E93EDDb0C7a3",
                    "createdAt": "2023-11-06T15:52:14.432Z",
                    "updatedAt": "2023-11-09T07:37:06.065Z",
                    "closedTime": "2023-11-08 07:31:57+00",
                    "wideFormat": false,
                    "new": false,
                    "featured": false,
                    "submitted_by": "0x91430CaD2d3975766499717fA0D66A78D814E5c5",
                    "archived": false,
                    "resolvedBy": "0x6A9D222616C90FcA5754cd1333cFD9b7fb6a4F74",
                    "restricted": true,
                    "groupItemTitle": "",
                    "groupItemThreshold": "1",
                    "questionID": "0x922f8ecc497e1acd2a8bdf73480b49dc1bc01698bf7629fc0456a36abf7a3f73",
                    "umaEndDate": "2023-11-08 07:31:57+00",
                    "enableOrderBook": true,
                    "orderPriceMinTickSize": 0.001,
                    "orderMinSize": 15,
                    "umaResolutionStatus": "resolved",
                    "volumeNum": 60047.36,
                    "liquidityNum": 0,
                    "endDateIso": "2023-11-07",
                    "hasReviewedDates": true,
                    "commentsEnabled": false,
                    "volume24hr": 0,
                    "volume1wk": 0,
                    "volume1mo": 0,
                    "volume1yr": 0,
                    "secondsDelay": 0,
                    "clobTokenIds": "[\"43735023623900024791146956633079370045432897358751435677478808157851759523429\", \"12941124133417887652930382933598877689007346826929399000183212708140674229827\"]",
                    "umaBond": "500.0",
                    "umaReward": "5.0",
                    "fpmmLive": true,
                    "volume24hrAmm": 0,
                    "volume1wkAmm": 0,
                    "volume1moAmm": 0,
                    "volume1yrAmm": 0,
                    "volume24hrClob": 0,
                    "volume1wkClob": 0,
                    "volume1moClob": 0,
                    "volume1yrClob": 0,
                    "volumeAmm": 0,
                    "volumeClob": 60047.36,
                    "liquidityAmm": 0,
                    "liquidityClob": 0,
                    "makerBaseFee": 0,
                    "takerBaseFee": 0,
                    "customLiveness": 0,
                    "acceptingOrders": true,
                    "notificationsEnabled": true,
                    "creator": "",
                    "ready": false,
                    "funded": false,
                    "cyom": false,
                    "competitive": 0,
                    "pagerDutyNotificationEnabled": false,
                    "approved": true,
                    "rewardsMinSize": 0,
                    "rewardsMaxSpread": 0,
                    "spread": 1,
                    "oneDayPriceChange": 0,
                    "oneHourPriceChange": 0,
                    "oneWeekPriceChange": 0,
                    "oneMonthPriceChange": 0,
                    "oneYearPriceChange": 0,
                    "lastTradePrice": 0,
                    "bestBid": 0,
                    "bestAsk": 1,
                    "clearBookOnStart": true,
                    "manualActivation": false,
                    "negRiskOther": false,
                    "umaResolutionStatuses": "[]",
                    "pendingDeployment": false,
                    "deploying": false,
                    "rfqEnabled": false,
                    "holdingRewardsEnabled": false,
                    "feesEnabled": false,
                    "requiresTranslation": false
                }
            ],
            "tags": [
                {
                    "id": "2",
                    "label": "Politics",
                    "slug": "politics",
                    "forceShow": false,
                    "publishedAt": "2023-10-25 18:55:50.674+00",
                    "updatedBy": 13,
                    "createdAt": "2023-10-25T18:55:50.681Z",
                    "updatedAt": "2025-12-18T02:24:23.994313Z",
                    "forceHide": true,
                    "requiresTranslation": false
                },
                {
                    "id": "339",
                    "label": "election",
                    "slug": "election",
                    "publishedAt": "2023-11-02 21:58:12.334+00",
                    "updatedBy": 15,
                    "createdAt": "2023-11-02T21:58:12.348Z",
                    "updatedAt": "2025-12-18T02:43:57.885753Z",
                    "forceHide": true,
                    "requiresTranslation": false
                },
                {
                    "id": "460",
                    "label": "mississippi",
                    "slug": "mississippi",
                    "publishedAt": "2023-11-06 15:52:26.608+00",
                    "createdAt": "2023-11-06T15:52:26.623Z",
                    "updatedAt": "2025-12-18T02:17:04.998776Z",
                    "requiresTranslation": false
                },
                {
                    "id": "459",
                    "label": "democrat",
                    "slug": "democrat",
                    "publishedAt": "2023-11-06 15:52:24.906+00",
                    "createdAt": "2023-11-06T15:52:24.998Z",
                    "updatedAt": "2025-12-18T02:16:58.744892Z",
                    "requiresTranslation": false
                },
                {
                    "id": "461",
                    "label": "gubernatorial race",
                    "slug": "gubernatorial-race",
                    "publishedAt": "2023-11-06 15:52:27.11+00",
                    "createdAt": "2023-11-06T15:52:27.119Z",
                    "updatedAt": "2025-12-18T02:17:07.980679Z",
                    "requiresTranslation": false
                },
                {
                    "id": "100215",
                    "label": "All",
                    "slug": "all",
                    "forceShow": false,
                    "updatedAt": "2025-12-18T03:27:54.040735Z",
                    "requiresTranslation": false
                }
            ],
            "cyom": false,
            "closedTime": "2023-11-08T07:31:57Z",
            "showAllOutcomes": false,
            "showMarketImages": true,
            "enableNegRisk": false,
            "negRiskAugmented": false,
            "pendingDeployment": false,
            "deploying": false,
            "requiresTranslation": false
        }, -->
