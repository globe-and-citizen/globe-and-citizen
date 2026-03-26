<template>
  <section class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
    <header class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 class="font-mono text-sm font-bold uppercase tracking-wide text-base-content/80">
          {{ title }}
        </h3>
        <p class="text-xs text-base-content/60">{{ subtitle }}</p>
      </div>
      <span
        class="badge badge-sm"
        :class="rows.asks.length || rows.bids.length ? 'badge-success' : 'badge-neutral'"
      >
        {{
          rows.asks.length || rows.bids.length
            ? `${rows.asks.length + rows.bids.length} levels`
            : 'WAITING'
        }}
      </span>
    </header>

    <div v-if="!tokenId" class="rounded-md border border-base-300 bg-base-200 px-3 py-2">
      <p class="font-mono text-xs text-base-content/70">
        Select an outcome token to view snapshot.
      </p>
    </div>

    <div
      v-else-if="!rows.asks.length && !rows.bids.length"
      class="rounded-md border border-base-300 bg-base-200 px-3 py-2"
    >
      <p class="font-mono text-xs text-base-content/70">
        Waiting for orderbook levels from websocket…
      </p>
    </div>

    <div v-else class="space-y-3">
      <div
        class="grid grid-cols-4 gap-2 border-b border-base-300 pb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-base-content/60"
      >
        <span>Side</span>
        <span class="text-right">Price</span>
        <span class="text-right">Shares</span>
        <span class="text-right">Total</span>
      </div>

      <div class="max-h-40 overflow-y-auto pr-1">
        <div class="space-y-1">
          <div
            v-for="(ask, index) in rows.asks"
            :key="`ask-${index}-${ask.price}-${ask.size}`"
            class="grid grid-cols-4 gap-2 font-mono text-xs"
          >
            <span class="badge badge-error badge-xs w-fit">Ask</span>
            <span class="text-right text-error">{{ toCentsLabel(ask.price) }}</span>
            <span class="text-right">{{ toNumberLabel(ask.size) }}</span>
            <span class="text-right">{{ toDollarLabel(ask.price * ask.size) }}</span>
          </div>
        </div>
      </div>

      <div
        class="grid grid-cols-4 items-center border-y border-base-300 bg-base-100 px-2 py-2 font-mono text-xs font-semibold text-base-content/70"
      >
        <div>Last: {{ toCentsLabel(summary.lastTradePrice) }}</div>
        <div class="text-right">Spread: {{ toCentsLabel(summary.spread) }}</div>
        <div />
        <div />
      </div>

      <div class="max-h-40 overflow-y-auto pr-1">
        <div class="space-y-1">
          <div
            v-for="(bid, index) in rows.bids"
            :key="`bid-${index}-${bid.price}-${bid.size}`"
            class="grid grid-cols-4 gap-2 font-mono text-xs"
          >
            <span class="badge badge-success badge-xs w-fit">Bid</span>
            <span class="text-right text-success">{{ toCentsLabel(bid.price) }}</span>
            <span class="text-right">{{ toNumberLabel(bid.size) }}</span>
            <span class="text-right">{{ toDollarLabel(bid.price * bid.size) }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Level = {
  price: number
  size: number
}

const props = withDefaults(
  defineProps<{
    title: string
    subtitle: string
    tokenId?: string
    book?: Record<string, unknown>
  }>(),
  {
    tokenId: '',
    book: () => ({}),
  },
)

const parseLevels = (levels: unknown): Level[] => {
  if (!Array.isArray(levels)) return []

  return levels
    .map((level): Level | null => {
      if (Array.isArray(level)) {
        const price = Number(level[0])
        const size = Number(level[1])
        if (!Number.isFinite(price) || !Number.isFinite(size)) return null
        return { price, size }
      }

      if (typeof level === 'object' && level !== null) {
        const row = level as { price?: number | string; size?: number | string }
        const price = Number(row.price)
        const size = Number(row.size)
        if (!Number.isFinite(price) || !Number.isFinite(size)) return null
        return { price, size }
      }

      return null
    })
    .filter((value): value is Level => value !== null)
}

const rows = computed(() => {
  const asks = parseLevels(props.book?.asks).sort((a, b) => b.price - a.price)
  const bids = parseLevels(props.book?.bids).sort((a, b) => b.price - a.price)

  return {
    asks,
    bids,
  }
})

const summary = computed(() => {
  const directBestBid = Number(props.book?.best_bid)
  const directBestAsk = Number(props.book?.best_ask)
  const directLastTrade = Number(props.book?.last_trade_price ?? props.book?.price)

  const bid = Number.isFinite(directBestBid)
    ? directBestBid
    : rows.value.bids.length
      ? rows.value.bids[0].price
      : null
  const ask = Number.isFinite(directBestAsk)
    ? directBestAsk
    : rows.value.asks.length
      ? rows.value.asks[rows.value.asks.length - 1].price
      : null
  const lastTradePrice = Number.isFinite(directLastTrade)
    ? directLastTrade
    : bid !== null && ask !== null
      ? (bid + ask) / 2
      : null

  return {
    spread: bid !== null && ask !== null ? ask - bid : null,
    lastTradePrice,
  }
})

const toCentsLabel = (value: number | null) => {
  if (!Number.isFinite(value)) return '—'

  const normalized = Number(value)
  if (normalized >= 0 && normalized <= 1) {
    return `${Math.round(normalized * 100)}¢`
  }

  return `${normalized.toFixed(4)}`
}

const toNumberLabel = (value: number | null) => {
  if (!Number.isFinite(value)) return '—'
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

const toDollarLabel = (value: number | null) => {
  if (!Number.isFinite(value)) return '—'
  return Number(value).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>
