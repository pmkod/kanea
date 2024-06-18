import { Schema, model } from "mongoose";
import { postCommentLikeModelName, postCommentModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const postCommentLikeSchema = new Schema({
  likerId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  postCommentId: {
    type: mongoDbTypes.ObjectId,
    ref: postCommentModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

postCommentLikeSchema.virtual("liker", {
  ref: userModelName,
  localField: "likerId",
  foreignField: "_id",
  justOne: true,
});

postCommentLikeSchema.set("toJSON", {
  virtuals: true,
});

postCommentLikeSchema.index({ postCommentId: 1, likerId: 1 }, { unique: true });

const PostCommentLikeModel = model(postCommentLikeModelName, postCommentLikeSchema);

export default PostCommentLikeModel;
