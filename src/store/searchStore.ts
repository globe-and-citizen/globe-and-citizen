// store/searchStore.ts
import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", {
  state: () => ({
    query: "",
  }),
  actions: {
    setQuery(newQuery: string) {
      this.query = newQuery;
    },
  },
});
