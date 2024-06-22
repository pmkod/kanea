import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import { getActiveSession, getSessionIdFromIncomingMessage } from "../utils/session-utils";
import { UnauthorizedException } from "../utils/exception-utils";

export const requireAuth = async (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
  const sessionId = await getSessionIdFromIncomingMessage(request.raw);
  try {
    const session = await getActiveSession(sessionId);
    request.session = session;
  } catch (error) {
    throw new UnauthorizedException();
  }
};
