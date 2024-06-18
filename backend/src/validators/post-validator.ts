import vine from "@vinejs/vine";
import { idSchema } from "./shared-validators";

export const publishPostValidator = vine.compile(
  vine.object({
    text: vine.string().maxLength(340).trim().optional(),
    medias: vine
      .array(
        vine.object({
          file: vine.any(),
        })
      )
      .minLength(1)
      .maxLength(4),
  })
);

//
//
//
//

export const commentPostValidator = vine.compile(
  vine.object({
    text: vine.string().maxLength(1000).trim(),
    postId: idSchema,
    parentPostCommentId: idSchema.optional(),
    mostDistantParentPostCommentId: idSchema.optional(),
  })
);
