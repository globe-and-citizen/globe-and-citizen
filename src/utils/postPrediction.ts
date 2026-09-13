import type { PostPrediction } from "@/models/Posts";

const EMBEDDED_PREDICTION_SECTION =
  /^\s*<h2(?:\s[^>]*)?>\s*Prediction\s*<\/h2>\s*<p(?:\s[^>]*)?>[\s\S]*?<\/p>\s*/i;
const EMBEDDED_HEDGE_SECTION =
  /^\s*<h2(?:\s[^>]*)?>\s*Hedge\s*<\/h2>\s*<p(?:\s[^>]*)?>[\s\S]*?<\/p>\s*/i;

export function withoutEmbeddedPrediction(
  content: string,
  prediction?: PostPrediction,
  hedge?: PostPrediction,
): string {
  let result = content;
  if (prediction) {
    result = result.replace(EMBEDDED_PREDICTION_SECTION, "");
  }
  if (hedge) {
    result = result.replace(EMBEDDED_HEDGE_SECTION, "");
  }
  return result;
}
