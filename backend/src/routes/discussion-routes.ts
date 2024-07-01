import {
  defineGroupDiscussionMemberAsAdmin,
  dismissGroupDiscussionMemberAsAdmin,
  getDicussions,
  checkIfDiscussionBetweenTwoUsersExist,
  getDiscussionDetails,
  getDiscussionMessages,
  getDiscussionMessagesWithDocs,
  getDiscussionMessagesWithMedias,
  getDiscussionMessagesWithMediasAndDocs,
  searchDiscussions,
  streamDiscussionFile,
  streamMessageFile,
} from "../controllers/discussion-controller";
import { DoneFuncWithErrOrRes, FastifyInstance, FastifyPluginOptions } from "fastify";
import { requireAuth } from "../hooks/auth-hooks";

export const discussionRoutes = (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) => {
  fastify.get("/", { preHandler: requireAuth }, getDicussions);
  fastify.get("/:discussionId", { preHandler: requireAuth }, getDiscussionDetails);
  fastify.get("/:discussionId/messages", { preHandler: requireAuth }, getDiscussionMessages);
  fastify.get("/:discussionId/messages-with-docs", { preHandler: requireAuth }, getDiscussionMessagesWithDocs);
  fastify.get("/:discussionId/messages-with-medias", { preHandler: requireAuth }, getDiscussionMessagesWithMedias);
  fastify.get("/:discussionId/files/:fileName", { preHandler: requireAuth }, streamDiscussionFile);
  fastify.get(
    "/:discussionId/messages-with-medias-and-docs",
    { preHandler: requireAuth },
    getDiscussionMessagesWithMediasAndDocs
  );
  fastify.get(
    "/:discussionId/members/:userId/define-as-admin",
    { preHandler: requireAuth },
    defineGroupDiscussionMemberAsAdmin
  );
  fastify.get(
    "/:discussionId/members/:userId/dismiss-as-admin",
    { preHandler: requireAuth },
    dismissGroupDiscussionMemberAsAdmin
  );
  fastify.get("/many/search", { preHandler: requireAuth }, searchDiscussions);
  fastify.post("/one/between-me-and-an-usere", { preHandler: requireAuth }, checkIfDiscussionBetweenTwoUsersExist);

  fastify.get("/:discussionId/messages/:messageId/files/:fileName", { preHandler: requireAuth }, streamMessageFile);
  done();
};
