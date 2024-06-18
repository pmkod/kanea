import {
  postCommentRepliesQueryKey,
  postCommentsQueryKey,
} from "@/constants/query-keys";
import { getCommentRepliesRequest } from "@/services/comment-replie-service";
import { PostComment } from "@/types/post-comment";
import { useInfiniteQuery } from "@tanstack/react-query";

export const usePostCommentReplies = ({
  postComment,
  level,
  firstPageRequestedAt,
  canLoadReplies,
}: {
  postComment: PostComment;
  firstPageRequestedAt: Date;
  level: number;
  canLoadReplies: boolean;
}) =>
  useInfiniteQuery({
    queryKey: [
      postCommentsQueryKey,
      postComment.id,
      postCommentRepliesQueryKey,
    ],
    initialPageParam: 1,
    initialData: {
      pageParams: [],
      pages: [],
    },
    queryFn: ({ pageParam }) =>
      getCommentRepliesRequest(postComment.id, {
        page: pageParam,
        firstPageRequestedAt,
        limit: 5,
      }),
    getNextPageParam: (lastPage, _) =>
      lastPage !== undefined ? lastPage.nextPage : undefined,
    enabled:
      canLoadReplies && level === 1 && firstPageRequestedAt !== undefined,
  });
