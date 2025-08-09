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

    if (!response) {
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
