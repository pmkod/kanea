import { discussionsQueryKey } from "@/constants/query-keys";
import { searchDiscussionsRequest } from "@/services/discussion-service";
import { useQuery } from "@tanstack/react-query";

export const useSearchDiscussions = (
  q: string,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: [discussionsQueryKey + ` q=${q}`],
    queryFn: () => searchDiscussionsRequest({ q }),
    ...options,
  });
