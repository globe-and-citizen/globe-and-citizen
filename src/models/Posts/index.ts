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
  description: string;
  source_url: string;
  source_name: string;
  url_to_image: string;
  version: number;
  type?: "entry" | "post";
  comments: unknown | null;
  user: {
    id: number;
    username: string;
    email: string;
    created_at: string;
    updated_at: string | null;
    bio: string;
    location: string;
    website: string;
    profile_picture_url: string;
    date_of_birth: string | null;
    role_id: number;
    role: {
      id: number;
      name: string;
      description: string;
      level: number;
    };
  };

  entries?: Post[];
  comments_count?: number;
  userId?: number;
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
>;
