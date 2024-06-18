import { useDidUpdate } from "@mantine/hooks";
import { useLoggedInUser } from "./use-logged-in-user";
import { usePathname } from "next/navigation";

export const useUpdateUnseenNotificationsCountInTitle = () => {
  const pathname = usePathname();
  const { isSuccess, data } = useLoggedInUser();
  useDidUpdate(() => {
    if (isSuccess) {
      const unseenDiscussionMessagesAndNotificationsCount =
        data.user.unseenNotificationsCount +
        data.user.unseenDiscussionMessagesCount;

      const documentTitleContainParenthesis = document.title.includes("(");

      const rightParenthesisIndex = document.title.indexOf(")");

      document.title = documentTitleContainParenthesis
        ? document.title.slice(rightParenthesisIndex + 2)
        : document.title;

      const prefix =
        unseenDiscussionMessagesAndNotificationsCount > 0
          ? `(${unseenDiscussionMessagesAndNotificationsCount}) `
          : "";

      document.title = prefix + document.title;
    }
  }, [isSuccess, data, pathname]);
};
