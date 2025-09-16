import type {
  OpinionReactionRequestPayload,
  PostReactionRequestPayload,
  SentenceReactionRequestPayload,
} from "@/models/Reactions/reactions";
import { fetchWithAuth } from "./auth";
import {
  API_BASE_URL,
  GET_USER_VOTES_URL,
  OPINION_REACTIONS_URL,
  POST_REACTIONS_URL,
  ENTRY_SENTENCE_REACTION_URL,
  POSTS_URL,
  POST_SENTENCE_REACTION_URL,
} from "./constants";

export async function postReaction(
  payload: PostReactionRequestPayload
): Promise<unknown> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${POST_REACTIONS_URL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response) {
      throw new Error(`Post reactions api error`);
    }

    return response;
  } catch (error) {
    console.error("Error adding/removing reaction:", error);
    throw error;
  }
}

export async function opinionReaction(
  payload: OpinionReactionRequestPayload
): Promise<unknown> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${OPINION_REACTIONS_URL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    if (!response) {
      throw new Error(`Post reactions api error`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding/removing reaction:", error);
    throw error;
  }
}

export async function fetchUsersPostReaction(postId: string): Promise<unknown> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${POSTS_URL}/${postId}${GET_USER_VOTES_URL}`
    );
    if (!response) {
      throw new Error(`Error fetching post reactions`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching post reactions:", error);
    throw error;
  }
}

export async function postSentenceReaction(
  payload: SentenceReactionRequestPayload
): Promise<unknown> {
  const { postType, ...payloadNoPostType } = payload;
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${
        postType === "opinion"
          ? ENTRY_SENTENCE_REACTION_URL
          : POST_SENTENCE_REACTION_URL
      }`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadNoPostType),
      }
    );
    if (!response) {
      throw new Error(`Post reactions api error`);
    }
    return response;
  } catch (error) {
    console.error("Error adding/removing sentence reaction:", error);
    throw error;
  }
}
