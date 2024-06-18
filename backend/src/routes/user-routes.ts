import {
  changeEmail,
  changeEmailVerification,
  changePassword,
  changeUsername,
  getLoggedInUser,
  getUserByUserName,
  getUserFollowers,
  getUserFollowing,
  getUserFollowingTimeLine,
  getUserLikedPosts,
  getUserPosts,
  getUserSuggestionsToFollow,
  getUsers,
  seeNotifications,
  updateUserProfile,
} from "../controllers/user-controller";

import { requireAuth } from "../hooks/auth-hooks";
import { DoneFuncWithErrOrRes, FastifyInstance, FastifyPluginOptions } from "fastify";

export const userRoutes = (fastify: FastifyInstance, options: FastifyPluginOptions, done: DoneFuncWithErrOrRes) => {
  fastify.get(
    "/user",
    {
      preHandler: requireAuth,
    },
    getLoggedInUser
  );
  fastify.put(
    "/user/profile",
    {
      preHandler: requireAuth,
    },
    updateUserProfile
  );
  fastify.get(
    "/user/timeline/following",
    {
      preHandler: requireAuth,
    },
    getUserFollowingTimeLine
  );
  fastify.get(
    "/user/see-notifications",
    {
      preHandler: requireAuth,
    },
    seeNotifications
  );
  fastify.put(
    "/user/email",
    {
      preHandler: requireAuth,
    },
    changeEmail
  );
  fastify.post(
    "/user/email/verification",
    {
      preHandler: requireAuth,
    },
    changeEmailVerification
  );
  fastify.put(
    "/user/password",
    {
      preHandler: requireAuth,
    },
    changePassword
  );
  fastify.put(
    "/user/username",
    {
      preHandler: requireAuth,
    },
    changeUsername
  );
  fastify.get(
    "/users",
    {
      preHandler: requireAuth,
    },
    getUsers
  );
  fastify.get(
    "/users/suggestions/to-follow",
    {
      preHandler: requireAuth,
    },
    getUserSuggestionsToFollow
  );
  fastify.get(
    "/users/:userName",
    {
      preHandler: requireAuth,
    },
    getUserByUserName
  );
  fastify.get(
    "/users/:userId/posts",
    {
      preHandler: requireAuth,
    },
    getUserPosts
  );
  fastify.get(
    "/users/:userId/liked-posts",
    {
      preHandler: requireAuth,
    },
    getUserLikedPosts
  );
  fastify.get(
    "/users/:userId/followers",
    {
      preHandler: requireAuth,
    },
    getUserFollowers
  );

  fastify.get(
    "/users/:userId/following",
    {
      preHandler: requireAuth,
    },
    getUserFollowing
  );
  done();
};
