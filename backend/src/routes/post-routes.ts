import { DoneFuncWithErrOrRes, FastifyInstance, FastifyPluginOptions } from "fastify";
import { deletePost, explore, getPost, getPostComments, getPostLikes } from "../controllers/post-controller";
import { requireAuth } from "../hooks/auth-hooks";

export const postRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: DoneFuncWithErrOrRes) => {
  //Post
  fastify.get("/many/explore", { preHandler: requireAuth }, explore);
  fastify.get("/:postId", { preHandler: requireAuth }, getPost);
  fastify.delete("/:postId", { preHandler: requireAuth }, deletePost);
  fastify.get("/:postId/comments", { preHandler: requireAuth }, getPostComments);
  fastify.get("/:postId/likes", { preHandler: requireAuth }, getPostLikes);
  done();
};
