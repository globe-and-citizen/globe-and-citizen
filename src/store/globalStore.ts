import { defineStore } from "pinia";
import axios from "axios";
import type { Post } from "../models/Posts";
import type { NewsApiSummaryPayload } from "@/api/news";

export type GlobalStore = {
  posts: Post[];
  fetchPosts: () => Promise<Post[]>;
  setGeneratedPost: (post: NewsApiSummaryPayload) => void;
  generatedPost: NewsApiSummaryPayload | null;
};

export const useGlobalStore = defineStore("globalStore", {
  state: () =>
    ({
      posts: [] as Post[],
      generatedPost: null,
    } as GlobalStore),
  persist: true,
  getters: {
    getPosts: (state): Post[] => state.posts,
    getGeneratedPost: (state): NewsApiSummaryPayload | null =>
      state.generatedPost,
  },

  actions: {
    async fetchPosts(): Promise<Post[]> {
      try {
        const response = await axios.get<{ posts: Post[] }>(
          "https://dummyjson.com/posts"
        );
        this.posts = response.data.posts;
        return this.posts;
      } catch (error) {
        console.error("Error fetching posts:", error);
        this.posts = [];
        return [];
      }
    },
    setGeneratedPost(post: NewsApiSummaryPayload) {
      this.generatedPost = post;
    },
    clearGeneratedPost() {
      this.generatedPost = null;
    },
  },
});
