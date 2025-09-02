import { z } from "zod";

export const formSchema = [
  z.object({
    title: z.string().min(1, "Title is required"),
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug must contain only lowercase letters, numbers, and hyphens"
      ),
    description: z.string().min(1, "Description is required"),
    content: z.string().min(1, "Content is required"),
  }),
];
