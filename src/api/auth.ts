import type { SignInResponse } from "@/models/Auth";
import { useAuthStore } from "../store/authStore";
import { toast, type ToastOptions } from "vue3-toastify";

import {
  API_BASE_URL,
  REFRESH_TOKEN_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
} from "./constants";
import * as interceptorWasm from "layer8-interceptor-production";
import { traceUser } from "./user";

export async function interceptorFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return (await interceptorWasm.fetch(url, options)) as Response;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authStore = useAuthStore();
  const token = authStore.token;
  const refreshToken = authStore.refreshToken;

  if (!token) {
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.replace(SIGN_IN_URL);
    throw new Error("Redirecting to sign-in page");
  }

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  options.credentials = "include";

  const response = (await interceptorFetch(url, options)) as Response;

  if (response.status === 401) {
    try {
      const refreshResponse = await interceptorFetch(
        `${API_BASE_URL}${REFRESH_TOKEN_URL}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newToken = data.data.token;

        authStore.setToken(newToken);

        options.headers = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        };

        return (await interceptorFetch(url, options)) as Response;
      } else {
        authStore.clearToken();
        window.location.replace("/");
      }
    } catch (err) {
      console.error("Error refreshing token", err);
      authStore.clearToken();
      console.error("Token refresh failed.");
    }
  }

  return response as Response;
}

export async function signIn(
  data: Record<string, unknown>
): Promise<SignInResponse> {
  const authStore = useAuthStore();
  try {
    const response = await interceptorFetch(`${API_BASE_URL}${SIGN_IN_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    const responseData: SignInResponse | { data: string } =
      await response.json();

    if (!response.ok) {
      toast(responseData.data ?? "Sign-in failed", {
        autoClose: 4000,
        type: "error",
        position: toast.POSITION.BOTTOM_RIGHT,
      } as ToastOptions);

      throw new Error(
        typeof responseData.data === "string"
          ? responseData.data
          : "Sign-in failed"
      );
    }
    if (
      typeof responseData.data === "object" &&
      responseData.data !== null &&
      "token" in responseData.data &&
      "user" in responseData.data
    ) {
      authStore.setToken(responseData.data.token);
      authStore.setUser(responseData.data.user);
      authStore.setRefreshToken(responseData.data.refresh_token);
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        window.location.href = redirectUrl;
        sessionStorage.removeItem("redirectAfterLogin");
      } else {
        window.location.href = "/";
      }

      // Trace user location after sign-in
      try {
        const userLocation = await traceUser();
        if (userLocation?.country_long) {
          authStore.setTrackedLocation(userLocation.country_long);
        }
      } catch (err) {
        console.error("Failed to trace user after sign-in", err);
      }

      return responseData as SignInResponse;
    } else {
      throw new Error(
        typeof responseData.data === "string"
          ? responseData.data
          : "Sign-in failed"
      );
    }
  } catch (error) {
    console.error("Sign-in failed:", error);
    throw error;
  }
}

type SignUpData = {
  username: string;
  password: string;
};
export const signUpApi = async (data: SignUpData) => {
  const response = await interceptorFetch(`${API_BASE_URL}${SIGN_UP_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.data || errorData.error || "Sign-up failed");
  }

  return response.json();
};
