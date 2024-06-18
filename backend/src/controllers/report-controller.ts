import { makeReportValidator } from "../validators/report-validator";
import ReportModel from "../models/report-model";
import { FastifyReply, FastifyRequest } from "fastify";

export const makeReport = async (request: FastifyRequest, reply: FastifyReply) => {
  const {
    customReason,
    reportReasonId,
    reportedDiscussionId,
    reportedMessageId,
    reportedPostCommentId,
    reportedPostId,
    reportedUserId,
  } = await makeReportValidator.validate(request.body);

  const reportedRessources = [
    reportedDiscussionId,
    reportedMessageId,
    reportedPostCommentId,
    reportedPostId,
    reportedUserId,
  ];

  const reasons = [customReason, reportReasonId];
  if (
    reasons.filter((r) => r !== undefined).length !== 1 ||
    reportedRessources.filter((r) => r !== undefined).length !== 1
  ) {
    throw Error("Error");
  }

  const loggedInUserId = request.session.userId;

  await ReportModel.create({
    reporterId: loggedInUserId,
    customReason,
    reportReasonId,
    reportedDiscussionId,
    reportedMessageId,
    reportedPostCommentId,
    reportedPostId,
    reportedUserId,
  });
  reply.send({ message: "Success" });
};
