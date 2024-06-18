import { Schema, model } from "mongoose";
import { discussionModelName, messageModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const messageSchema = new Schema({
  text: mongoDbTypes.String,
  discussionId: {
    type: mongoDbTypes.ObjectId,
    ref: discussionModelName,
    index: true,
  },
  senderId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
  },
  parentMessageId: {
    type: mongoDbTypes.ObjectId,
    ref: messageModelName,
  },
  viewers: {
    type: [{ viewerId: mongoDbTypes.ObjectId, viewAt: mongoDbTypes.Date }],
  },
  medias: [
    {
      bestQualityFileName: mongoDbTypes.String,
      mediumQualityFileName: mongoDbTypes.String,
      lowQualityFileName: mongoDbTypes.String,
      mimetype: mongoDbTypes.String,
    },
  ],
  voiceNote: {
    fileName: mongoDbTypes.String,
    durationInMs: mongoDbTypes.Number,
  },
  docs: [
    {
      fileName: mongoDbTypes.String,
      originalFileName: mongoDbTypes.String,
      mimetype: mongoDbTypes.String,
    },
  ],
  usersWhoDeletedTheMessageForThem: [mongoDbTypes.ObjectId],
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

messageSchema.virtual("sender", {
  ref: userModelName,
  localField: "senderId",
  foreignField: "_id",
  justOne: true,
});

messageSchema.virtual("parentMessage", {
  ref: messageModelName,
  localField: "parentMessageId",
  foreignField: "_id",
  justOne: true,
  getters: true,
  // options: {populate: {}}
});

messageSchema.set("toJSON", {
  virtuals: true,
});

messageSchema.set("toObject", {
  virtuals: true,
});

const MessageModel = model(messageModelName, messageSchema);

export default MessageModel;
