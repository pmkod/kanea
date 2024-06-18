import { loggedInUserQueryKey } from "@/constants/query-keys";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";

export const useUpdateUnseenNotificationsCount = () => {
  const queryClient = useQueryClient();

  const updateUnseenNotificationCount = ({
    unseenNotificationsCount,
  }: {
    unseenNotificationsCount: number;
  }) => {
    queryClient.setQueryData(
      [loggedInUserQueryKey],
      (qData: { user: User }) => ({
        ...qData,
        user: {
          ...qData.user,
          unseenNotificationsCount,
        },
      })
    );
  };

  return { updateUnseenNotificationCount };
};
