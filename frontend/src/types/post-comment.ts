import { User } from "./user";

export interface PostComment {
  id: string;
  postId: string;
  text: string;
  commenter: User;
  commenterId: string;
  likesCount: number;
  parentPostCommentId?: string;
  parentPostComment?: PostComment;
  descendantPostCommentsCount: number;
  childPostCommentsCount: number;
  mostDistantParentPostCommentId?: string;
  likedByLoggedInUser: boolean;
  createdAt: Date;
}
