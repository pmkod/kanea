import { FastifyRequest } from "fastify";
import { emailVerificationTokenFieldName } from "../constants/email-verification-constants";
import { tokenValidator } from "../validators/auth-validators";

export const getEmailVerificationTokenFromRequest = async (fastifyRequest: FastifyRequest<{ Body: any }>) => {
  try {
    return await tokenValidator.validate(fastifyRequest.body[emailVerificationTokenFieldName]);
  } catch (error) {
    return "";
  }
};
