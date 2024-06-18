"use client";
import FullPageLoader from "@/components/others/full-page-loader";
import { loggedInUserQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";
import Sidebar from "./_sidebar";
import { webSocketAtom } from "./_web-socket-atom";
import { isChatBodyScrollLevelAtTheBottomAtom } from "./discussions/[discussionId]/_chat-body";
import { useListenWebsocketEvents } from "@/hooks/use-listen-websocket-events";
import { useUpdateUnseenNotificationsCount } from "@/hooks/use-update-unseen-notifications-count";
import { useUpdateUnseenDiscussionMessagesCount } from "@/hooks/use-update-unseen-discussion-messages-count";
import { useConnectToWebSocketServer } from "@/hooks/use-connect-to-websocket-server";
import { useUpdateUnseenNotificationsCountInTitle } from "@/hooks/use-update-unseen-notifications-count-in-title";
import { useLogout } from "@/hooks/use-logout";

const MainLayout = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const webSocket = useAtomValue(webSocketAtom);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { updateUnseenNotificationCount } = useUpdateUnseenNotificationsCount();
  const { updateUnseenDiscussionMessageEvent } =
    useUpdateUnseenDiscussionMessagesCount();
  const { data, isSuccess, isPending, isError } = useLoggedInUser({
    refetchOnWindowFocus: true,
  });
  const [
    isChatBodyScrollLevelAtTheBottom,
    setIsChatBodyScrollLevelAtTheBottom,
  ] = useAtom(isChatBodyScrollLevelAtTheBottomAtom);
  const { isLoading: isBeingLoggedOut } = useLogout();

  useEffect(() => {
    document.body.style.overflowY = "scroll";
  }, []);

  useConnectToWebSocketServer();
  useUpdateUnseenNotificationsCountInTitle();

  useEffect(() => {
    if (!pathname.startsWith("/discussions/")) {
      setIsChatBodyScrollLevelAtTheBottom(false);
    }
  }, [pathname]);

  //
  //
  //
  //

  const receiveMessageEvent = ({
    discussion,
    message,
  }: {
    discussion: Discussion;
    message: Message;
  }) => {
    if (
      message.senderId !== data?.user.id &&
      (pathname !== `/discussions/${discussion.id}` ||
        (pathname === `/discussions/${discussion.id}` &&
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
              pathname === `/discussions/${discussionId}`
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

  if (isPending) {
    return <FullPageLoader />;
  }

  if (isError) {
    queryClient.clear();
    router.replace("/login");
    return <FullPageLoader />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default MainLayout;
