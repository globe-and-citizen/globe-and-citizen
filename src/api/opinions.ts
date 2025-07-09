import { fetchWithAuth } from "./auth";
import { API_BASE_URL, ENTRIES_URL } from "./constants";

export type OpinionPatchPayload = {
  opinionId: string;
  opinion: {
    title: string;
    content: string;
    url_to_image?: string;
  };
};

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
