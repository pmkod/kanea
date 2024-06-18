import { idValidator } from "../validators/shared-validators";
import { paginationQueryParamsValidator } from "../validators/shared-validators";
import PostCommentModel from "../models/post-comment-model";
import PostCommentLikeModel from "../models/post-comment-like-model";
import { FastifyReply, FastifyRequest } from "fastify";

export const getPostCommentReplies = async (
  request: FastifyRequest<{ Params: { postCommentId: string } }>,
  reply: FastifyReply
) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const commentId = await idValidator.validate(request.params.postCommentId);

  const userId = request.session.userId;

  const limit = query.limit || 20;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const postComments = await PostCommentModel.find({
    mostDistantParentPostCommentId: commentId,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select([
      "id",
      "text",
      "descendantPostCommentsCount",
      "likesCount",
      "commenterId",
      "mostDistantParentPostCommentId",
      "parentPostCommentId",
      "createdAt",
      "postId",
    ])
    .populate({
      path: "commenter",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .populate({
      path: "parentPostComment",
      select: ["id", "commenterId"],
      populate: {
        path: "commenter",
        select: ["id", "userName"],
      },
    })
    .skip(startIndex)
    .limit(limit + 1);

  const nextPage = postComments.length > limit ? page + 1 : undefined;

  if (nextPage) {
    postComments.pop();
  }

  const postCommentIds = postComments.map((postComment) => postComment.id);

  const postCommentsIdsInPostCommentsListLoggedInUserLiked = (
    await PostCommentLikeModel.find({ postCommentId: { $in: postCommentIds }, likerId: userId })
  ).map(({ postCommentId }) => postCommentId?.toString());

  const postCommentsToSend: any = postComments.map((postComment) => ({
    ...postComment.toObject(),
    likedByLoggedInUser: postCommentsIdsInPostCommentsListLoggedInUserLiked.includes(postComment.id) ? true : false,
  }));

  reply.send({ postComments: postCommentsToSend, page, nextPage });
};
