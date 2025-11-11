import type { AllNewsResponseType, FetchPostsType } from "@/models/Posts";
import { fetchWithAuth } from "./auth";
import { API_BASE_URL, ENTRIES_URL } from "./constants";
import type { OpinionPatchPayload, OpinionPayload } from "@/models/Opinions";

export async function patchOpinion(
  payload: OpinionPatchPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${ENTRIES_URL}/${payload.opinionId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload.opinion),
      }
    );

    if (!response) {
      throw new Error(`Error updating news article: ${response}`);
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error updating opinion:", error);
    throw error;
  }
}

export async function addOpinion(
  payload: OpinionPayload
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${ENTRIES_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response || !response.ok) {
      if (response.status === 409) {
        throw new Error("Opinion with this title already exists");
      }
      throw new Error(`Error adding news opinion: ${response}`);
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error adding opinion:", error);
    throw error;
  }
}

export async function deleteOpinion(
  opinionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${ENTRIES_URL}/${opinionId}`,
      {
        method: "DELETE",
      }
    );

    if (!response) {
      throw new Error(
        `Error deleting opinion with id ${opinionId} : ${response}`
      );
    }

    return { success: true, message: "Article deleted successfully" };
  } catch (error) {
    console.error("Error deleting news article:", error);
    throw error;
  }
}

export async function getUsersArticles(
  size: number,
  page: number
): Promise<FetchPostsType> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/profile/my-articles?size=${size}&page=${page}`
    );

    if (!response) {
      throw new Error(`Error fetching user's articles: ${response}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user's articles:", error);
    throw error;
  }
}

export async function fetchAllOpinions(
  size: number,
  page: number
): Promise<AllNewsResponseType> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${ENTRIES_URL}?size=${size}&page=${page}`
    );

    if (!response) {
      throw new Error(`Error fetching opinions: ${response}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching opinions:", error);
    throw error;
  }
}
