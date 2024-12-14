import { FastifyReply, FastifyRequest } from "fastify";
import { BlockModel } from "../models/block-model";
import PostCommentLikeModel from "../models/post-comment-like-model";
import PostCommentModel from "../models/post-comment-model";
import PostLikeModel from "../models/post-like-model";
import PostModel from "../models/post-model";
import UserModel from "../models/user-model";
import { deleteFile } from "../utils/file-utils";
import { idValidator, paginationQueryParamsValidator } from "../validators/shared-validators";
//
//
//
//
//
//

//
//
//
//
//
//

export const getPost = async (request: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const postId = await idValidator.validate(request.params.postId);

  const loggedInUserId = request.session.userId;

  const post = await PostModel.findOne({ _id: postId, visible: true }).populate("publisher");

  if (post === null) {
    throw Error("Post not found");
  }

  const block = await BlockModel.findOne({ blockerId: post.publisherId, blockedId: loggedInUserId });

  if (block !== null) {
    throw Error("The publisher of this post blocked you");
  }

  const checkIfFetchedUserBlockedLoggedInUser = await BlockModel.findOne({
    blockerId: post.publisherId,
    blockedId: loggedInUserId,
  });
  if (checkIfFetchedUserBlockedLoggedInUser !== null) {
    throw Error(" This user blocked you");
  }

  const postLike = await PostLikeModel.findOne({ postId, likerId: loggedInUserId });
  const likedByLoggedInUser = postLike !== null ? true : false;

  let someComments = await PostCommentModel.find({ postId: post.id, parentPostCommentId: { $exists: false } })
    .populate("commenter")
    .limit(3)
    .sort({ createdAt: "desc" });

  const commentIds = someComments.map(({ id }) => id);

  const postCommentIdsInPostCommentsListLoggedInUserLiked = (
    await PostCommentLikeModel.find({ postCommentId: { $in: commentIds }, likerId: loggedInUserId })
  ).map(({ postCommentId }) => postCommentId?.toString());

  someComments = someComments.map((comment) => ({
    ...comment.toObject(),
    likedByLoggedInUser: postCommentIdsInPostCommentsListLoggedInUserLiked.includes(comment.id) ? true : false,
  })) as any;

  const postToSend = { ...post.toObject(), someComments, likedByLoggedInUser };

  reply.send({ post: postToSend });
};

//
//
//
//
//
//

export const explore = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);

  const limit = query.limit || 20;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const posts = await PostModel.find({
    visible: true,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select([
      "id",
      "medias.mimetype",
      "medias.lowQualityFileName",
      "medias.mediumQualityFileName",
      "medias.bestQualityFileName",
      "likesCount",
      "commentsCount",
    ])
    .skip(startIndex)
    .sort({ createdAt: "desc" })
    .limit(limit + 1);

  const nextPage = posts.length > limit ? page + 1 : undefined;

  if (nextPage) {
    posts.pop();
  }
  reply.send({ posts, nextPage });
};

//
//
//
//
//
//

export const getPostLikes = async (request: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const postId = await idValidator.validate(request.params.postId);

  const limit = query.limit || 20;
  const page = query.page || 1;

  const startIndex = (page - 1) * limit;

  const postLikes = await PostLikeModel.find({
    postId,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select(["likerId"])
    .sort({ createdAt: "desc" })
    .populate({
      path: "liker",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .skip(startIndex)
    .limit(limit + 1);

  const nextPage = postLikes.length > limit ? page + 1 : undefined;

  if (nextPage) {
    postLikes.pop();
  }

  reply.send({ postLikes, page, nextPage });
};

//
//
//
//
//
//

export const getPostComments = async (request: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const postId = await idValidator.validate(request.params.postId);
  const loggedInUserId = request.session.userId;

  const limit = query.limit || 20;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const post = await PostModel.findOne({ _id: postId, visible: true });

  if (post === null) {
    throw Error("Post not found");
  }

  const block = await BlockModel.findOne({ blockerId: post.publisherId, blockedId: loggedInUserId });

  if (block !== null) {
    throw Error("The publisher of this post blocked you");
  }

  const postComments = await PostCommentModel.find({
    postId,
    createdAt: { $lte: query.firstPageRequestedAt },
    parentPostCommentId: { $exists: false },
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
    .skip(startIndex)
    .sort({ createdAt: "desc" })
    .limit(limit + 1);

  const nextPage = postComments.length > limit ? page + 1 : undefined;

  if (nextPage) {
    postComments.pop();
  }

  const postCommentIds = postComments.map((postComment) => postComment.id);

  const postCommentsIdsInPostCommentsListLoggedInUserLiked = (
    await PostCommentLikeModel.find({ postCommentId: { $in: postCommentIds }, likerId: loggedInUserId })
  ).map(({ postCommentId }) => postCommentId?.toString());

  const postCommentsToSend = postComments.map((postComment) => ({
    ...postComment.toObject(),
    likedByLoggedInUser: postCommentsIdsInPostCommentsListLoggedInUserLiked.includes(postComment.id) ? true : false,
  }));

  reply.send({ postComments: postCommentsToSend, page, nextPage });
};

//
//
//
//
//
//

export const deletePost = async (request: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const postId = await idValidator.validate(request.params.postId);
  const userId = request.session.userId;
  try {
    const post = await PostModel.findOneAndDelete(
      { _id: postId, publisherId: userId },
      { returnOriginal: true }
    ).orFail();
    for (const media of post.medias) {
      await Promise.all([
        deleteFile(media.lowQualityFileName!),
        deleteFile(media.mediumQualityFileName!),
        deleteFile(media.bestQualityFileName!),
      ]);
    }

    await UserModel.updateOne({ _id: userId, postsCount: { $gt: 0 } }, { $inc: { postsCount: -1 } });
    reply.send({
      message: "Success",
    });
  } catch (error) {
    throw Error("Post not found");
  }
};
