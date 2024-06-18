import { searchsQueryKey } from "@/constants/query-keys";
import { getSearchsRequest } from "@/services/search-service";
import { useQuery } from "@tanstack/react-query";

export const useSearchs = () =>
  useQuery({
    queryKey: [searchsQueryKey],
    queryFn: getSearchsRequest,
  });
