import {
  discussionsQueryKey,
  messagesWithMediasQueryKey,
} from "@/constants/query-keys";
import { getDiscussionMessagesWithMediasRequest } from "@/services/discussion-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useDiscussionMessagesWithMedias = ({
  discussionId,
  firstPageRequestedAt,
}: {
  firstPageRequestedAt?: Date;
  discussionId: string;
}) =>
  useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [discussionsQueryKey, discussionId, messagesWithMediasQueryKey],
    queryFn: (query) =>
      getDiscussionMessagesWithMediasRequest(discussionId, {
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    getPreviousPageParam: (lastPage, _) => {
      return lastPage.page > 1 ? lastPage.page - 1 : undefined;
    },
    enabled: firstPageRequestedAt !== undefined,
  });
