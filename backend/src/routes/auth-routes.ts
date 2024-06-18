import { FastifyPluginOptions, FastifyInstance, DoneFuncWithErrOrRes } from "fastify";

import {
  completeSignup,
  login,
  emailVerificationForLogin,
  logout,
  newPassword,
  passwordReset,
  signup,
  emailVerificationForSignup,
  emailVerificationForPasswordReset,
} from "../controllers/auth-controller";
import { requireAuth } from "../hooks/auth-hooks";

// Auth

export const authRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: DoneFuncWithErrOrRes) => {
  fastify.post("/signup", signup);
  fastify.post("/signup/email-verification", emailVerificationForSignup);
  fastify.post("/signup/complete", completeSignup);

  fastify.post("/password-reset", passwordReset);
  fastify.post("/password-reset/email-verification", emailVerificationForPasswordReset);
  fastify.post("/password-reset/new-password", newPassword);

  fastify.post("/login", login);
  fastify.post("/login/email-verification", emailVerificationForLogin);

  fastify.get(
    "/logout",
    {
      preHandler: requireAuth,
    },
    logout
  );
  done();
};
