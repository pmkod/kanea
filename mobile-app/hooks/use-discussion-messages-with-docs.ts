import {
  discussionsQueryKey,
  messagesWithDocsQueryKey,
} from "@/constants/query-keys";
import { getDiscussionMessagesWithDocsRequest } from "@/services/discussion-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useDiscussionMessagesWithDocs = ({
  discussionId,
  firstPageRequestedAt,
}: {
  firstPageRequestedAt?: Date;
  discussionId: string;
}) =>
  useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [discussionsQueryKey, discussionId, messagesWithDocsQueryKey],
    queryFn: (query) =>
      getDiscussionMessagesWithDocsRequest(discussionId, {
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    enabled: firstPageRequestedAt !== undefined,
  });
