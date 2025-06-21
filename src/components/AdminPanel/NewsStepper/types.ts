import z from "zod";

export const formSchema = [
  z.object({
    selectedArticleIndex: z.number().min(0, "Please select an article"),
  }),
  z.object({
    // articleUrl: z.string().url("Please provide a valid URL"),
    generateSummary: z.boolean().default(true),
  }),
  z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    content: z.string().min(1, "Content is required"),
    author: z.string().optional(),
    source: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal("")),
  }),
  z.object({
    approved: z.boolean().refine((val) => val === true, {
      message: "Please approve the article to continue",
    }),
  }),
];
