import { API_BASE_URL } from "@/api/constants.ts";
import type { NewsApiResponse } from "@/models/News";
import { fetchWithAuth } from "@/api/auth.ts";

export async function fetchNewsApi(): Promise<{ data: NewsApiResponse }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/news-api`);
    if (!response) {
      throw new Error(`Error fetching posts`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
}
