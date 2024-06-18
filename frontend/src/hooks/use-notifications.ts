import { notificationsQueryKey } from "@/constants/query-keys";
import { getNotificationsRequest } from "@/services/notifications-service";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useNotifications = ({
  firstPageRequestedAt,
}: {
  firstPageRequestedAt: Date;
}) =>
  useInfiniteQuery({
    queryKey: [notificationsQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getNotificationsRequest({
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
