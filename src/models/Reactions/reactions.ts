export type PostReactionRequestPayload = {
  post_id: number;
  score: 1 | -1;
};

export type OpinionReactionRequestPayload = {
  entry_id: number;
  score: 1 | -1;
};

export type SentenceReactionRequestPayload = {
  postType: "post" | "entry";
  sentence_id: string;
  type: "like" | "dislike" | "comment";
  content?: string;
};
