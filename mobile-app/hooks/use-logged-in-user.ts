import { loggedInUserQueryKey } from "@/constants/query-keys";
import { getLoggedInUserRequest } from "@/services/user-service";
import { useQuery } from "@tanstack/react-query";

export const useLoggedInUser = (options?: {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}) =>
  useQuery({
    queryKey: [loggedInUserQueryKey],
    queryFn: getLoggedInUserRequest,
    ...options,
  });
