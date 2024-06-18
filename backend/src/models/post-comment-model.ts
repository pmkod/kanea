import { Schema, model } from "mongoose";
import { postCommentModelName, postModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const postCommentSchema = new Schema({
  postId: {
    type: mongoDbTypes.ObjectId,
    ref: postModelName,
    index: true,
  },
  text: {
    type: mongoDbTypes.String,
  },
  descendantPostCommentsCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  childPostCommentsCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  likesCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  commenterId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  mostDistantParentPostCommentId: {
    type: mongoDbTypes.ObjectId,
    ref: postCommentModelName,
    index: true,
  },
  parentPostCommentId: {
    type: mongoDbTypes.ObjectId,
    ref: postCommentModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

postCommentSchema.virtual("commenter", {
  ref: userModelName,
  localField: "commenterId",
  foreignField: "_id",
  justOne: true,
});

postCommentSchema.virtual("parentPostComment", {
  ref: postCommentModelName,
  localField: "parentPostCommentId",
  foreignField: "_id",
  justOne: true,
});

postCommentSchema.set("toJSON", {
  virtuals: true,
});

postCommentSchema.set("toObject", {
  virtuals: true,
});

const PostCommentModel = model(postCommentModelName, postCommentSchema);

export default PostCommentModel;
