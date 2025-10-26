import { API_BASE_URL } from "@/api/constants.ts";
import type { NewsApiResponse } from "@/models/News";
import { fetchWithAuth } from "@/api/auth.ts";

export async function fetchNewsApi({
  page = 1,
}: {
  page?: number;
}): Promise<{ data: NewsApiResponse }> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/news-api?page=${page}`
    );
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

export type NewsApiSummaryPayload = {
  author: string | null;
  content: string | null;
  description: string | null;
  publishedAt: string | null;
  source: string;
  title: string | null;
  url: string | null;
  urlToImage: string | null;
};

export async function generateNewsApiSummary(
  payload: NewsApiSummaryPayload
): Promise<{ success: boolean; data: NewsApiSummaryPayload }> {
  try {
    const response = await fetch(
      "https://n8n-g4mv.onrender.com/webhook/40a2cac2-7cae-44ee-b35a-7b694045375e",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response || !response.ok) {
      if (response.status === 409) {
        throw new Error("Opinion with this title already exists");
      }
      throw new Error(`Error adding news opinion: ${response}`);
    }

    const data = await response.json();

    return { success: true, data: data };
  } catch (error) {
    console.error("Error adding opinion:", error);
    throw error;
  }
}
