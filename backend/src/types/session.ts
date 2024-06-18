import { Types } from "mongoose";

export interface Session {
  sessionId: string;
  active: boolean;
  agent: string;
  ip: string;
  logoutAt?: Date;
  createdAt: Date;
  userId: Types.ObjectId;
  id: string;
}
