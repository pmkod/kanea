import { Message } from "./message";
import { User } from "./user";

export interface Discussion {
  id: string;
  name?: string;
  picture?: {
    bestQualityFileName: string;
    mediumQualityFileName: string;
    lowQualityFileName: string;
  };
  members: {
    userId: string;
    user: User;
    unseenDiscussionMessagesCount: number;
    isAdmin: boolean;
  }[];
  lastMessage?: Message;
  lastMessageId?: string;
  lastMessageSentAt?: Date;
  createdAt: Date;
}
