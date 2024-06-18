import vine from "@vinejs/vine";
import { displayNameSchema, passwordSchema, userNameSchema } from "./shared-validators";

export const changeUserPasswordValidator = vine.compile(
  vine.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  })
);

export const changeUsernameValidator = vine.compile(
  vine.object({
    password: passwordSchema,
    newUsername: userNameSchema,
  })
);

export const updateUserProfileValidator = vine.compile(
  vine.object({
    displayName: displayNameSchema,
    userName: userNameSchema,
    bio: vine.string().maxLength(340).optional(),
  })
);
