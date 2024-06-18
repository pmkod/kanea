import { Schema, Types, model } from "mongoose";
import { emailVerificationModelName, userModelName } from "./model-names";
import { mongoDbTypes } from "./mongodb-types";

interface EmailVerification {
  userId: Types.ObjectId;
  otp: string;
  attempt: number;
  ip: string;
  signupData: {
    email: string;
    signupCompletedAt: Date;
  };
  changeEmailData: {
    email: string;
  };
  passwordResetData: {
    prevPassword: string;
    resetAt: Date;
  };
  agent: string;
  purpose: string;
  verified: boolean;
  verifiedAt: Date;
  createdAt: Date;
}

const emailVerificationSchema = new Schema<EmailVerification>({
  userId: {
    type: mongoDbTypes.ObjectId,
    ref: userModelName,
    index: true,
  },
  otp: {
    type: mongoDbTypes.String,
  },

  agent: {
    type: mongoDbTypes.String,
  },
  signupData: {
    type: {
      email: {
        type: mongoDbTypes.String,
      },
      signupCompletedAt: {
        type: mongoDbTypes.Date,
      },
    },
    default: undefined,
  },
  changeEmailData: {
    type: {
      email: {
        type: mongoDbTypes.String,
      },
    },
    default: undefined,
  },
  attempt: {
    type: mongoDbTypes.Number,
    default: 0,
  },
  ip: {
    type: mongoDbTypes.String,
  },
  purpose: {
    type: mongoDbTypes.String,
  },
  passwordResetData: {
    prevPassword: {
      type: mongoDbTypes.String,
    },
    resetAt: {
      type: mongoDbTypes.Date,
    },
  },
  verified: {
    type: mongoDbTypes.Boolean,
    default: false,
  },
  verifiedAt: {
    type: mongoDbTypes.Date,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

emailVerificationSchema.virtual("user", {
  ref: userModelName,
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

emailVerificationSchema.set("toObject", { virtuals: true });
emailVerificationSchema.set("toJSON", { virtuals: true });

const EmailVerificationModel = model<EmailVerification>(emailVerificationModelName, emailVerificationSchema);

export default EmailVerificationModel;
