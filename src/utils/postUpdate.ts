import type { NewPostType, Post } from "@/models/Posts";

export function buildPostUpdatePayload(
  formData: Partial<Post>,
  existingPost: Post | null,
): Partial<NewPostType> {
  const article: Partial<NewPostType> = {
    title: formData.title || "",
    slug: formData.slug || "",
    description: formData.description || "",
    url_to_image: formData.url_to_image || "",
    content: formData.content || "",
    prediction: formData.prediction,
    hedge: formData.hedge,
  };

  if (!existingPost?.prediction) {
    article.source_name = formData.source_name || "";
    article.source_url = formData.source_url || "";
  }

  return article;
}
