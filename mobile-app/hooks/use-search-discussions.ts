import { discussionsQueryKey } from "@/constants/query-keys";
import { searchDiscussionRequest } from "@/services/discussion-service";
import { useQuery } from "@tanstack/react-query";

export const useSearchDiscussion = (
  q: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: [discussionsQueryKey + `q=${q}`],
    queryFn: () => searchDiscussionRequest({ q }),
    // enabled: ,
    ...options,
  });
