import type { NormalizedLiveFeedConfig } from "./types";

export const LIVE_FEED_STORAGE_KEY = "live-feed-config-v1";
export const TRUMP_FEED_STORAGE_KEY = "live-feed-trump-feed-enabled-v1";
export const POLYMARKET_SCHEMA_ID = "polymarket-live-feed-jsonld";
export const TRUTH_SOCIAL_RAPIDAPI_HOST = "truth-social-api.p.rapidapi.com";
export const TRUTH_SOCIAL_RAPIDAPI_URL =
  "https://truth-social-api.p.rapidapi.com/users/realDonaldTrump/feed?limit=20";
export const FINLIGHT_API_KEY =
  import.meta.env.VITE_FINLIGHT_API_KEY ||
  "sk_cfeb8668a05f3b67c363940bf8becc950542946da65146f3fb0ca23153eeddfe";
export const TRUTH_SOCIAL_RAPIDAPI_KEY =
  import.meta.env.VITE_TRUTH_SOCIAL_RAPIDAPI_KEY ||
  "fa139787c9mshd6fc25851ce692ep1cc405jsna90c910532e4";

export const polymarketSchema = [
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Bitcoin Up or Down on April 29?",
    description: "Prediction market: Up 51% - Down 50% on Polymarket.",
    url: "https://polymarket.com/event/bitcoin-up-or-down-on-april-29-2026",
    publisher: {
      "@type": "Organization",
      name: "Polymarket",
      url: "https://polymarket.com",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Ethereum Up or Down on April 29?",
    description: "Prediction market: Up 49% - Down 52% on Polymarket.",
    url: "https://polymarket.com/event/ethereum-up-or-down-on-april-29-2026",
    publisher: {
      "@type": "Organization",
      name: "Polymarket",
      url: "https://polymarket.com",
    },
  },
] as const;

export const DEFAULT_LIVE_FEED_CONFIG: NormalizedLiveFeedConfig = {
  q: "bitcoin OR ethereum",
  sortBy: "publishedAt",
  pageSize: 20,
  language: "en",
};
