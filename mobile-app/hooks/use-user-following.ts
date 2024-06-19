import { followingQueryKey, usersQueryKey } from "@/constants/query-keys";
import { getUserFollowingRequest } from "@/services/user-service";
import { User } from "@/types/user";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useUserFollowing = ({
  user,
  firstPageRequestedAt,
}: {
  user: User;
  firstPageRequestedAt?: Date;
}) =>
  useInfiniteQuery({
    queryKey: [usersQueryKey, user.id, followingQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getUserFollowingRequest(user.id, {
        page: query.pageParam,
        limit: 18,
        firstPageRequestedAt,
      }),

    getNextPageParam: (lastPage, _) => lastPage.nextPage ?? undefined,
    enabled: firstPageRequestedAt !== undefined,
  });
