import { z } from "zod/v4";

export const CreateGameTextFields = z
  .object({
    title: z.string().min(8),
    description: z.string().optional().nullable(),
    price: z.coerce
      .number()
      .int()
      .min(0, { message: "Price must be an integer ≥ 0" }),
    status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
    genreId: z.string().optional().nullable(),
    tagIds: z.array(z.string()).optional().nullable(),
    version: z.string().optional().nullable(),
    versionDescription: z.string().optional().nullable(),
    gameType: z.enum(["DOWNLOADABLE", "HTML"]),
  })
  .strict();