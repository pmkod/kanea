import { Post } from "./post";
import { User } from "./user";

export interface PostLike {
  id: string;
  postId: string;
  post: Post;
  liker: User;
  likerId: string;
  createdAt: Date;
}
