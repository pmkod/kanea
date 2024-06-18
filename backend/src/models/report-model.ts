import { Schema, model } from "mongoose";
import { mongoDbTypes } from "./mongodb-types";
import {
  discussionModelName,
  messageModelName,
  postCommentModelName,
  postModelName,
  reportModelName,
  reportReasonModelName,
  userModelName,
} from "./model-names";

const reportSchema = new Schema({
  customReason: {
    type: mongoDbTypes.String,
  },
  reportedDiscussionId: {
    type: mongoDbTypes.ObjectId,
    ref: discussionModelName,
  },
  reportedMessageId: {
    type: mongoDbTypes.ObjectId,
    ref: messageModelName,
  },
  reportedPostCommentId: {
    type: mongoDbTypes.ObjectId,
    ref: postCommentModelName,
  },
  reportedPostId: {
    type: mongoDbTypes.ObjectId,
    ref: postModelName,
  },
  reportedUserId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
  },
  reporterId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  reportReasonId: {
    type: mongoDbTypes.ObjectId,
    ref: reportReasonModelName,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

// reportSchema.index({ reporterId: 1, followerId: 1 }, { unique: true });
reportSchema.virtual("reporter", {
  ref: userModelName,
  localField: "reporterId",
  foreignField: "_id",
  justOne: true,
});
reportSchema.virtual("reportedUser", {
  ref: userModelName,
  localField: "reportedUserId",
  foreignField: "_id",
  justOne: true,
});
reportSchema.virtual("reportedMessage", {
  ref: messageModelName,
  localField: "reportedMessageId",
  foreignField: "_id",
  justOne: true,
});

reportSchema.virtual("reportedPost", {
  ref: postModelName,
  localField: "reportedPostId",
  foreignField: "_id",
  justOne: true,
});

reportSchema.virtual("reportedPostComment", {
  ref: postCommentModelName,
  localField: "reportedPostCommentId",
  foreignField: "_id",
  justOne: true,
});
reportSchema.virtual("reportedDiscussion", {
  ref: discussionModelName,
  localField: "reportedDiscussionId",
  foreignField: "_id",
  justOne: true,
});
reportSchema.virtual("reportReason", {
  ref: reportReasonModelName,
  localField: "reportReasonId",
  foreignField: "_id",
  justOne: true,
});

reportSchema.set("toJSON", {
  virtuals: true,
});

reportSchema.set("toObject", {
  virtuals: true,
});

const ReportModel = model(reportModelName, reportSchema);

export default ReportModel;
