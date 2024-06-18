import { Socket } from "socket.io";
import { BlockModel } from "../models/block-model";
import FollowModel from "../models/follow-model";
import NotificationModel from "../models/notification-model";
import UserModel from "../models/user-model";
import { buildUserSelfRoomName } from "../utils/web-socket-utils";
import { idValidator } from "../validators/shared-validators";

export const blockUserEvent = async (socket: Socket, data: any) => {
  let userToBlockId = "";

  try {
    userToBlockId = await idValidator.validate(data.userToBlockId);
  } catch (error) {
    socket.emit("block-user-error", { message: "Data validation error" });
    return;
  }
  const loggedInUserId = socket.data.session.userId.toString();

  if (userToBlockId === loggedInUserId) {
    socket.emit("block-user-error", { message: "You can't block yourself" });
    return;
  }

  const loggedInUser = await UserModel.findOne({ _id: loggedInUserId, active: true });
  if (loggedInUser === null) {
    socket.emit("block-user-error", { message: "User not found" });
    return;
  }

  const userToBlock = await UserModel.findOne({ _id: userToBlockId, active: true });
  if (userToBlock === null) {
    socket.emit("block-user-error", { message: "User not found" });
    return;
  }

  try {
    await BlockModel.create({ blockerId: loggedInUserId, blockedId: userToBlockId });
  } catch (error) {
    socket.emit("block-user-success", { blockedUser: userToBlock, userWhoBlocked: loggedInUser });
    socket
      .to(buildUserSelfRoomName(loggedInUser.id))
      .emit("has-blocked-an-user", { blockedUser: userToBlock, userWhoBlocked: loggedInUser });

    return;
  }
  //
  //
  //
  const loggedInUserFollowUserToBlock = await FollowModel.findOneAndDelete(
    { followerId: loggedInUserId, followedId: userToBlockId },
    { returnOriginal: true }
  );
  if (loggedInUserFollowUserToBlock !== null) {
    userToBlock.followersCount = userToBlock.followersCount > 0 ? userToBlock.followersCount - 1 : 0;
    loggedInUser.followingCount = loggedInUser.followingCount - 1;
    await loggedInUser.save();
    await userToBlock?.save();
    const notification = await NotificationModel.findOneAndDelete({ followId: loggedInUserFollowUserToBlock.id });
    if (notification !== null && !notification.seen) {
      userToBlock.unseenNotificationsCount =
        userToBlock.unseenNotificationsCount > 0 ? userToBlock.unseenNotificationsCount - 1 : 0;

      socket.to(buildUserSelfRoomName(userToBlock.id)).emit("update-unseen-notifications-count", {
        user: userToBlock,
      });
    }
  }

  const userToBlockFollowLoggedInUser = await FollowModel.findOneAndDelete(
    { followerId: userToBlockId, followedId: loggedInUserId },
    { returnOriginal: true }
  );

  if (userToBlockFollowLoggedInUser !== null) {
    const notification = await NotificationModel.findOneAndDelete({ followId: userToBlockFollowLoggedInUser.id });

    if (notification !== null && !notification.seen) {
      const user = await UserModel.findOneAndUpdate(
        { _id: notification.initiatorId },
        { $inc: { followingCount: -1 } },
        { new: true }
      );
      loggedInUser.followersCount = loggedInUser.followersCount > 0 ? loggedInUser.followersCount - 1 : 0;
      loggedInUser.unseenNotificationsCount =
        loggedInUser.unseenNotificationsCount > 0 ? loggedInUser.unseenNotificationsCount - 1 : 0;

      await loggedInUser.save();

      socket.emit("update-unseen-notifications-count", {
        unseenNotificationsCount: user.unseenNotificationsCount,
      });
      socket.to(buildUserSelfRoomName(user?.id)).emit("update-unseen-notifications-count", {
        unseenNotificationsCount: user.unseenNotificationsCount,
      });
    }
  }

  socket.emit("block-user-success", { blockedUser: userToBlock, userWhoBlocked: loggedInUser });

  socket
    .to(buildUserSelfRoomName(loggedInUser.id))
    .emit("has-blocked-an-user", { blockedUser: userToBlock, userWhoBlocked: loggedInUser });

  const blockedUser = await UserModel.findOne({ _id: userToBlockId });
  socket
    .to(buildUserSelfRoomName(blockedUser?.id))
    .emit("blocked-by-an-user", { blockedUser: userToBlock, userWhoBlocked: loggedInUser });
};

//
//
//
//
//
//
//

export const unblockUserEvent = async (socket: Socket, data: any) => {
  let userToUnblockId = "";

  try {
    userToUnblockId = await idValidator.validate(data.userToUnblockId);
  } catch (error) {
    socket.emit("unblock-user-error", { message: "Data validation error" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const userToUnblock = await UserModel.findOne({ _id: userToUnblockId });

  const loggedInUser = await UserModel.findOne({ _id: loggedInUserId });
  if (userToUnblock === null || loggedInUser === null) {
    socket.emit("unblock-user-error", { message: "Error" });
    return;
  }

  try {
    await BlockModel.deleteOne({ blockerId: loggedInUserId, blockedId: userToUnblockId }).orFail();
  } catch (error) {
    socket.emit("unblock-user-success", { unblockedUser: userToUnblock, userWhoUnblocked: loggedInUser });
    socket
      .to(buildUserSelfRoomName(loggedInUser.id))
      .emit("has-unblocked-an-user", { unblockedUser: userToUnblock, userWhoUnblocked: loggedInUser });
    return;
  }

  socket.emit("unblock-user-success", { unblockedUser: userToUnblock, userWhoUnblocked: loggedInUser });

  socket
    .to(buildUserSelfRoomName(loggedInUser.id))
    .emit("has-unblocked-an-user", { unblockedUser: userToUnblock, userWhoUnblocked: loggedInUser });

  socket
    .to(buildUserSelfRoomName(userToUnblock.id))
    .emit("unblocked-by-an-user", { unblockedUser: userToUnblock, userWhoUnblocked: loggedInUser });
};
