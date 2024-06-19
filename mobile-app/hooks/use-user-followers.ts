import {
  followersQueryKey,
  followingQueryKey,
  usersQueryKey,
} from "@/constants/query-keys";
import {
  getUserFollowersRequest,
  getUserFollowingRequest,
} from "@/services/user-service";
import { User } from "@/types/user";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useUserFollowers = ({
  user,
  firstPageRequestedAt,
}: {
  user: User;
  firstPageRequestedAt?: Date;
}) =>
  useInfiniteQuery({
    queryKey: [usersQueryKey, user.id, followersQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getUserFollowersRequest(user.id, {
        page: query.pageParam,
        limit: 18,
        firstPageRequestedAt,
      }),

    getNextPageParam: (lastPage, _) => lastPage.nextPage ?? undefined,
    enabled: firstPageRequestedAt !== undefined,
  });
