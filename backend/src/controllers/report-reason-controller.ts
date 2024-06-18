import ReportReasonModel from "../models/report-reason-model";
import { FastifyReply, FastifyRequest } from "fastify";

//
//
//
//
//
//
//
//
//
//

//
export const getReportReasons = async (_: FastifyRequest, reply: FastifyReply) => {
  const reportReasons = await ReportReasonModel.find().select(["id", "title", "description"]);
  reply.send({ reportReasons });
};
