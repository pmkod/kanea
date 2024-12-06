import { nanoid } from "nanoid";
import SessionModel from "../models/session-model";
import mongoose, { MongooseError, Types } from "mongoose";
import {
  maxSessionIdLength,
  minSessionIdLength,
  sessionIdFieldName,
  sessionMaxAgeInSec,
} from "../constants/session-constants";
import { getRandomInt } from "./random-utils";
import { addSecond, isBefore } from "@formkit/tempo";
import { random } from "radash";
import { Session } from "../types/session";
import { IncomingMessage } from "http";
import queryString from "query-string";
import { sessionIdValidator } from "../validators/auth-validators";
import { UnauthorizedException } from "./exception-utils";

export const generateSessionId = () => {
  return nanoid(getRandomInt(minSessionIdLength, maxSessionIdLength));
};

//
//

export const getSessionIdFromIncomingMessage = async (incomingMessage: IncomingMessage) => {
  try {
    const sessionId =
      queryString.parse(incomingMessage.url.split("?")[1])[sessionIdFieldName] ||
      incomingMessage.headers.authorization.split(" ")[1];
    return await sessionIdValidator.validate(sessionId);
  } catch (error) {
    throw new UnauthorizedException();
  }
};

//
//

interface CreateSessionData {
  userId: Types.ObjectId;
  agent: string;
  ip: string;
}

export const createSession = async ({ userId, agent, ip }: CreateSessionData) => {
  let sessionId = "";
  while (true) {
    sessionId = generateSessionId();
    try {
      await SessionModel.create({ sessionId, userId, agent, ip });
      return sessionId;
    } catch (error) {
      // break;
      if (error.name === "MongoError" && error.code === 11000) {
        continue;
      } else {
        break;
      }
    }
  }
};

//
//
//
//
//

export const getActiveSession = async (sessionId: string): Promise<Session> => {
  const session = await SessionModel.findOne({ sessionId }).select("+sessionId");

  if (session === null) {
    throw Error("Session error");
  }
  const sessionExpired = isBefore(addSecond(session.createdAt, sessionMaxAgeInSec), new Date());

  if (sessionExpired) {
    throw Error("Session error");
  }
  return session;
};

//
//
//
//
//

export const desactivateSession = async (sessionId: string) => {
  await SessionModel.updateOne({ sessionId }, { active: false });
};
