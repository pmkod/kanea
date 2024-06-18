import { Schema, model } from "mongoose";
import { postLikeModelName, postModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const postLikeSchema = new Schema({
  postId: {
    type: mongoDbTypes.ObjectId,
    ref: postModelName,
    index: true,
  },
  likerId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

postLikeSchema.index({ postId: 1, likerId: 1 }, { unique: true });

postLikeSchema.virtual("liker", {
  ref: userModelName,
  localField: "likerId",
  foreignField: "_id",
  justOne: true,
});

postLikeSchema.virtual("post", {
  ref: postModelName,
  localField: "postId",
  foreignField: "_id",
  justOne: true,
});

postLikeSchema.set("toJSON", {
  virtuals: true,
});

postLikeSchema.set("toObject", {
  virtuals: true,
});

const PostLikeModel = model(postLikeModelName, postLikeSchema);

export default PostLikeModel;
