import mongoose from "mongoose";
import { MONGODB_URL } from "../configs";
import ReportReasonModel from "../models/report-reason-model";
import { reportReasons } from "../data/report-reasons";

try {
  await mongoose.connect(MONGODB_URL, {
    autoIndex: true,
    autoCreate: true,
  });

  const reportReasonsTitle = reportReasons.map(({ title }) => title);

  const reportReasonsInDb = await ReportReasonModel.find({ title: { $in: reportReasonsTitle } });
  if (reportReasonsInDb.length === 0) {
    throw Error("You must seed report reasons");
  }
  if (reportReasonsInDb.length !== reportReasons.length) {
    throw Error("Some report reasons miss, you must add them manually");
  }
  process.exit(0);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
