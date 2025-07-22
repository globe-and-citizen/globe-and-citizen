export type OpinionPatchPayload = {
  opinionId: string;
  opinion: {
    title: string;
    content: string;
    url_to_image?: string;
  };
};

export type OpinionPayload = {
  post_id: number;
  title: string;
  content: string;
  slug: string;
  url_to_image?: string;
};
