import { Schema, model } from "mongoose";
import { mongoDbTypes } from "./mongodb-types";
import { postModelName, userModelName } from "./model-names";

const postSchema = new Schema({
  text: {
    type: mongoDbTypes.String,
  },
  visible: {
    type: mongoDbTypes.Boolean,
    default: true,
    index: true,
  },
  medias: [
    {
      bestQualityFileName: mongoDbTypes.String,
      mediumQualityFileName: mongoDbTypes.String,
      lowQualityFileName: mongoDbTypes.String,
      mimetype: mongoDbTypes.String,
    },
  ],
  likesCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  commentsCount: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  publisherId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    index: true,
    default: Date.now,
  },
});

postSchema.virtual("publisher", {
  ref: userModelName,
  localField: "publisherId",
  foreignField: "_id",
  justOne: true,
});

postSchema.set("toJSON", {
  virtuals: true,
});

postSchema.set("toObject", {
  virtuals: true,
});

const PostModel = model(postModelName, postSchema);

export default PostModel;
