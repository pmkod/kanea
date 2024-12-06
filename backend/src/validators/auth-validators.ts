import vine from "@vinejs/vine";
import { emailSchema, passwordSchema, userNameSchema, displayNameSchema, otpShema } from "./shared-validators";
import { maxSessionIdLength, minSessionIdLength } from "../constants/session-constants";

//

export const completeSignupValidator = vine.compile(
  vine.object({
    displayName: displayNameSchema,
    userName: userNameSchema,
    password: passwordSchema,
  })
);

export const loginValidator = vine.compile(
  vine.object({
    email: emailSchema,
    password: passwordSchema,
  })
);

export const newPasswordValidator = vine.compile(
  vine.object({
    newPassword: passwordSchema,
  })
);

export const signupValidator = vine.compile(
  vine.object({
    email: emailSchema,
  })
);

export const passwordResetValidator = vine.compile(
  vine.object({
    email: emailSchema,
  })
);

export const otpValidator = vine.compile(otpShema);

export const sessionIdValidator = vine.compile(
  vine.string().minLength(minSessionIdLength).maxLength(maxSessionIdLength)
);

export const tokenValidator = vine.compile(vine.string().jwt());
