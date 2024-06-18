import { Schema, model } from "mongoose";
import { mongoDbTypes } from "./mongodb-types";
import {
  followModelName,
  notificationModelName,
  postCommentLikeModelName,
  postCommentModelName,
  postLikeModelName,
  userModelName,
} from "./model-names";

const notificationSchema = new Schema({
  initiatorId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
  },
  receiverId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  followId: {
    type: mongoDbTypes.ObjectId,
    ref: followModelName,
  },
  postLikeId: {
    type: mongoDbTypes.ObjectId,
    ref: postLikeModelName,
  },
  seen: {
    type: mongoDbTypes.Boolean,
    default: false,
    index: true,
  },
  seenAt: {
    type: mongoDbTypes.Date,
  },
  postCommentId: {
    type: mongoDbTypes.ObjectId,
    ref: postCommentModelName,
  },
  parentPostCommentId: {
    type: mongoDbTypes.ObjectId,
    ref: postCommentModelName,
  },
  postCommentLikeId: {
    type: mongoDbTypes.ObjectId,
    ref: postCommentLikeModelName,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

notificationSchema.virtual("receiver", {
  ref: userModelName,
  localField: "receiverId",
  foreignField: "_id",
  justOne: true,
});
notificationSchema.virtual("initiator", {
  ref: userModelName,
  localField: "initiatorId",
  foreignField: "_id",
  justOne: true,
});
notificationSchema.virtual("follow", {
  ref: followModelName,
  localField: "followId",
  foreignField: "_id",
  justOne: true,
});
notificationSchema.virtual("postLike", {
  ref: postLikeModelName,
  localField: "postLikeId",
  foreignField: "_id",
  justOne: true,
});
notificationSchema.virtual("postComment", {
  ref: postCommentModelName,
  localField: "postCommentId",
  foreignField: "_id",
  justOne: true,
});
notificationSchema.virtual("parentPostComment", {
  ref: postCommentModelName,
  localField: "parentPostCommentId",
  foreignField: "_id",
  justOne: true,
});
notificationSchema.virtual("postCommentLike", {
  ref: postCommentLikeModelName,
  localField: "postCommentLikeId",
  foreignField: "_id",
  justOne: true,
});

notificationSchema.set("toJSON", {
  virtuals: true,
});

notificationSchema.set("toObject", {
  virtuals: true,
});

const NotificationModel = model(notificationModelName, notificationSchema);

export default NotificationModel;
