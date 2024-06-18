import { discussionsQueryKey } from "@/constants/query-keys";
import { getDiscussionDetailsRequest } from "@/services/discussion-service";
import { useQuery } from "@tanstack/react-query";

export const useDiscussion = (
  discussionId: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchOnMount?: boolean;
  }
) =>
  useQuery({
    queryKey: [discussionsQueryKey, discussionId],
    queryFn: () => getDiscussionDetailsRequest(discussionId),
    ...options,
  });
