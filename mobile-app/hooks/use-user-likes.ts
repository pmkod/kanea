import { likedPostsQueryKey, usersQueryKey } from "@/constants/query-keys";
import { getUserLikedPostsRequest } from "@/services/post-service";
import { User } from "@/types/user";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useUserLikes = ({
  user,
  firstPageRequestedAt,
  enabled = true,
}: {
  user?: User;
  firstPageRequestedAt: Date;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [usersQueryKey, user?.id, likedPostsQueryKey],
    queryFn: (query) =>
      getUserLikedPostsRequest(user?.id || "", {
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    enabled,
    getNextPageParam: (lastPage, _) => lastPage.nextPage,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
