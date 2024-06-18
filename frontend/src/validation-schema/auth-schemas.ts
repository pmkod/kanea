import * as z from "zod";
import {
  displayNameSchema,
  emailSchema,
  passwordSchema,
  passwordSchemaWithGoodMessages,
  userNameSchema,
} from "./user-schemas";

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormFields = z.infer<typeof loginFormSchema>;

export const signupFormSchema = z.object({
  email: emailSchema,
});

export const completeSignupSchema = z.object({
  displayName: displayNameSchema,
  userName: userNameSchema,
  password: passwordSchemaWithGoodMessages,
});
export type CompleteSignupFormFields = z.infer<typeof completeSignupSchema>;

export type SignupFormFields = z.infer<typeof signupFormSchema>;

export const passwordResetNewPasswordSchema = z.object({
  newPassword: passwordSchemaWithGoodMessages,
  newPasswordConfirmation: z.string(),
});

export type PasswordResetNewPasswordFormFields = z.infer<
  typeof passwordResetNewPasswordSchema
>;

export const passwordResetFormSchema = z.object({
  email: emailSchema,
});

export type PasswordResetFormFields = z.infer<typeof passwordResetFormSchema>;

export const emailVerificationFormSchema = z.object({
  otp: z.string().min(1, { message: "Enter otp here" }),
});

export type EmailVerificationFormFields = z.infer<
  typeof emailVerificationFormSchema
>;
