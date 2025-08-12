export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Auth
export const SIGN_IN_URL = "/sign-in";
export const SIGN_UP_URL = "/sign-up";
export const REFRESH_TOKEN_URL = "/refresh-token";

// Posts
export const POSTS_URL = "/posts";
export const ENTRIES_URL = "/entries";
export const USER_FEED = "/users/feed";

// Comments
export const COMMENTS_URL = "/comment";

// Reactions
export const POST_REACTIONS_URL = "/vote/post";
export const OPINION_REACTIONS_URL = "/vote/entry";
export const GET_USER_VOTES_URL = "/vote";
export const ENTRY_SENTENCE_REACTION_URL = "/entry-annotation";
export const POST_SENTENCE_REACTION_URL = "/post-annotation";
