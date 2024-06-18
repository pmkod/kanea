import { model } from "mongoose";
import { Schema } from "mongoose";
import { blockModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const blockSchema = new Schema({
  blockerId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  blockedId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

blockSchema.index({ followedId: 1, followerId: 1 }, { unique: true });

blockSchema.virtual("blocker", {
  ref: userModelName,
  localField: "blockerId",
  foreignField: "_id",
  justOne: true,
});

blockSchema.virtual("blocked", {
  ref: userModelName,
  localField: "blockedId",
  foreignField: "_id",
  justOne: true,
});

blockSchema.set("toJSON", {
  virtuals: true,
});

blockSchema.set("toObject", {
  virtuals: true,
});

export const BlockModel = model(blockModelName, blockSchema);
