import { Socket } from "socket.io";
import PostCommentModel from "../models/post-comment-model";
import PostModel from "../models/post-model";
import NotificationModel from "../models/notification-model";
import UserModel from "../models/user-model";
import { BlockModel } from "../models/block-model";
import { buildUserSelfRoomName } from "../utils/web-socket-utils";
import { commentPostValidator } from "../validators/post-validator";
import { idValidator } from "../validators/shared-validators";

export const commentPostEvent = async (socket: Socket, data: any) => {
  const loggedInUserId = socket.data.session.userId.toString();

  try {
    data = await commentPostValidator.validate(data);
  } catch (error) {
    socket.emit("comment-post-error", { message: "Post comment invalid" });
    return;
  }

  let post = null;
  try {
    post = await PostModel.findOneAndUpdate(
      { _id: data.postId, visible: true },
      { $inc: { commentsCount: 1 } }
    ).orFail();
  } catch (error) {
    return "";
  }

  const postPublisherBlockedLoggedInUser = await BlockModel.findOne({
    blockerId: post.publisherId,
    blockedId: loggedInUserId,
  });

  if (postPublisherBlockedLoggedInUser !== null) {
    socket.emit("comment-post-error", { message: "The publisher of this post blocked you" });
    return;
  }

  const loggedInUserBlockedPostPublisher = await BlockModel.findOne({
    blockerId: loggedInUserId,
    blockedId: post.publisherId,
  });

  if (loggedInUserBlockedPostPublisher !== null) {
    socket.emit("comment-post-error", { message: "You blocked the publisher of this post" });
    return;
  }

  let postComment = await PostCommentModel.create({
    commenterId: loggedInUserId,
    text: data.text,
    postId: post.id,
  });

  if (post.publisherId?.toString() !== loggedInUserId) {
    const postPublisher = await UserModel.findOneAndUpdate(
      { _id: post.publisherId },
      { $inc: { unseenNotificationsCount: 1 } },
      { new: true }
    );

    if (postPublisher === null) {
      return;
    }
    const notification = await NotificationModel.create({
      initiatorId: loggedInUserId,
      receiverId: post.publisherId,
      postCommentId: postComment.id,
    });

    await notification.populate("initiator");
    await notification.populate("receiver");
    await notification.populate("postComment");

    socket.to(buildUserSelfRoomName(post.publisherId!)).emit("receive-notification", {
      notification,
      unseenNotificationsCount: postPublisher.unseenNotificationsCount,
    });

    //
    //
  }

  //
  //

  if (data.parentPostCommentId !== undefined && data.mostDistantParentPostCommentId !== undefined) {
    let parentPostComment = null;
    let mostDistantParentPostComment = null;
    try {
      parentPostComment = await PostCommentModel.findById(data.parentPostCommentId).orFail();
      mostDistantParentPostComment = await PostCommentModel.findById(data.mostDistantParentPostCommentId).orFail();
    } catch (error) {
      return;
    }
    parentPostComment.childPostCommentsCount += 1;
    await parentPostComment.save();
    mostDistantParentPostComment.descendantPostCommentsCount += 1;
    await mostDistantParentPostComment.save();

    postComment.parentPostCommentId = data.parentPostCommentId;
    postComment.mostDistantParentPostCommentId = data.mostDistantParentPostCommentId;
    postComment = await postComment.save();

    if (parentPostComment.commenterId?.toString() !== loggedInUserId) {
      const parentPostCommentAuthor = await UserModel.findOneAndUpdate(
        { _id: parentPostComment.commenterId },
        { $inc: { unseenNotificationsCount: 1 } },
        { new: true }
      );

      const notification = await NotificationModel.create({
        initiatorId: loggedInUserId,
        receiverId: parentPostComment.commenterId,
        postCommentId: postComment.id,
        parentPostCommentId: parentPostComment.id,
      });

      if (parentPostCommentAuthor === null) {
        return;
      }

      await notification.populate("initiator");
      await notification.populate("receiver");
      await notification.populate("postComment");
      await notification.populate("parentPostComment");

      socket.to(buildUserSelfRoomName(parentPostComment.commenterId!)).emit("receive-notification", {
        notification,
        unseenNotificationsCount: parentPostCommentAuthor.unseenNotificationsCount,
      });
    }
    await postComment.populate({ path: "parentPostComment", populate: { path: "commenter" } });
  }
  await postComment.populate("commenter");
  socket.emit("comment-post-success", { postComment });
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
//
//
//
//
//

export const deletePostCommentEvent = async (socket: Socket, data: any) => {
  try {
    await idValidator.validate(data.postCommentId);
  } catch (error) {
    socket.emit("post-comment-delete-error", { message: "Post comment delete error" });
    return;
  }
  const loggedInUserId = socket.data.session.userId.toString();

  let postComment = null;
  let post = null;
  try {
    postComment = await PostCommentModel.findOne({
      _id: data.postCommentId,
      commenterId: loggedInUserId,
    }).orFail();
    post = await PostModel.findOne({ _id: postComment.postId }).orFail();
  } catch (error) {
    // socket.emit("post-comment-delete-error", { message: "Post comment delete error" });
    socket.emit("post-comment-delete-success", {
      postComment: {
        id: data.postCommentId,
      },
    });
    return;
  }

  post.commentsCount = post.commentsCount > 0 ? post.commentsCount - 1 : 0;
  await post.save();

  postComment = await PostCommentModel.findByIdAndDelete(postComment.id, { returnOriginal: true });

  if (!post?.publisherId?.equals(loggedInUserId)) {
    const notification = await NotificationModel.findOneAndDelete({
      initiatorId: loggedInUserId,
      receiverId: post.publisherId,
      postCommentId: postComment?.id,
    });

    const postPublisher = await UserModel.findOne({
      _id: post.publisherId,
      unseenNotificationsCount: { $gt: 0 },
    });
    //
    if (postPublisher !== null && !notification?.seen) {
      postPublisher.unseenNotificationsCount =
        postPublisher.unseenNotificationsCount > 0 ? postPublisher.unseenNotificationsCount - 1 : 0;
      await postPublisher.save();
    }

    socket.to(buildUserSelfRoomName(post.publisherId!)).emit("remove-received-notification", {
      notification,
      postComment,
      unseenNotificationsCount: postPublisher?.unseenNotificationsCount,
    });
  }

  socket.emit("post-comment-delete-success", { postComment });

  if (postComment?.parentPostCommentId !== undefined && postComment.mostDistantParentPostCommentId !== undefined) {
    let parentPostComment = null;
    let mostDistantParentPostComment = null;

    try {
      parentPostComment = await PostCommentModel.findById(data.parentPostCommentId).orFail();
      mostDistantParentPostComment = await PostCommentModel.findById(data.mostDistantParentPostCommentId).orFail();
    } catch (error) {
      socket.emit("post-comment-delete-error");
      return;
    }

    parentPostComment.childPostCommentsCount =
      parentPostComment.childPostCommentsCount > 0 ? parentPostComment.childPostCommentsCount - 1 : 0;
    await parentPostComment.save();

    mostDistantParentPostComment.descendantPostCommentsCount =
      mostDistantParentPostComment.descendantPostCommentsCount > 0
        ? mostDistantParentPostComment.descendantPostCommentsCount - 1
        : 0;
    await mostDistantParentPostComment.save();

    if (parentPostComment.commenterId?.toString() !== loggedInUserId) {
      const notification = await NotificationModel.findOneAndDelete({
        initiatorId: loggedInUserId,
        receiverId: parentPostComment.commenterId,
        postCommentId: postComment.id,
        parentPostCommentId: parentPostComment.id,
      });
      const parentPostCommentAuthor = await UserModel.findOne({
        _id: parentPostComment.commenterId,
        unseenNotificationsCount: { $gt: 0 },
      });

      if (parentPostCommentAuthor === null) {
        return;
      }
      if (!notification?.seen) {
        parentPostCommentAuthor.unseenNotificationsCount = parentPostCommentAuthor.unseenNotificationsCount - 1;
      }
      socket.to(buildUserSelfRoomName(parentPostComment.commenterId!)).emit("remove-received-notification", {
        notification,

        unseenNotificationsCount: parentPostCommentAuthor?.unseenNotificationsCount,
      });

      socket.emit("post-comment-delete-success", { postComment });

      await parentPostCommentAuthor?.save();
    }
  }
};
