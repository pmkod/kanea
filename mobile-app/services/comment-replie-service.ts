import { PostComment } from "@/types/post-comment";
import { httpClient } from "./http-client";

export const getCommentRepliesRequest = async (
  commentId: string,
  {
    page,
    limit,
    firstPageRequestedAt,
  }: {
    page: number;
    limit: number;
    firstPageRequestedAt: Date;
  }
): Promise<{
  postComments: PostComment[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient
    .get(`comments/${commentId}/replies`, { searchParams })
    .json();
};
