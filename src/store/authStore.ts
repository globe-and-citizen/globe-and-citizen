import { type UserType } from "@/models/Auth";
import { defineStore } from "pinia";

export interface AuthStoreInterface {
  user: UserType | undefined;
  token: string | undefined;
  isUserAuthenticated: boolean;
  isInitialized: boolean;
  userLocation: string;
  setUser: (user: UserType) => void;
  logout: () => void;
}

export const useAuthStore = defineStore("authStore", {
  state: (): AuthStoreInterface => ({
    user: undefined,
    token: undefined,
    userLocation: "",
    isUserAuthenticated: false,
    isInitialized: false,
    setUser: (): void => {},
    logout: (): void => {},
  }),

  persist: true,

  actions: {
    setUser(user: UserType): void {
      this.user = user;
      if (this.token) {
        this.isUserAuthenticated = true;
      }
    },

    setUserLocation(location: string): void {
      this.userLocation = location;
    },

    setToken(token: string): void {
      this.token = token;
      if (this.user?.id) {
        this.isUserAuthenticated = true;
      }
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
      } else {
        this.isUserAuthenticated = false;
      }
      this.isInitialized = true;
    },
  },
});
