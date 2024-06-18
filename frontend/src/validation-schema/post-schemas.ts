import { z } from "zod";

export const maxPostTextLength = 340;

export const publishPostSchema = z.object({
  text: z.string().min(0).max(maxPostTextLength),
  medias: z
    .array(
      z.object({
        id: z.coerce.number(),
        file: z.any(),
        url: z.string(),
      })
    )
    .max(4),
});
