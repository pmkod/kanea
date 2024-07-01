import vine from "@vinejs/vine";
import { maxMembersInGroupDiscussion, maxMembersInGroupDiscussionOnCreation } from "../constants/discussion-constants";
import { idSchema } from "./shared-validators";

export const addMembersToGroupDiscussionValidator = vine.compile(
  vine.object({
    discussionId: idSchema,
    newMemberIds: vine.array(idSchema).maxLength(maxMembersInGroupDiscussion).distinct(),
  })
);

export const removeMemberFromGroupDiscussionValidator = vine.compile(
  vine.object({
    discussionId: idSchema,
    memberId: idSchema,
  })
);

export const sendMessageValidator = vine.compile(
  vine.object({
    text: vine.string().maxLength(1000).trim().optional(),
    docs: vine
      .array(
        vine.object({
          file: vine.any(),
          name: vine.string(),
        })
      )
      .maxLength(4)
      .optional(),

    medias: vine
      .array(
        vine.object({
          file: vine.any(),
        })
      )
      .maxLength(4)
      .optional(),

    voiceMessage: vine
      .object({
        data: vine.any(),
      })
      .optional(),
    isFirstPrivateMessage: vine.boolean().optional(),
    memberId: idSchema.optional(),
    discussionId: idSchema.optional(),
    parentMessageId: idSchema.optional(),
  })
);

const discussionNameSchema = vine.string().minLength(1).maxLength(50);

const discussionPictureSchema = vine.object({
  file: vine.any(),
});

export const createGroupDiscussionValidator = vine.compile(
  vine.object({
    memberIds: vine.array(idSchema).minLength(1).maxLength(maxMembersInGroupDiscussionOnCreation).distinct(),
    name: discussionNameSchema,
    picture: discussionPictureSchema.optional(),
  })
);

export const editGroupDiscussionValidator = vine.compile(
  vine.object({
    name: discussionNameSchema,
    picture: discussionPictureSchema.optional(),
  })
);
