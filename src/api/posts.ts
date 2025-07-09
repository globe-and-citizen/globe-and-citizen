import { fetchWithAuth } from "@/api/auth.ts";
import type { FetchPostsType, NewPostType } from "../models/Posts";

import { API_BASE_URL, ENTRIES_URL, POSTS_URL, USER_FEED } from "./constants";

export async function fetchAllPosts(
  size: number,
  page: number
): Promise<FetchPostsType> {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POSTS_URL}?size=${size}&page=${page}`
    );
    if (!response.ok) {
      throw new Error(`Error fetching posts: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all posts:", error);
    throw error;
  }
}

export async function fetchUsersFeed(
  size?: number,
  page?: number,
  search?: string
): Promise<FetchPostsType> {
  try {
    const params = new URLSearchParams();

    if (size) params.append("limit", size.toString());
    if (page) params.append("offset", page.toString());
    if (search) params.append("search", search);

    const queryString = params.toString();
    const response = await fetchWithAuth(
      `${API_BASE_URL}${USER_FEED}${queryString ? `?${queryString}` : ""}`
    );

    if (!response) {
      throw new Error(`Error fetching user's feed`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user's feed:", error);
    throw error;
  }
}

export async function generateSummary(url: string): Promise<string> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/generate-summary?url=${encodeURIComponent(url)}`,
      {
        method: "GET",
      }
    );

    if (!response || !response.ok) {
      throw new Error(
        `Error generating summary: ${
          response ? response.statusText : "No response"
        }`
      );
    }

    const data = await response.json();
    return data.data.summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
}

export async function postNewsArticle(
  article: NewPostType
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}${POSTS_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(article),
    });

    if (!response) {
      throw new Error(`Error posting news article: ${response}`);
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error posting news article:", error);
    throw error;
  }
}

export async function fetchPostsCount(): Promise<{ data: number }> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts-count`);

    if (!response || !response.ok) {
      throw new Error(
        `Error fetching posts count: ${
          response ? response.statusText : "No response"
        }`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching posts count:", error);
    throw error;
  }
}

export async function patchNewsArticle(
  articleId: string,
  article: Partial<NewPostType>
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${POSTS_URL}/${articleId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(article),
      }
    );

    if (!response) {
      throw new Error(`Error updating news article: ${response}`);
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error("Error updating news article:", error);
    throw error;
  }
}

export async function deleteNewsArticle(
  articleId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${POSTS_URL}/${articleId}`,
      {
        method: "DELETE",
      }
    );

    if (!response) {
      throw new Error(`Error deleting news article: ${response}`);
    }

    return { success: true, message: "Article deleted successfully" };
  } catch (error) {
    console.error("Error deleting news article:", error);
    throw error;
  }
}

export async function fetchPostById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${POSTS_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`Error fetching post: ${response.statusText}`);
    }

    const data = await response.json();
    const postData = data.data || data;

    if (postData.entries && Array.isArray(postData.entries)) {
      console.log(`Found ${postData.entries.length} entries for post ${id}`);
    }

    return postData;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function fetchEntryBySlug(slug: string) {
  try {
    const response = await fetch(`${API_BASE_URL}${ENTRIES_URL}/${slug}`);

    if (!response.ok) {
      throw new Error(`Error fetching entry: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching entry:", error);
    return null;
  }
}

export async function fetchOpinionById(opinionId: string) {
  try {
    // For now, we're reusing the same API endpoint but in a real application
    // you would have a dedicated opinions endpoint
    const response = await fetch(`${API_BASE_URL}${ENTRIES_URL}/${opinionId}`);

    if (!response.ok) {
      // Fallback to posts endpoint if dedicated opinion endpoint doesn't exist yet
      return fetchPostById(opinionId);
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching opinion:", error);
    // Fallback to posts endpoint if the opinion endpoint fails
    return fetchPostById(opinionId);
  }
}

export async function fetchPostWithEntries(slug: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}${POSTS_URL}/${slug}?include_entries=true`
    );

    if (!response.ok) {
      throw new Error(
        `Error fetching post with entries: ${response.statusText}`
      );
    }

    const data = await response.json();
    const postData = data.data || data;

    return postData;
  } catch (error) {
    console.error("Error fetching post with entries:", error);
    return null;
  }
}
