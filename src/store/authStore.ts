import { type UserType } from "./../models/Auth/index";
import { defineStore } from "pinia";

export interface AuthStoreInterface {
  user: UserType | undefined;
  token: string | undefined;
  isUserAuthenticated: boolean;
  isInitialized: boolean;

  setUser: (user: UserType) => void;
  logout: () => void;
}

export const useAuthStore = defineStore("authStore", {
  state: (): AuthStoreInterface => ({
    user: undefined,
    token: undefined,
    isUserAuthenticated: false,
    isInitialized: false,
    setUser: (): void => {},
    logout: (): void => {},
  }),

  persist: true,

  actions: {
    setUser(user: UserType): void {
      this.user = user;
    },

    setToken(token: string): void {
      this.token = token;
    },

    clearToken(): void {
      this.token = undefined;
      this.user = undefined;
    },

    logout(): void {
      this.clearToken();
      this.isUserAuthenticated = false;
    },

    initializeAuth(): void {
      if (this.token && this.user?.id) {
        this.isUserAuthenticated = true;
      }
      this.isInitialized = true;
    },
  },
});
