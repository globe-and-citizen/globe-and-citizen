/**
 * Determines if content should be treated as an opinion
 * Since posts and opinions come from different API endpoints,
 * we should rely on the source parameter provided by the caller
 *
 * @param source The source of the content ('post' or 'opinion')
 * @returns true if the content is an opinion, false otherwise
 */
export const isOpinion = (source: "post" | "opinion"): boolean => {
  return source === "opinion";
};
