import type { SignInResponse } from "@/models/Auth";
import { useAuthStore } from "../store/authStore";

import {
  API_BASE_URL,
  REFRESH_TOKEN_URL,
  SIGN_IN_URL,
  SIGN_UP_URL,
} from "./constants";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) {
    return window.location.replace(SIGN_IN_URL);
  }

  options.headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  options.credentials = "include";

  const response = await fetch(url, options);

  if (response.status === 401) {
    try {
      const refreshResponse = await fetch(
        `${API_BASE_URL}${REFRESH_TOKEN_URL}`,
        {
          method: "POST",
          credentials: "include",
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
        return fetch(url, options);
      } else {
        authStore.clearToken();
        console.error("Token refresh failed.");
        // return window.location.replace(SIGN_IN_URL);
      }
    } catch (err) {
      console.error("Error refreshing token", err);
      authStore.clearToken();
      console.error("Token refresh failed.");
      // return window.location.replace(SIGN_IN_URL);
    }
  }

  return response;
}

export async function signIn(
  data: Record<string, unknown>
): Promise<SignInResponse> {
  const authStore = useAuthStore();
  try {
    const response = await fetch(`${API_BASE_URL}${SIGN_IN_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    const responseData: SignInResponse | { data: string } =
      await response.json();
    console.log("Sign-in response:", response);
    if (!response.ok) {
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
      console.log(responseData);
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

// first_name: string;
// email: string;
// username: string;
// password: string;
// }) => {
//   const res = await .post("sign-up", data);
//   console.log("Sign-up response:", res);
//   if (res.status !== 201) throw new Error("Sign-up failed");
//   return res.data;

type SignUpData = {
  first_name: string;
  email: string;
  username: string;
  password: string;
};
export const signUpApi = async (data: SignUpData) => {
  const response = await fetch(`${API_BASE_URL}${SIGN_UP_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Sign-up failed");
  }

  return response.json();
};
