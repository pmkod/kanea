import { followingTimelineQueryKey } from "@/constants/query-keys";
import { getLoggedInuserFollowingTimelineRequest } from "@/services/user-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useFollowingTimeline = ({
  firstPageRequestedAt,
  enabled = true,
}: {
  firstPageRequestedAt?: Date;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    queryKey: [followingTimelineQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getLoggedInuserFollowingTimelineRequest({
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: enabled && firstPageRequestedAt !== undefined,
  });
