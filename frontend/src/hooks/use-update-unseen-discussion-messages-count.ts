import { loggedInUserQueryKey } from "@/constants/query-keys";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";

export const useUpdateUnseenDiscussionMessagesCount = () => {
  const queryClient = useQueryClient();

  const updateUnseenDiscussionMessageEvent = (eventData: { user: User }) => {
    queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => {
      return {
        ...qData,
        user: {
          ...qData.user,
          unseenDiscussionMessagesCount:
            eventData.user.unseenDiscussionMessagesCount,
        },
      };
    });
  };
  return { updateUnseenDiscussionMessageEvent };
};
