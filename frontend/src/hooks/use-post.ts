import { postsQueryKey } from "@/constants/query-keys";
import { getPostDetailsRequest } from "@/services/post-service";
import { useQuery } from "@tanstack/react-query";

export const usePost = (
  postId: string,
  options?: {
    refetchOnMount?: boolean;
    refetchOnWindowFocus?: boolean;
  }
) =>
  useQuery({
    queryKey: [postsQueryKey, postId],
    queryFn: () => getPostDetailsRequest(postId),
    ...options,
  });
