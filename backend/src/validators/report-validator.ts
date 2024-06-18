import vine from "@vinejs/vine";
import { idSchema } from "./shared-validators";

export const makeReportValidator = vine.compile(
  vine.object({
    reportedUserId: idSchema.optional(),
    reportedPostId: idSchema.optional(),
    reportedPostCommentId: idSchema.optional(),
    reportedMessageId: idSchema.optional(),
    reportedDiscussionId: idSchema.optional(),
    reportReasonId: idSchema.optional(),
    customReason: vine.string().maxLength(300).optional(),
  })
);
