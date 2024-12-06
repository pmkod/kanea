import { Socket } from "socket.io";
import PostLikeModel from "../models/post-like-model";
import NotificationModel from "../models/notification-model";
import PostModel from "../models/post-model";
import UserModel from "../models/user-model";
import { BlockModel } from "../models/block-model";
import { buildUserSelfRoomName } from "../utils/web-socket-utils";
import { idValidator } from "../validators/shared-validators";

export const likePostEvent = async (socket: Socket, data: any) => {
  const postId = data.postId;
  try {
    await idValidator.validate(postId);
  } catch (error) {
    socket.emit("like-post-error", { message: "Data validation error", postId });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const post = await PostModel.findOne({ _id: data.postId, visible: true });
  if (post === null) {
    socket.emit("like-post-error", { message: "This post don't exist", postId });
    return;
  }

  const postPublisherBlockedLoggedInUser = await BlockModel.findOne({
    blockerId: post.publisherId,
    blockedId: loggedInUserId,
  });

  if (postPublisherBlockedLoggedInUser !== null) {
    socket.emit("like-post-error", { message: "The publisher of this post blocked you", postId });
    return;
  }

  const loggedInUserBlockedPostPublisher = await BlockModel.findOne({
    blockerId: loggedInUserId,
    blockedId: post.publisherId,
  });

  if (loggedInUserBlockedPostPublisher !== null) {
    socket.emit("like-post-error", { message: "You blocked the publisher of this post", postId });
    return;
  }

  let postLike = null;

  try {
    postLike = await PostLikeModel.create({ likerId: loggedInUserId, postId: post._id });
    post.likesCount = post.likesCount + 1;
    await post.save();
  } catch (error) {
    return;
  }

  if (post.publisherId?.equals(loggedInUserId)) {
    return;
  }

  const notification = await NotificationModel.create({
    initiatorId: loggedInUserId,
    receiverId: post.publisherId,
    postLikeId: postLike.id,
  });
  await notification.populate("initiator");
  await notification.populate("receiver");
  await notification.populate("postLike");

  const postPublisher = await UserModel.findOneAndUpdate(
    { _id: post.publisherId },
    { $inc: { unseenNotificationsCount: 1 } },
    { new: true }
  );

  socket.to(buildUserSelfRoomName(post.publisherId!)).emit("receive-notification", {
    notification,
    postLike,
    unseenNotificationsCount: postPublisher?.unseenNotificationsCount,
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
//
//

export const unlikePostEvent = async (socket: Socket, data: any) => {
  const postId = data.postId;
  try {
    await idValidator.validate(postId);
  } catch (error) {
    socket.emit("unlike-post-error", { message: "Data validation error", postId });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const post = await PostModel.findOne({ _id: data.postId, visible: true });

  if (post === null) {
    socket.emit("unlike-post-error", { message: "Post not found", postId });
    return;
  }
  const user = await UserModel.findOne({ _id: post.publisherId, active: true });
  if (user === null) {
    socket.emit("unlike-post-error", { message: "User not found", postId });
    return;
  }

  const postLike = await PostLikeModel.findOneAndDelete({
    likerId: loggedInUserId,
    postId: post.id,
  });

  if (postLike === null) {
    return;
  }

  post.likesCount = post.likesCount > 0 ? post.likesCount - 1 : 0;
  await post.save();

  if (post.publisherId?.equals(loggedInUserId)) {
    return;
  }

  const notification = await NotificationModel.findOneAndDelete({
    initiatorId: loggedInUserId,
    receiverId: post?.publisherId,
    postLikeId: postLike?.id,
  });

  if (!notification?.seen) {
    user.unseenNotificationsCount = user.unseenNotificationsCount > 0 ? user.unseenNotificationsCount - 1 : 0;
  }

  socket.to(buildUserSelfRoomName(post.publisherId!)).emit("remove-received-notification", {
    notification,
    postLike,
    unseenNotificationsCount: user.unseenNotificationsCount,
  });

  await user.save();
};
