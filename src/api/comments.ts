import { API_BASE_URL, COMMENTS_URL } from "./constants";
import { useAuthStore } from "../store/authStore";
import { fetchWithAuth } from "./auth";

export async function createComment(
  postId: number,
  content: string
): Promise<void> {
  const authStore = useAuthStore();
  // If user is authenticated, use fetchWithAuth which handles token refresh
  if (authStore.isUserAuthenticated && authStore.token) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${COMMENTS_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          content,
        }),
      });

      // Check if we have a valid response (not redirected)
      if (response && !response.ok) {
        throw new Error(`Error creating comment: ${response.statusText}`);
      }

      if (response) {
        await response.json();
      }
      return;
    } catch (error) {
      console.error("Error creating authenticated comment:", error);
      // If token refresh failed, fall through to guest comment as fallback
    }
  }

  // Fall back to guest comment functionality if user is not authenticated
  const response = await fetch(`${API_BASE_URL}${COMMENTS_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      post_id: postId,
      content,
    }),
  });

  if (!response.ok) {
    throw new Error(`Error creating comment: ${response.statusText}`);
  }

  await response.json();
}
