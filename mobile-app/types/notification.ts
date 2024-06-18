import { Follow } from "./follow";
import { PostComment } from "./post-comment";
import { PostCommentLike } from "./post-comment-like";
import { PostLike } from "./post-like";
import { User } from "./user";

export interface Notification {
  id: string;
  initiatorId: string;
  initiator: User;
  receiver: User;
  postLikeId?: string;
  postLike?: PostLike;
  postCommentId?: string;
  postComment?: PostComment;
  parentPostCommentId?: string;
  parentPostComment?: PostComment;
  postCommentLikeId?: string;
  postCommentLike?: PostCommentLike;
  followId?: string;
  follow?: Follow;
  createdAt: Date;
}
