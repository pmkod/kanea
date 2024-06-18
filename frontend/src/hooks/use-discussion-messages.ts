import { discussionsQueryKey, messagesQueryKey } from "@/constants/query-keys";
import { getDiscussionMessagesRequest } from "@/services/discussion-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useDiscussionMessages = (
  discussionId: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
  }
) =>
  useInfiniteQuery({
    queryKey: [discussionsQueryKey, discussionId, messagesQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getDiscussionMessagesRequest(discussionId.toString(), {
        page: query.pageParam,
        limit: 20,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    getPreviousPageParam: (lastPage, _) => {
      return lastPage.page > 1 ? lastPage.page - 1 : undefined;
    },
    ...options,
  });
