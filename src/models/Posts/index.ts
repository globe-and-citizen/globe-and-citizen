import type { UserType } from "../Auth";
import type { Comments } from "../Comments";

export type FetchPostsType = {
  data: Post[];
};

export type Post = {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  title: string;
  content: string;
  categories: string[];
  is_external: boolean;
  author: string;
  post_slug?: string;
  slug: string;
  description: string;
  source_url: string;
  source_name: string;
  url_to_image: string;
  version: number;
  type?: "entry" | "post";
  comments: Comments;
  user: UserType;
  sentences: Sentence[];
  likes?: number;
  dislikes?: number;
  user_vote?: 1 | -1 | 0;
  entries?: Post[];
  comments_count?: number;
  userId?: number;
};

export type Sentence = {
  id: string;
  position: number;
  entry_id: number;
  content: string;
  opinions: SentenceOpinion;
};

type SentenceOpinion = {
  comments: SentenceOpinionComment[];
  dislikes: number;
  likes: number;
  sentence_id: string;
};

type SentenceOpinionComment = {
  user: number;
  text: string;
};

export type NewPostType = Omit<
  Post,
  | "id"
  | "created_at"
  | "updated_at"
  | "user"
  | "comments_count"
  | "user_id"
  | "userId"
  | "version"
  | "comments"
  | "sentences"
>;
