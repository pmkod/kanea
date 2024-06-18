import { exploreQueryKey } from "@/constants/query-keys";
import { exploreRequest } from "@/services/post-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useExplore = ({
  firstPageRequestedAt,
}: {
  firstPageRequestedAt?: Date;
}) => {
  return useInfiniteQuery({
    queryKey: [exploreQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      exploreRequest({
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: firstPageRequestedAt !== undefined,
  });
};
