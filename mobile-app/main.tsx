import "react-native-reanimated";
import React, { useEffect } from "react";
import StackNavigator from "./navigators/stack-navigator";
import { useAtom, useAtomValue } from "jotai";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { webSocketAtom } from "./atoms/web-socket-atom";
import { useQueryClient } from "@tanstack/react-query";
import { loggedInUserQueryKey } from "./constants/query-keys";
import { User } from "./types/user";
import { useUpdateUnseenNotificationsCount } from "./hooks/use-update-unseen-notifications-count";
import { useUpdateUnseenDiscussionMessagesCount } from "./hooks/use-update-unseen-discussion-messages-count";
import { useConnectToWebSocketServer } from "./hooks/use-connect-to-websocket-server";
import { Discussion } from "./types/discussion";
import { Message } from "./types/message";
import { useListenWebsocketEvents } from "./hooks/use-listen-websocket-events";
import { currentlyOpenDiscussionIdAtom } from "./atoms/currently-open-discussion-id-atom";
import { isChatBodyScrollLevelAtTheBottomAtom } from "./screens/discussions/chat-body";
import { useRefreshOnScreenFocus } from "./hooks/use-refresh-on-screen-focus";
import * as Notifications from "expo-notifications";
// import * as TaskManager from 'expo-task-manager';

const Main = () => {
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const currentlyOpenDiscussionId = useAtomValue(currentlyOpenDiscussionIdAtom);

  const [
    isChatBodyScrollLevelAtTheBottom,
    setIsChatBodyScrollLevelAtTheBottom,
  ] = useAtom(isChatBodyScrollLevelAtTheBottomAtom);
  const { updateUnseenNotificationCount } = useUpdateUnseenNotificationsCount();
  const { updateUnseenDiscussionMessageEvent } =
    useUpdateUnseenDiscussionMessagesCount();

  const { data, isSuccess, isPending, isError, refetch } = useLoggedInUser({
    // refetchOnWindowFocus: true,
  });

  useRefreshOnScreenFocus(refetch);

  useEffect(() => {
    if (currentlyOpenDiscussionId === undefined) {
      setIsChatBodyScrollLevelAtTheBottom(false);
    }
  }, [currentlyOpenDiscussionId]);

  useConnectToWebSocketServer();

  const receiveMessageEvent = ({
    discussion,
    message,
  }: {
    discussion: Discussion;
    message: Message;
  }) => {
    if (
      message.senderId !== data?.user.id &&
      (currentlyOpenDiscussionId !== discussion.id ||
        (currentlyOpenDiscussionId === discussion.id &&
          !isChatBodyScrollLevelAtTheBottom))
    ) {
      queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => {
        return {
          ...qData,
          user: {
            ...qData.user,
            unseenDiscussionMessagesCount:
              qData.user.unseenDiscussionMessagesCount + 1,
          },
        };
      });
    }
  };

  const seeDiscussionMessageSuccess = ({
    user,
    discussionId,
  }: {
    user?: User;
    discussionId: string;
  }) => {
    if (user !== undefined) {
      queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => {
        return {
          ...qData,
          user: {
            ...qData.user,
            unseenDiscussionMessagesCount:
              currentlyOpenDiscussionId === discussionId
                ? 0
                : user.unseenDiscussionMessagesCount,
          },
        };
      });
    }
  };

  const receiveMessageDeletion = (eventData: {
    discussion: Discussion;
    message: Message;
  }) => {
    queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => {
      return {
        ...qData,
        user: {
          ...qData.user,
          unseenDiscussionMessagesCount: eventData.message.viewers.find(
            (viewer) => viewer.viewerId === data?.user.id
          )
            ? qData.user.unseenDiscussionMessagesCount
            : qData.user.unseenDiscussionMessagesCount - 1,
        },
      };
    });
  };

  const updateOnlineStatus = () => {
    webSocket?.emit("update-online-status");
  };

  useListenWebsocketEvents([
    { name: "receive-notification", handler: updateUnseenNotificationCount },
    {
      name: "remove-received-notification",
      handler: updateUnseenNotificationCount,
    },

    {
      name: "update-unseen-notifications-count",
      handler: updateUnseenNotificationCount,
    },
    { name: "receive-message", handler: receiveMessageEvent },

    {
      name: "see-discussion-messages-success",
      handler: seeDiscussionMessageSuccess,
    },
    { name: "receive-message-deletion", handler: receiveMessageDeletion },
    {
      name: "be-removed-from-group-discussion",
      handler: updateUnseenDiscussionMessageEvent,
    },
    {
      name: "delete-discussion-success",
      handler: updateUnseenDiscussionMessageEvent,
    },
    {
      name: "has-exited-group-discussion",
      handler: updateUnseenDiscussionMessageEvent,
    },
    { name: "auth-to-websocket-server-success", handler: updateOnlineStatus },
  ]);

  return <StackNavigator />;
};

export default Main;
