import * as mongoose from "mongoose";
import { userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

export interface User {
  id: string;
  displayName: string;
  email: string;
  bio: string;
  userName: string;
  followersCount: number;
  postsCount: number;
  followingCount: number;
  unseenNotificationsCount: number;
  online: boolean;
  previouslyOnlineAt: Date;
  unseenDiscussionMessagesCount: number;
  profilePicture: {
    bestQualityFileName: string;
    mediumQualityFileName: string;
    lowQualityFileName: string;
  };
  expireAt?: Date;
  password: string;
  emailVerified: boolean;
  active: boolean;
  allowOtherUsersToSeeMyOnlineStatus: boolean;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<User>({
  displayName: {
    type: mongoDbTypes.String,
  },
  profilePicture: {
    bestQualityFileName: mongoDbTypes.String,
    mediumQualityFileName: mongoDbTypes.String,
    lowQualityFileName: mongoDbTypes.String,
  },
  online: {
    type: mongoDbTypes.Boolean,
  },
  previouslyOnlineAt: {
    type: mongoDbTypes.Date,
  },
  followersCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  postsCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  followingCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  unseenNotificationsCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  unseenDiscussionMessagesCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  bio: {
    type: mongoDbTypes.String,
  },
  email: {
    type: mongoDbTypes.String,
    unique: true,
    select: false,
  },
  userName: {
    type: mongoDbTypes.String,
    unique: true,
    sparse: true,
  },
  password: {
    type: mongoDbTypes.String,
    select: false,
  },
  emailVerified: {
    type: mongoDbTypes.Boolean,
    default: false,
  },
  active: {
    type: mongoDbTypes.Boolean,
    default: false,
    index: true,
  },
  allowOtherUsersToSeeMyOnlineStatus: {
    type: mongoDbTypes.Boolean,
    default: true,
    // select: false,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

userSchema.set("toJSON", {
  virtuals: true,
});

userSchema.set("toObject", {
  virtuals: true,
});

const UserModel = mongoose.model<User>(userModelName, userSchema);

export default UserModel;
