import vine from "@vinejs/vine";

export const contactValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    email: vine.string().email(),
    message: vine.string().minLength(1).maxLength(200),
  })
);
