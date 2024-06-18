import { User } from "./user";

export interface Message {
  id: string;
  text?: string;
  senderId: string;
  discussionId: string;
  sender: User;
  parentMessageId: string;
  parentMessage: Message;
  voiceNote?: {
    fileName: string;
    durationInMs: number;
  };
  docs: {
    fileName: string;
    originalFileName: string;
    mimetype: string;
  }[];
  medias: {
    bestQualityFileName: string;
    mediumQualityFileName: string;
    lowQualityFileName: string;
    mimetype: string;
  }[];
  viewers: { viewerId: string; viewAt: Date }[];
  usersWhoDeletedTheMessageForThem: string[];
  createdAt: Date;
}
