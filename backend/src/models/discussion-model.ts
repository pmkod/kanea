import { Schema, model } from "mongoose";
import { discussionModelName, messageModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const discussionMemberSchema = new Schema({
  userId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  unseenDiscussionMessagesCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  isAdmin: {
    type: mongoDbTypes.Boolean,
    default: false,
  },
  lastSeenAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
  hasDeletedDiscussionForHim: {
    type: mongoDbTypes.Boolean,
    default: false,
    select: false,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

discussionMemberSchema.virtual("user", {
  ref: userModelName,
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});
discussionMemberSchema.set("toJSON", {
  virtuals: true,
});
discussionMemberSchema.set("toObject", {
  virtuals: true,
});

const discussionSchema = new Schema({
  name: {
    type: mongoDbTypes.String,
  },
  picture: {
    bestQualityFileName: mongoDbTypes.String,
    mediumQualityFileName: mongoDbTypes.String,
    lowQualityFileName: mongoDbTypes.String,
  },
  members: [discussionMemberSchema],
  lastMessageId: {
    type: mongoDbTypes.ObjectId,
    ref: messageModelName,
  },
  creatorId: { type: mongoDbTypes.ObjectId, ref: userModelName },
  lastMessageSentAt: { type: mongoDbTypes.Date, index: true },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

discussionSchema.virtual("lastMessage", {
  ref: messageModelName,
  localField: "lastMessageId",
  foreignField: "_id",
  justOne: true,
});

discussionSchema.set("toJSON", {
  virtuals: true,
});

discussionSchema.set("toObject", {
  virtuals: true,
});

const DiscussionModel = model(discussionModelName, discussionSchema);

export default DiscussionModel;
