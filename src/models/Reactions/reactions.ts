export type PostReactionRequestPayload = {
  post_id: number;
  score: 1 | -1;
};

export type OpinionReactionRequestPayload = {
  entry_id: number;
  score: 1 | -1;
};
