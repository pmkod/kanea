import { z } from "zod";

export const emailSchema = z
  .string({ required_error: "Email required" })
  .email({ message: "Email not valid" })
  .trim();

export const displayNameSchema = z
  .string({ required_error: "Name required" })
  .min(1, { message: "At least 1 characters" })
  .max(50, { message: "At most 50 characters" })
  .max(50);

export const userNameSchema = z
  .string({ required_error: "Username is required" })
  .min(1, { message: "At least 1 characters" })
  .max(50, { message: "At most 50 characters" });

const requireAtLeastOneDigitRegex = /\d/;
const requireAtLeastSpecialCharacterRegex = /[^a-zA-Z0-9\s]/;

export const passwordSchema = z
  .string({ required_error: "Password required" })
  .min(12, { message: "Invalid password" })
  .max(100, { message: "Invalid password" })
  .regex(requireAtLeastOneDigitRegex, { message: "Incorrect password" })
  .regex(requireAtLeastSpecialCharacterRegex, {
    message: "Incorrect password",
  });

export const passwordSchemaWithGoodMessages = z
  .string({ required_error: "Password required" })
  .min(12, { message: "At least 12 characters" })
  .max(100, { message: "No more than 100 characters" })
  .regex(requireAtLeastOneDigitRegex, { message: "At least one digit" })
  .regex(requireAtLeastSpecialCharacterRegex, {
    message: "At least one special character",
  });

export const editUserProfileSchema = z.object({
  displayName: displayNameSchema,
  userName: userNameSchema,
  bio: z.string().max(340).optional(),
  profilePicture: z
    .object({
      file: z.any(),
      url: z.string(),
    })
    .optional(),
});

export const editUserEmailSchema = z.object({
  password: passwordSchema,
  email: emailSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchemaWithGoodMessages,
  newPasswordConfirmation: z.string(),
});

export const changeEmailSchema = z.object({
  password: passwordSchema,
  newEmail: emailSchema,
});

export const changeUsernameSchema = z.object({
  password: passwordSchema,
  newUsername: userNameSchema,
});
