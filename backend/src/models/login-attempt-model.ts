import { model, Schema } from "mongoose";
import { loginAttemptModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

const loginAttemptSchema = new Schema({
  ip: {
    type: mongoDbTypes.String,
    index: true,
  },
  success: {
    type: mongoDbTypes.Boolean,
  },

  agent: {
    type: mongoDbTypes.String,
  },
  email: {
    type: mongoDbTypes.String,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

loginAttemptSchema.set("toJSON", {
  virtuals: true,
});

loginAttemptSchema.set("toObject", {
  virtuals: true,
});

export const LoginAttemptModel = model(loginAttemptModelName, loginAttemptSchema);
