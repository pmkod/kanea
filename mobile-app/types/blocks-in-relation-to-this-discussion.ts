import { User } from "./user";

export interface BlocksInRelationToThisDiscussion {
  blocker: User;
  blocked: User;
  blockerId: string;
  blockedId: string;
}
