import { defineStore } from "pinia";

export interface NewOpinionStoreInterface {
  postId: number | undefined;
  title: string | undefined;
  postSlug: string | undefined;
  setPost: (post: {
    id: number | undefined;
    title: string | undefined;
    slug: string | undefined;
  }) => void;
  getPost: () => {
    id: number | undefined;
    title: string | undefined;
    slug: string | undefined;
  };
}

export const useNewOpinionStore = defineStore("newOpinionStore", {
  state: (): NewOpinionStoreInterface => ({
    postId: undefined,
    title: undefined,
    postSlug: undefined,
    setPost: () => ({ id: undefined, title: undefined, slug: undefined }),
    getPost: () => ({ id: undefined, title: undefined, slug: undefined }),
  }),
  persist: true,
  actions: {
    setPost({
      id,
      title,
      slug,
    }: {
      id: number | undefined;
      title: string | undefined;
      slug: string | undefined;
    }): void {
      this.postId = id;
      this.title = title;
      this.postSlug = slug;
    },
    resetPost(): void {
      this.postId = undefined;
      this.title = undefined;
      this.postSlug = undefined;
    },
  },
  getters: {
    getPost(): {
      id: number | undefined;
      title: string | undefined;
      slug: string | undefined;
    } {
      return {
        id: this.postId,
        title: this.title,
        slug: this.postSlug,
      };
    },
  },
});
