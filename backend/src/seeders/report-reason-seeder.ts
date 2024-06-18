import mongoose from "mongoose";
import ReportReasonModel from "../models/report-reason-model";
import { MONGODB_URL } from "../configs";
import { reportReasons } from "../data/report-reasons";

await mongoose.connect(MONGODB_URL!, {
  autoCreate: true,
});

try {
  await ReportReasonModel.create(reportReasons);
  console.log("Report reasons seed success");
  process.exit(0);
} catch (error) {
  console.log("Report reasons seed error");
  process.exit(1);
}
