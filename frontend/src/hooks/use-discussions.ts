import { discussionsQueryKey } from "@/constants/query-keys";
import { getDiscussionsRequest } from "@/services/discussion-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useDiscussions = (options?: {
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    queryKey: [discussionsQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getDiscussionsRequest({
        page: query.pageParam,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },

    ...options,
  });
