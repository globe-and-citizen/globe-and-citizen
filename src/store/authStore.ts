import { type UserType } from "@/models/Auth";
import { defineStore } from "pinia";

export interface AuthStoreInterface {
  user: UserType | undefined;
  token: string | undefined;
  refreshToken: string | undefined;
  isUserAuthenticated: boolean;
  isInitialized: boolean;
  userLocation: string;
  trackedLocation: string;
  setUser: (user: UserType) => void;
  setTrackedLocation: (location: string) => void;
  logout: () => void;
}

export const useAuthStore = defineStore("authStore", {
  state: (): AuthStoreInterface => ({
    user: undefined,
    token: undefined,
    refreshToken: undefined,
    userLocation: "",
    trackedLocation: "",
    isUserAuthenticated: false,
    isInitialized: false,
    setUser: (): void => {},
    setTrackedLocation: (): void => {},
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

    setTrackedLocation(location: string): void {
      this.trackedLocation = location;
    },

    setToken(token: string): void {
      this.token = token;
      if (this.user?.id) {
        this.isUserAuthenticated = true;
      }
    },

    setRefreshToken(refreshToken: string): void {
      this.refreshToken = refreshToken;
    },

    clearToken(): void {
      this.token = undefined;
      this.user = undefined;
      this.refreshToken = undefined;
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
