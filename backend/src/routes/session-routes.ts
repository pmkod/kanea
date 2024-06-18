import { DoneFuncWithErrOrRes, FastifyInstance, FastifyPluginOptions } from "fastify";
import {
  getActiveSessionById,
  getActiveSessions,
  logoutOfOthersSession,
  logoutOfSession,
} from "../controllers/session-controller";
import { requireAuth } from "../hooks/auth-hooks";

export const sessionRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: DoneFuncWithErrOrRes) => {
  // Sessions
  fastify.get(
    "/",
    {
      preHandler: requireAuth,
    },
    getActiveSessions
  );
  fastify.get(
    "/:id",
    {
      preHandler: requireAuth,
    },
    getActiveSessionById
  );
  fastify.delete(
    "/others",
    {
      preHandler: requireAuth,
    },
    logoutOfOthersSession
  );
  fastify.delete(
    "/:id",
    {
      preHandler: requireAuth,
    },
    logoutOfSession
  );
  done();
};
