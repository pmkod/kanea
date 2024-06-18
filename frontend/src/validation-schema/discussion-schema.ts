import { z } from "zod";

export const maxMembersInGroupDiscussion = 160;

export const maxMembersInGroupDiscussionOnCreation =
  maxMembersInGroupDiscussion - 1;

const discussionNameSchema = z.string().min(1).max(50);

const discussionPictureSchema = z
  .object({
    file: z.any(),
    url: z.string(),
  })
  .optional();

export const editGroupDiscussionSchema = z.object({
  name: discussionNameSchema,
  picture: discussionPictureSchema,
});

export const createGroupDiscussionSchema = z.object({
  name: discussionNameSchema,
  picture: discussionPictureSchema,
  members: z.array(z.any()).max(maxMembersInGroupDiscussionOnCreation),
});
