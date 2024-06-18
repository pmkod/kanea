import { sessionsQueryKey } from "@/constants/query-keys";
import { getActiveSessionsRequest } from "@/services/session-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useSessions = ({
  firstPageRequestedAt,
}: {
  firstPageRequestedAt?: Date;
}) =>
  useInfiniteQuery({
    queryKey: [sessionsQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getActiveSessionsRequest({
        page: query.pageParam,
        firstPageRequestedAt,
      }),

    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    enabled: firstPageRequestedAt !== undefined,
    refetchOnMount: true,
  });
