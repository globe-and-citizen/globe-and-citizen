import { z } from "zod";

const toPlainText = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

export const getTextLength = (value: string) => toPlainText(value).length;

export const getWordCount = (value: string) => {
  const text = toPlainText(value);
  return text ? text.split(/\s+/).length : 0;
};

// Title: max 20 words, 100 characters
const titleSchema = z
  .string()
  .min(1, "Title is required")
  .max(100, "Title must be at most 100 characters")
  .refine((v) => getWordCount(v) <= 20, "Title must be at most 20 words");

// TLGP: max 100 words, 500 characters
const tlgpSchema = z
  .string()
  .min(1, "TLGP is required")
  .max(500, "TLGP must be at most 500 characters")
  .refine((v) => getWordCount(v) <= 100, "TLGP must be at most 100 words");

// Rules Analysis: max 400 words, 2000 characters
const rulesAnalysisSchema = z
  .string()
  .refine((v) => getTextLength(v) > 0, "Rules Analysis is required")
  .refine(
    (v) => getTextLength(v) <= 2000,
    "Rules Analysis must be at most 2000 characters",
  )
  .refine(
    (v) => getWordCount(v) <= 400,
    "Rules Analysis must be at most 400 words",
  );

// Full Analysis: max 1000 words, 5000 characters
const fullAnalysisSchema = z
  .string()
  .refine((v) => getTextLength(v) > 0, "Full Analysis is required")
  .refine(
    (v) => getTextLength(v) <= 5000,
    "Full Analysis must be at most 5000 characters",
  )
  .refine(
    (v) => getWordCount(v) <= 1000,
    "Full Analysis must be at most 1000 words",
  );

export const formSchema = [
  z.object({
    title: titleSchema,
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens",
      ),
    predictionUrl: z.string().min(1, "Prediction is required"),
    predictionEventTitle: z.string(),
    predictionMarketId: z.string(),
    predictionMarketSlug: z.string(),
    predictionMarketQuestion: z.string(),
    predictionOutcome: z.enum(["Yes", "No"]),
    predictionTokenId: z.string(),
    tlgp: tlgpSchema,
    rulesAnalysis: rulesAnalysisSchema,
    fullAnalysis: fullAnalysisSchema,
    imageUrl: z.string().url().optional().or(z.literal("")),
    polymarketImage: z.string().optional().or(z.literal("")),
  }),
];

export const editPostSchema = z.object({
  title: titleSchema,
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),
  tlgp: tlgpSchema,
  rulesAnalysis: rulesAnalysisSchema,
  fullAnalysis: fullAnalysisSchema,
  imageUrl: z.string().url().optional().or(z.literal("")),
});

export type FormValues = z.infer<(typeof formSchema)[0]>;
export type EditPostValues = z.infer<typeof editPostSchema>;
