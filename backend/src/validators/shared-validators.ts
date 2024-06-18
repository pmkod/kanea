import vine from "@vinejs/vine";
import { isValidObjectId } from "mongoose";
import {
  formerlyBlockedSortOption,
  latestFirstSortOption,
  oldestFirstSortOption,
  recentlyBlockedSortOption,
} from "../constants/sort-option-constants";
// import { ObjectId } from "bson";

const idRule = vine.createRule((value, options, field) => {
  if (typeof value === "string" && isValidObjectId(value)) {
    return;
  }
  field.report("Id  not valdid", "schema", field);
});

export const idSchema = vine.string().use(idRule()).trim();
export const emailSchema = vine.string().email().toLowerCase().trim();
export const displayNameSchema = vine.string().minLength(1).maxLength(50).trim();
export const userNameSchema = vine.string().toLowerCase().minLength(3).maxLength(50).trim();
export const otpShema = vine.string().maxLength(200);
export const userNameValidator = vine.compile(userNameSchema);
export const passwordSchema = vine
  .string()
  .minLength(12)
  .maxLength(100)
  .regex(/\d/)
  .regex(/[^a-zA-Z0-9\s]/);
export const firstPageRequestedAtSchema = vine
  .string()
  .regex(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/);
export const idValidator = vine.compile(idSchema);
export const emailValidator = vine.compile(emailSchema);
export const passwordValidator = vine.compile(passwordSchema);

export const paginationQueryParamsValidator = vine.compile(
  vine.object({
    limit: vine.number().positive().max(50).optional(),
    page: vine.number().positive().optional(),
    sort: vine
      .string()
      .in([recentlyBlockedSortOption, formerlyBlockedSortOption, latestFirstSortOption, oldestFirstSortOption])
      .optional(),
    firstPageRequestedAt: firstPageRequestedAtSchema.optional(),
  })
);

//
export const searchQueryParamsValidator = vine.compile(
  vine.object({
    q: vine.string().maxLength(100),
    limit: vine.number().positive().max(12).optional(),
    page: vine.number().positive().optional(),
  })
);
