import type { FetchNewsEverythingParams } from "@/api/news";

export type LiveFeedConfig = Pick<
  FetchNewsEverythingParams,
  "q" | "sortBy" | "pageSize" | "language"
>;

export type LiveFeedSortBy = NonNullable<FetchNewsEverythingParams["sortBy"]>;

export type NormalizedLiveFeedConfig = {
  q: string;
  sortBy: LiveFeedSortBy;
  pageSize: number;
  language: string;
};

export type TruthSocialPost = {
  id: string | null;
  text: string;
  createdAt: string | null;
  url: string | null;
  imageUrl: string | null;
};
