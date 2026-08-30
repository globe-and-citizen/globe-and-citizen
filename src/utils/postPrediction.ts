import type { PostPrediction } from "@/models/Posts";

const EMBEDDED_PREDICTION_SECTION =
  /^\s*<h2(?:\s[^>]*)?>\s*Prediction\s*<\/h2>\s*<p(?:\s[^>]*)?>[\s\S]*?<\/p>\s*/i;

export function withoutEmbeddedPrediction(
  content: string,
  prediction?: PostPrediction,
): string {
  if (!prediction) return content;
  return content.replace(EMBEDDED_PREDICTION_SECTION, "");
}
