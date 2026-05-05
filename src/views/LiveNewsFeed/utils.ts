export const stripHtml = (value: string): string => {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const createTruthSocialTitle = (text: string): string => {
  const cleanText = stripHtml(text);
  if (!cleanText) {
    return "Donald Trump Truth Social Update";
  }

  if (cleanText.length <= 88) {
    return cleanText;
  }

  return `${cleanText.slice(0, 85)}...`;
};

export const getFirstString = (
  source: Record<string, unknown>,
  keys: string[],
): string | null => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
};

export const isObjectRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export const getFirstArray = (
  source: Record<string, unknown>,
  keys: string[],
): unknown[] | null => {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
};
