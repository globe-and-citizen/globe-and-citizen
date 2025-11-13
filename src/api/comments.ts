import { API_BASE_URL, COMMENTS_URL, POSTS_URL } from "./constants";
import { useAuthStore } from "../store/authStore";
import { fetchWithAuth, interceptorFetch } from "./auth";

export async function createComment(
  postId: string,
  content: string,
  type: "post" | "opinion",
  parentId?: number
): Promise<void> {
  const authStore = useAuthStore();
  const body =
    type === "post"
      ? JSON.stringify({ post_id: postId, content, parent_id: parentId })
      : JSON.stringify({ entry_id: postId, content, parent_id: parentId });
  console.log(body);
  if (authStore.isUserAuthenticated && authStore.token) {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${COMMENTS_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (
          errorData?.error === "maximum comment nesting depth of 3 exceeded"
        ) {
          throw new Error(errorData.error);
        }

        throw new Error(`Error creating comment: ${response.statusText}`);
      }

      await response.json();
      return;
    } catch (error) {
      console.error("Error creating authenticated comment:", error);
      if (
        (error as Error).message ===
        "maximum comment nesting depth of 3 exceeded"
      ) {
        throw error;
      }
    }
  }

  const response = await interceptorFetch(`${API_BASE_URL}${COMMENTS_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
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

export async function analyzeComments(
  postId?: string,
  comments?: string[]
): Promise<{ data: { summary: string } }> {
  try {
    const response = await interceptorFetch(
      `${API_BASE_URL}${POSTS_URL}/${postId}/analyze-comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comments }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error analyzing comments: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error analyzing comments:", error);
    throw error;
  }
}

export async function getCommentChildren(parentId: number) {
  try {
    const response = await interceptorFetch(
      `${API_BASE_URL}/comments/children?parent_id=${parentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(
        `Error fetching comment children: ${response.statusText}`
      );
    }
    const { data } = await response.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}
