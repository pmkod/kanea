import { usersQueryKey } from "@/constants/query-keys";
import { getUsersRequest } from "@/services/user-service";
import { useQuery } from "@tanstack/react-query";

export const useSearchUser = ({ debouncedQ }: { debouncedQ: string }) =>
  useQuery({
    queryKey: [usersQueryKey, `q=${debouncedQ}`],
    queryFn: () => getUsersRequest({ q: debouncedQ }),
    enabled: debouncedQ.length > 0,
  });
