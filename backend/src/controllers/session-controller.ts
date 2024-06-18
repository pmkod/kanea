import { idValidator } from "../validators/shared-validators";
import SessionModel from "../models/session-model";
import { paginationQueryParamsValidator } from "../validators/shared-validators";
import { RecordNotFoundException } from "../utils/exception-utils";
import { FastifyReply, FastifyRequest } from "fastify";

//
//
//
//

export const getActiveSessions = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);

  const limit = query.limit || 30;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;
  const userId = request.session.userId;
  const sessionId = request.session.sessionId;

  const currentSession = await SessionModel.findOne({ sessionId, active: true }).select(["id", "agent", "createdAt"]);

  const otherSessions = await SessionModel.find({ userId, sessionId: { $ne: sessionId }, active: true })
    .select(["id", "agent", "createdAt"])
    .skip(startIndex)
    .limit(limit)
    .sort({ createdAt: "desc" });

  const nextPage = otherSessions.length + 1 > limit ? page + 1 : undefined;

  if (nextPage) {
    otherSessions.pop();
  }

  reply.send({ otherSessions, currentSession, nextPage });
};

//
//
//
//
//

export const getActiveSessionById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const id = await idValidator.validate(request.params.id);

  const userId = request.session.userId;
  const currentSessionId = request.session.sessionId;

  const session = await SessionModel.findOne({ _id: id, active: true, userId }).select([
    "id",
    "agent",
    "createdAt",
    "sessionId",
  ]);
  if (session === null) {
    throw new RecordNotFoundException("Session not found");
  }

  const isCurrentSession = session.sessionId === currentSessionId;
  session.sessionId = undefined;

  reply.send({ session: { ...session.toObject(), isCurrentSession } });
};

//
//
//
//
//

export const logoutOfSession = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const id = await idValidator.validate(request.params.id);

  const userId = request.session.userId;

  if (id === request.session.id) {
    throw Error("Error");
  }

  await SessionModel.updateOne(
    { _id: id, userId },
    {
      $set: {
        active: false,
        logoutAt: Date.now(),
      },
    }
  );
  reply.send({ message: "Success" });
};

//
//
//
//
//

export const logoutOfOthersSession = async (request: FastifyRequest, reply: FastifyReply) => {
  const sessionId = request.session.sessionId;
  const userId = request.session.userId;

  await SessionModel.updateMany(
    {
      userId,
      sessionId: { $ne: sessionId },
    },
    {
      active: false,
      logoutAt: Date.now(),
    }
  );

  reply.send({ message: "Success" });
};
