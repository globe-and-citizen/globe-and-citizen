import { API_BASE_URL, COMMENTS_URL } from "./constants";
import { useAuthStore } from "../store/authStore";
import { fetchWithAuth } from "./auth";

export async function createComment(
  postId: string,
  content: string,
  type: "post" | "opinion"
): Promise<void> {
  const authStore = useAuthStore();
  const body =
    type === "post"
      ? JSON.stringify({ post_id: postId, content })
      : JSON.stringify({ entry_id: postId, content });

  // If user is authenticated, use fetchWithAuth which handles token refresh
  if (authStore.isUserAuthenticated && authStore.token) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${COMMENTS_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
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

export async function deleteComment(commentId: number): Promise<void> {
  const authStore = useAuthStore();

  if (!authStore.isUserAuthenticated || !authStore.token) {
    throw new Error("You must be authenticated to delete a comment");
  }

  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${COMMENTS_URL}/${commentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response && !response.ok) {
      throw new Error(`Error deleting comment: ${response.statusText}`);
    }

    return;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}
