import { usersQueryKey } from "@/constants/query-keys";
import { getUserByUserNameRequest } from "@/services/user-service";
import { useQuery } from "@tanstack/react-query";

export const useUser = ({
  userName,
  ...options
}: {
  userName: string;

  enabled?: boolean;
  refetchOnMount?: boolean;
}) =>
  useQuery({
    queryKey: [usersQueryKey, userName],
    queryFn: () => getUserByUserNameRequest(userName),
    ...options,
  });
