import { Schema, model } from "mongoose";
import { mongoDbTypes } from "./mongodb-types";
import { followModelName, userModelName } from "./model-names";

const followSchema = new Schema({
  followedId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  followerId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

followSchema.index({ followedId: 1, followerId: 1 }, { unique: true });

followSchema.virtual("followed", {
  ref: userModelName,
  localField: "followedId",
  foreignField: "_id",
  justOne: true,
});

followSchema.virtual("follower", {
  ref: userModelName,
  localField: "followerId",
  foreignField: "_id",
  justOne: true,
});

followSchema.set("toJSON", {
  virtuals: true,
});

followSchema.set("toObject", {
  virtuals: true,
});

const FollowModel = model(followModelName, followSchema);

export default FollowModel;
