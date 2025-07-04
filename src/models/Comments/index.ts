import type { UserType } from "../Auth";

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: UserType;
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
