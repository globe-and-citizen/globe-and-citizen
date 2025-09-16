import { fetchWithAuth } from "./auth";
import { API_BASE_URL } from "./constants";

export async function getLayer8LoginUrl(): Promise<unknown> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/layer8-login-url`);

    if (!response) {
      throw new Error(`Error fetching layer8 url: ${response}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching layer8 login url:", error);
    throw error;
  }
}

export async function layer8Callback(code: string): Promise<unknown> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/authorization-callback`,
      {
        method: "POST",
        body: JSON.stringify({
          code,
        }),
      }
    );

    if (!response) {
      throw new Error(`Error fetching layer8 callback url: ${response}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching layer8 callback url:", error);
    throw error;
  }
}
