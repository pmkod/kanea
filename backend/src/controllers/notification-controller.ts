import { paginationQueryParamsValidator } from "../validators/shared-validators";
import NotificationModel from "../models/notification-model";
import { FastifyReply, FastifyRequest } from "fastify";

export const getNotifications = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);

  const userId = request.session.userId;

  const limit = query.limit || 10;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const notifications = await NotificationModel.find({
    receiverId: userId,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select([
      "initiatorId",
      "followId",
      "postLikeId",
      "seen",
      "postCommentId",
      "parentPostCommentId",
      "postCommentLikeId",
      "createdAt",
    ])
    .populate({
      path: "initiator",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .populate({
      path: "postLike",
      select: ["postId"],
    })
    .populate({
      path: "follow",
      select: ["followerId"],
    })
    .populate({
      path: "postComment",
      select: ["id", "text", "postId", "commenterId"],
    })
    .populate({
      path: "parentPostComment",
      select: ["id", "text", "postId", "commenterId"],
    })
    .populate({
      path: "postCommentLike",
      select: ["postCommentId"],
    })
    .sort({ createdAt: "desc" })
    .skip(startIndex)
    .limit(limit + 1);

  const nextPage = notifications.length > limit ? page + 1 : undefined;

  if (nextPage) {
    notifications.pop();
  }

  reply.send({ page, notifications, nextPage });
};
