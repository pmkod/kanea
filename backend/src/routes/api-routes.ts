import { FastifyPluginOptions, FastifyInstance, DoneFuncWithErrOrRes } from "fastify";
import { streamPublicFile } from "../controllers/file-controller";
import { authRoutes } from "./auth-routes";
import { getBlocks } from "../controllers/block-controller";
import { contact } from "../controllers/contact-controller";
import { userRoutes } from "./user-routes";
import { discussionRoutes } from "./discussion-routes";
import { postRoutes } from "./post-routes";
import { sessionRoutes } from "./session-routes";
import { getNotifications } from "../controllers/notification-controller";
import { getPostCommentReplies } from "../controllers/post-comment-controller";
import { makeReport } from "../controllers/report-controller";
import { getReportReasons } from "../controllers/report-reason-controller";
import { requireAuth } from "../hooks/auth-hooks";
import { searchRoutes } from "./search-routes";

export const apiRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: DoneFuncWithErrOrRes) => {
  fastify.get("/public/:fileName", streamPublicFile);
  fastify.post("/contact", contact);
  fastify.register(authRoutes, { prefix: "/auth" });
  fastify.register(userRoutes);

  fastify.register(discussionRoutes, { prefix: "/discussions" });
  fastify.register(searchRoutes, { prefix: "/searchs" });

  fastify.register(postRoutes, { prefix: "/posts" });

  fastify.register(sessionRoutes, { prefix: "/sessions" });

  fastify.get("/comments/:postCommentId/replies", { preHandler: requireAuth }, getPostCommentReplies);

  fastify.get("/blocks", { preHandler: requireAuth }, getBlocks);

  fastify.get("/notifications", { preHandler: requireAuth }, getNotifications);

  fastify.post("/reports", { preHandler: requireAuth }, makeReport);

  fastify.get("/report-reasons", getReportReasons);

  done();
};
