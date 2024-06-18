import { model, Schema } from "mongoose";
import { blockedIpModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const blockedIpSchema = new Schema({
  ip: {
    type: mongoDbTypes.String,
    index: true,
  },
  durationInMinute: {
    type: mongoDbTypes.Number,
  },
  isDurationIndefinite: {
    type: mongoDbTypes.Boolean,
    default: false,
  },
  cannotDoAnyAction: {
    type: mongoDbTypes.Boolean,
    default: false,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

blockedIpSchema.set("toJSON", {
  virtuals: true,
});

blockedIpSchema.set("toObject", {
  virtuals: true,
});

export const BlockedIpModel = model(blockedIpModelName, blockedIpSchema);
