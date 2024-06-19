import { postLikesQueryKey, postsQueryKey } from "@/constants/query-keys";
import { getPostLikesRequest } from "@/services/post-service";
import { Post } from "@/types/post";
import { useInfiniteQuery } from "@tanstack/react-query";

export const usePostLikes = ({
  post,
  firstPageRequestedAt,
}: {
  post: Post;
  firstPageRequestedAt?: Date;
}) =>
  useInfiniteQuery({
    queryKey: [postsQueryKey, post.id, postLikesQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getPostLikesRequest(post.id, {
        page: query.pageParam,
        limit: 18,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => lastPage.nextPage ?? undefined,
    enabled: firstPageRequestedAt !== undefined,
  });
