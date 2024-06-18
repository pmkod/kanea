import { deleteSearch, deleteSearchs, getSearchs, saveSearch } from "../controllers/search-controller";
import { DoneFuncWithErrOrRes, FastifyInstance, FastifyPluginOptions } from "fastify";
import { requireAuth } from "../hooks/auth-hooks";

export const searchRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: DoneFuncWithErrOrRes) => {
  // Search
  fastify.get("/", { preHandler: requireAuth }, getSearchs);
  fastify.post("/", { preHandler: requireAuth }, saveSearch);
  fastify.delete("/:searchId", { preHandler: requireAuth }, deleteSearch);
  fastify.delete("/", { preHandler: requireAuth }, deleteSearchs);
  done();
};
