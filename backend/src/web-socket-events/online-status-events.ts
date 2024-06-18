import { Server, Socket } from "socket.io";
import { BlockModel } from "../models/block-model";
import DiscussionModel from "../models/discussion-model";
import UserModel from "../models/user-model";
import { buildEachUserSelfRoomName, buildUserSelfRoomName } from "../utils/web-socket-utils";

export const updateOnlineStatusEvent = async (io: Server<any>, socket: Socket) => {
  const loggedInUserId = socket.data.session.userId.toString();

  const loggedInUserSockets = await io.in(buildUserSelfRoomName(loggedInUserId)).fetchSockets();

  let atLeastOnWebsocketSessionExist = false;
  if (loggedInUserSockets.length >= 1) {
    atLeastOnWebsocketSessionExist = true;
  }

  const user = await UserModel.findOne({
    _id: loggedInUserId,
    active: true,
  });

  if (user === null) {
    socket.emit("update-online-status-error", { message: "" });
    return;
  }
  if (!user.allowOtherUsersToSeeMyOnlineStatus) {
    // socket.emit("update-online-status-error", { message: "" });
    return;
  }

  const onlineStatusChanged = atLeastOnWebsocketSessionExist !== user.online;

  if (!onlineStatusChanged) {
    return;
  }

  user.online = atLeastOnWebsocketSessionExist;

  if (!atLeastOnWebsocketSessionExist) {
    user.previouslyOnlineAt = new Date();
  }

  await user.save();

  const idOfUsersHeDiscussesWith = await getIdOfUsersHeDiscussesWith(loggedInUserId);
  socket.to(buildEachUserSelfRoomName(idOfUsersHeDiscussesWith)).emit("online-status-update-of-an-user", { user });
};

//
//
//
//
//

export const defineIfOtherUserCanSeeMyOnlineStatusEvent = async (socket: Socket) => {
  const loggedInUserId = socket.data.session.userId.toString();

  const user = await UserModel.findOne({
    _id: loggedInUserId,
    active: true,
  });

  if (user === null) {
    socket.emit("define-if-other-user-can-see-my-online-status-error", { message: "Error" });
    return;
  }

  user.allowOtherUsersToSeeMyOnlineStatus = !user.allowOtherUsersToSeeMyOnlineStatus;

  if (user.allowOtherUsersToSeeMyOnlineStatus) {
    user.online = true;
  } else {
    user.online = false;
    user.previouslyOnlineAt = new Date();
  }
  await user.save();
  socket.emit("define-if-other-user-can-see-my-online-status-success", { user });

  socket
    .to(buildUserSelfRoomName(loggedInUserId))
    .emit("define-if-other-user-can-see-my-online-status-success", { user });

  user.allowOtherUsersToSeeMyOnlineStatus = undefined as any;
  const idOfUsersHeDiscussesWith = await getIdOfUsersHeDiscussesWith(loggedInUserId);
  socket.to(buildEachUserSelfRoomName(idOfUsersHeDiscussesWith)).emit("online-status-update-of-an-user", { user });
};

//
//
//
//
//

const getIdOfUsersHeDiscussesWith = async (loggedInUserId: string) => {
  const privateDiscussions = await DiscussionModel.find({
    name: {
      $exists: false,
    },
    members: {
      $elemMatch: { userId: loggedInUserId },
    },
  });

  const idOfUsersHeBlocked = (await BlockModel.find({ $or: [{ blockerId: loggedInUserId }] })).map(({ blockedId }) =>
    blockedId?.toString()
  );

  return privateDiscussions
    .map(({ members }) =>
      members[0].userId?.equals(loggedInUserId) ? members[1].userId!.toString() : members[0].userId!.toString()
    )
    .filter((id) => !idOfUsersHeBlocked.includes(id));
};
