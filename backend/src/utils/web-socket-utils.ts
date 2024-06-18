import { Types } from "mongoose";
//
//
//

export const buildUserSelfRoomName = (userId: string | Types.ObjectId) => {
  return "user_" + userId.toString();
};

//
//
//
//
//

export const buildEachUserSelfRoomName = (userIds: (string | Types.ObjectId)[]) => {
  return userIds.map((userId) => buildUserSelfRoomName(userId));
};
