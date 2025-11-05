import { defineStore } from "pinia";
import type { Post } from "../models/Posts";
import type { NewsApiSummaryPayload } from "@/api/news";

export type GlobalStore = {
  posts: Post[];
  setGeneratedPost: (post: NewsApiSummaryPayload) => void;
  generatedPost: NewsApiSummaryPayload | null;
  newsApiFilters: Record<string, unknown>;
};

export const useGlobalStore = defineStore("globalStore", {
  state: () =>
    ({
      posts: [] as Post[],
      generatedPost: null,
      newsApiFilters: {},
    } as GlobalStore),
  persist: true,
  getters: {
    getPosts: (state): Post[] => state.posts,
    getGeneratedPost: (state): NewsApiSummaryPayload | null =>
      state.generatedPost,
  },

  actions: {
    setGeneratedPost(post: NewsApiSummaryPayload) {
      this.generatedPost = post;
    },
    clearGeneratedPost() {
      this.generatedPost = null;
    },
    setNewsApiFilters(filters: Record<string, unknown>) {
      this.newsApiFilters = filters;
    },
  },
});
