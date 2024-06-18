import { postsQueryKey, usersQueryKey } from "@/constants/query-keys";
import { getUserPostsRequest } from "@/services/post-service";
import { User } from "@/types/user";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useUserPosts = ({
  user,
  firstPageRequestedAt,
  enabled,
}: {
  user?: User;
  firstPageRequestedAt?: Date;
  enabled?: boolean;
}) =>
  useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [usersQueryKey, user?.id, postsQueryKey],
    queryFn: (query) =>
      getUserPostsRequest(user!.id, {
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => lastPage.nextPage,
    refetchOnMount: true,
    enabled: enabled ?? (user !== undefined && !user.hasBlockedLoggedInUser),
  });
