import mongoose from "mongoose";
import ReportReasonModel from "../models/report-reason-model";
import { MONGODB_URL } from "../configs";
import { reportReasons } from "../data/report-reasons";

await mongoose.connect(MONGODB_URL!, {
  autoCreate: true,
});

try {
  await ReportReasonModel.create(reportReasons);
  process.exit(0);
} catch (error) {
  process.exit(1);
}
