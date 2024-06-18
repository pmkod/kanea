import { FastifyRequest, FastifyReply } from "fastify";
import { contactValidator } from "../validators/contact-validators";
import ContactModel from "../models/contact-model";

export const contact = async (request: FastifyRequest, reply: FastifyReply) => {
  const { name, email, message } = await contactValidator.validate(request.body);
  await ContactModel.create({
    name,
    email,
    message,
  });
  reply.status(200).send({ message: "Success" });
};
