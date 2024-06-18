import { User } from "./user";

export interface Follow {
  id: string;
  followedId: string;
  follower: User;
  followed: User;
  followerId: string;
  createdAt: Date;
}
