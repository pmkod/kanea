import { Socket } from "socket.io";
import PostCommentModel from "../models/post-comment-model";
import PostCommentLikeModel from "../models/post-comment-like-model";
import NotificationModel from "../models/notification-model";
import UserModel from "../models/user-model";
import { BlockModel } from "../models/block-model";
import PostModel from "../models/post-model";
import { buildUserSelfRoomName } from "../utils/web-socket-utils";
import { idValidator } from "../validators/shared-validators";

export const likePostCommentEvent = async (socket: Socket, data: any) => {
  const postCommentId = data.postCommentId;
  try {
    await idValidator.validate(postCommentId);
  } catch (error) {
    socket.emit("like-post-comment-error", { message: "Data validation error", postCommentId });
    return;
  }
  const loggedInUserId = socket.data.session.userId.toString();

  let postComment = await PostCommentModel.findById(data.postCommentId);

  if (postComment === null) {
    socket.emit("like-post-comment-error", { message: "Post comment not found", postCommentId });
    return;
  }

  const post = await PostModel.findOne({ _id: postComment.postId, visible: true });

  if (post === null) {
    socket.emit("like-post-comment-error", { message: "Post not found", postCommentId });
    return;
  }

  const postPublisherBlockedLoggedInUser = await BlockModel.findOne({
    blockerId: post.publisherId,
    blockedId: loggedInUserId,
  });

  if (postPublisherBlockedLoggedInUser !== null) {
    socket.emit("like-post-comment-error", { message: "The publisher of this post blocked you", postCommentId });
    return;
  }

  const loggedInUserBlockedPostPublisher = await BlockModel.findOne({
    blockerId: loggedInUserId,
    blockedId: post.publisherId,
  });

  if (loggedInUserBlockedPostPublisher !== null) {
    socket.emit("like-post-comment-error", { message: "You blocked the publisher of this post", postCommentId });
    return;
  }

  let postCommentLike = null;
  try {
    postCommentLike = await PostCommentLikeModel.create({
      postCommentId: postComment.id,
      likerId: loggedInUserId,
    });
    postComment.likesCount = postComment.likesCount + 1;
    await postComment.save();
  } catch (error) {
    return;
  }

  if (postComment.commenterId?.equals(loggedInUserId)) {
    return;
  }

  const postCommentAuthor = await UserModel.findOneAndUpdate(
    { _id: postComment.commenterId, active: true },
    { $inc: { unseenNotificationsCount: 1 } }
  );

  const notification = await NotificationModel.create({
    initiatorId: postCommentLike.likerId,
    receiverId: postComment.commenterId,
    postCommentLikeId: postCommentLike._id,
  });

  if (postCommentAuthor === null) {
    return;
  }

  await notification.populate("initiator");
  await notification.populate("receiver");
  await notification.populate("postCommentLike");

  socket.to(buildUserSelfRoomName(postComment.commenterId!)).emit("receive-notification", {
    notification,
    unseenNotificationsCount: postCommentAuthor.unseenNotificationsCount,
  });
};

//
//
//
//
//
//
//
//

export const unlikePostCommentEvent = async (socket: Socket, data: any) => {
  const postCommentId = data.postCommentId;

  try {
    await idValidator.validate(postCommentId);
  } catch (error) {
    socket.emit("unlike-post-comment-error", { message: "Data validation error", postCommentId });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();
  let postComment = await PostCommentModel.findById(data.postCommentId);
  if (postComment === null) {
    socket.emit("unlike-post-comment-error", { message: "Post comment not found", postCommentId });
    return;
  }
  const postCommentLike = await PostCommentLikeModel.findOneAndDelete({
    postCommentId: postComment.id,
    likerId: loggedInUserId,
  });
  if (postCommentLike === null) {
    return;
  }
  postComment.likesCount = postComment.likesCount > 0 ? postComment.likesCount - 1 : 0;
  await postComment.save();
  if (postComment.commenterId?.equals(loggedInUserId)) {
    return;
  }
  const notification = await NotificationModel.findOneAndDelete(
    {
      initiatorId: postCommentLike.likerId,
      receiverId: postComment.commenterId,
      postCommentLikeId: postCommentLike.id,
    },
    { returnOriginal: true }
  );
  const postCommentAuthor = await UserModel.findOne({ _id: postComment.commenterId, active: true });
  if (postCommentAuthor === null) {
    return;
  }
  if (!notification?.seen) {
    postCommentAuthor.unseenNotificationsCount =
      postCommentAuthor.unseenNotificationsCount > 0 ? postCommentAuthor.unseenNotificationsCount - 1 : 0;
  }

  socket.to(buildUserSelfRoomName(postComment.commenterId!)).emit("remove-received-notification", {
    notification,
    unseenNotificationsCount: postCommentAuthor.unseenNotificationsCount,
  });

  await postCommentAuthor.save();
};
