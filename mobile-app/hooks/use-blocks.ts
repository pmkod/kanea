import { blocksQueryKey } from "@/constants/query-keys";
import { recentlyBlocked } from "@/constants/sort-option-constants";
import { getBlocksRequest } from "@/services/block-service";
import { useInfiniteQuery } from "@tanstack/react-query";

//

export const useBlocks = ({
  firstPageRequestedAt,
  enabled,
}: {
  firstPageRequestedAt?: Date;
  enabled: boolean;
}) =>
  useInfiniteQuery({
    queryKey: [blocksQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getBlocksRequest({
        page: query.pageParam,
        firstPageRequestedAt,
        sort: recentlyBlocked,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    refetchOnMount: true,
    enabled,
  });
