import { Socket } from "socket.io";
import FollowModel from "../models/follow-model";
import NotificationModel from "../models/notification-model";
import UserModel from "../models/user-model";
import { maxUserFollowingCount } from "../constants/follow-constants";
import { BlockModel } from "../models/block-model";
import { buildUserSelfRoomName } from "../utils/web-socket-utils";
import { idValidator } from "../validators/shared-validators";

export const followEvent = async (socket: Socket, data: any) => {
  try {
    await idValidator.validate(data.followedId);
  } catch (error) {
    socket.emit("follow-error", { message: "Data validation error" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  if (data.followedId === loggedInUserId) {
    socket.emit("follow-error", { message: "Can't follow himself" });
    return;
  }

  const followedUser = await UserModel.findOne({ _id: data.followedId, active: true });
  const userWhoFollow = await UserModel.findOne({ _id: loggedInUserId, active: true });
  if (followedUser === null || userWhoFollow === null) {
    socket.emit("follow-error", { message: "User not found" });
    return;
  }

  const userWhoWhantFollowBlock = (await BlockModel.findOne({
    blockerId: loggedInUserId,
    blockedId: data.followedId,
  }).populate("blocked")) as any;

  if (userWhoWhantFollowBlock !== null) {
    socket.emit("follow-error", {
      message: `You blocked ${userWhoWhantFollowBlock.blocked.displayName}. You can't follow him`,
    });
    return;
  }

  const userToFollowBlocked = (await BlockModel.findOne({
    blockerId: data.followedId,
    blockedId: loggedInUserId,
  }).populate("blocker")) as any;

  if (userToFollowBlocked !== null) {
    socket.emit("follow-error", {
      message: `${userToFollowBlocked.blocker.displayName} blocked you. You can't follow him`,
    });
    return;
  }

  //! You must set maximum followinf for an user to 7500
  const loggedInUserFollowingCount = await FollowModel.countDocuments({ followerId: loggedInUserId });
  if (loggedInUserFollowingCount >= maxUserFollowingCount) {
    socket.emit("follow-error", { message: `You can follow a maximum of ${maxUserFollowingCount} users` });
    return;
  }

  let follow = null;
  try {
    follow = await FollowModel.create({ followerId: loggedInUserId, followedId: data.followedId });
  } catch (error) {
    socket.emit("follow-success", { message: "Yes i return success in this case" });
    socket
      .to(buildUserSelfRoomName(loggedInUserId))
      .emit("follow-success", { message: "Yes i return success in this case" });
    return;
  }

  socket.emit("follow-success", { follow });
  socket.to(buildUserSelfRoomName(loggedInUserId)).emit("follow-success", { follow });

  const notification = await NotificationModel.create({
    initiatorId: loggedInUserId,
    receiverId: data.followedId,
    followId: follow.id,
  });
  await notification.populate("receiver");
  await notification.populate("follow");
  await notification.populate("initiator");

  followedUser.unseenNotificationsCount = followedUser.unseenNotificationsCount + 1;
  followedUser.followersCount = followedUser.followersCount + 1;

  socket.to(buildUserSelfRoomName(data.followedId)).emit("receive-notification", {
    unseenNotificationsCount: followedUser.unseenNotificationsCount,
  });

  await followedUser.save();

  userWhoFollow.followingCount = userWhoFollow.followingCount + 1;
  await userWhoFollow.save();
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

export const unfollowEvent = async (socket: Socket, data: any) => {
  try {
    await idValidator.validate(data.followedId);
  } catch (error) {
    socket.emit("unfollow-error", { message: "Data validation error" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  if (data.followedId === loggedInUserId) {
    socket.emit("unfollow-error", { message: "Error" });
    return;
  }

  const followedUser = await UserModel.findOne({ _id: data.followedId, active: true });
  const userWhoFollow = await UserModel.findOne({ _id: loggedInUserId, active: true });
  if (followedUser === null || userWhoFollow === null) {
    socket.emit("unfollow-error", { message: "Error" });
    return;
  }

  const follow = await FollowModel.findOneAndDelete(
    {
      followerId: loggedInUserId,
      followedId: data.followedId,
    },
    { returnOriginal: true }
  );

  if (follow === null) {
    socket.emit("unfollow-success");
    socket.to(buildUserSelfRoomName(loggedInUserId)).emit("unfollow-success");
    return;
  }

  socket.emit("unfollow-success", { follow });
  socket.to(buildUserSelfRoomName(loggedInUserId)).emit("unfollow-success", { follow });

  const notification = await NotificationModel.findOneAndDelete(
    {
      initiatorId: loggedInUserId,
      receiverId: data.followedId,
      followId: follow.id,
    },
    { returnOriginal: true }
  );

  followedUser.followersCount = followedUser.followersCount > 0 ? followedUser.followersCount - 1 : 0;

  if (!notification?.seen) {
    followedUser.unseenNotificationsCount =
      followedUser?.unseenNotificationsCount > 0 ? followedUser.unseenNotificationsCount - 1 : 0;
  }
  //
  // await
  socket.to(buildUserSelfRoomName(data.followedId)).emit("remove-received-notification", {
    notification,
    unseenNotificationsCount: followedUser.unseenNotificationsCount,
  });

  await followedUser.save();

  userWhoFollow.followingCount = userWhoFollow.followingCount > 0 ? userWhoFollow.followingCount - 1 : 0;
  await followedUser.save();
};
