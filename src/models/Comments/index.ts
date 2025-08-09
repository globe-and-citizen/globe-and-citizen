import type { UserType } from "../Auth";

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: UserType;
  children?: Comment[];
  isLiked?: boolean;
  isDisliked?: boolean;
  likes?: number;
  dislikes?: number;
  has_children?: boolean;
  parent_id?: number;
}

export type Comments = Comment[];

export interface CommentsResponse {
  comments: Comments;
}

export interface CreateCommentRequest {
  post_id: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}
