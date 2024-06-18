import { Schema, model } from "mongoose";
import { mongoDbTypes } from "./mongodb-types";
import { reportReasonModelName } from "./model-names";

const reportReasonSchema = new Schema({
  title: {
    type: mongoDbTypes.String,
  },
  description: {
    type: mongoDbTypes.String,
  },
  createdAt: {
    type: mongoDbTypes.Date,
    default: Date.now,
  },
});

reportReasonSchema.set("toJSON", {
  virtuals: true,
});

reportReasonSchema.set("toObject", {
  virtuals: true,
});

const ReportReasonModel = model(reportReasonModelName, reportReasonSchema);

export default ReportReasonModel;
