import { PostComment } from "./post-comment";
import { User } from "./user";

export interface Post {
  id: string;
  text: string;
  publisher: User;
  publisherId: string;
  medias: {
    bestQualityFileName: string;
    mediumQualityFileName: string;
    lowQualityFileName: string;
    mimetype: string;
  }[];
  someComments: PostComment[];
  createdAt: Date;
  likesCount: number;
  commentsCount: number;
  likedByLoggedInUser: boolean;
}
