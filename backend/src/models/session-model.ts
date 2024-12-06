import * as mongoose from "mongoose";
import { Types } from "mongoose";
import { sessionModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";
import { Session } from "../types/session";

const sessionSchema = new mongoose.Schema<Session>({
  sessionId: {
    type: mongoDbTypes.String,
    unique: true,
    select: false,
  },
  agent: {
    type: mongoDbTypes.String,
  },
  ip: {
    type: mongoDbTypes.String,
    select: false,
  },
  userId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

sessionSchema.virtual("user", {
  ref: userModelName,
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

sessionSchema.set("toObject", { virtuals: true });
sessionSchema.set("toJSON", { virtuals: true });

const SessionModel = mongoose.model<Session>(sessionModelName, sessionSchema);

export default SessionModel;
