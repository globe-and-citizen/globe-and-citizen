import { defineStore } from "pinia";
import axios from "axios";
import type { Post } from "../models/Posts";

export type GlobalStore = {
  posts: Post[];
  fetchPosts: () => Promise<Post[]>;
};

export const useGlobalStore = defineStore("globalStore", {
  state: () =>
    ({
      posts: [] as Post[],
    } as GlobalStore),
  persist: true,
  getters: {
    getPosts: (state): Post[] => state.posts,
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
  },
});
