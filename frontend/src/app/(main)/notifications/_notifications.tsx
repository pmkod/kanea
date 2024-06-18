"use client";
import { Button } from "@/components/core/button";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarRightPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import BottomNav from "@/components/partials/bottom-nav";
import {
  loggedInUserQueryKey,
  notificationsQueryKey,
} from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useNotifications } from "@/hooks/use-notifications";
import { seeNotificationsRequest } from "@/services/user-service";
import { Notification } from "@/types/notification";
import { User } from "@/types/user";
import { sortNotificationsByGroup } from "@/utils/notification-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PiArrowUpFill } from "react-icons/pi";
import { useInView } from "react-intersection-observer";
import WhoToFollow from "../_who-to-follow";
import GroupedNotificationItem from "./_grouped-notification-item";
import NotificationItem, { NotificationItemLoader } from "./_notification-item";
import { UtilLinks } from "../_util-links";
import { PublishPostButton } from "../_publish-post-button";
import { useListenWebsocketEvents } from "@/hooks/use-listen-websocket-events";

const firstPageRequestedAtAtom = atom<Date>(new Date());
const Notifications = () => {
  const router = useRouter();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const { data: loggedInUserData, isSuccess: isLoggedInUserSuccess } =
    useLoggedInUser({
      enabled: false,
    });

  const [showRefreshButton, setShowRefreshButton] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    refetch,
    hasNextPage,
    fetchNextPage,
  } = useNotifications({ firstPageRequestedAt });

  const groupedNotifications = isSuccess
    ? data.pages.map((pageData) => ({
        page: pageData.page,
        nextPage: pageData.nextPage,
        notificationsSortedByGroup: sortNotificationsByGroup(
          pageData.notifications
        ),
      }))
    : [];

  const goToPreviousRoutes = () => {
    router.back();
  };
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: seeNotificationsRequest,
    onMutate: () => {},
    onSuccess: (data, v, c) => {
      setTimeout(() => {
        queryClient.setQueryData(
          [loggedInUserQueryKey],
          (qData: { user: User }) => {
            return {
              ...qData,
              user: {
                ...loggedInUserData?.user,
                unseenNotificationsCount: 0,
              },
            };
          }
        );
      }, 2000);
    },
  });

  const refreshNotifications = () => {
    setFirstPageRequestedAt(new Date());
  };

  //
  //
  //
  //

  useEffect(() => {
    refetch();
    if (showRefreshButton) {
      setShowRefreshButton(false);
    }
  }, [firstPageRequestedAt]);

  //
  //
  //
  //

  const receiveNotification = () => {
    setShowRefreshButton(true);
  };

  const removeReceivedNotification = (eventData: {
    notification: Notification;
  }) => {
    queryClient.setQueryData([notificationsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          notifications: pageData.notifications.filter(
            (n: Notification) => n.id !== eventData.notification.id
          ),
        })),
      };
    });
  };

  useEffect(() => {
    if (isLoggedInUserSuccess) {
      mutate();
    }
  }, [loggedInUserData?.user, isLoggedInUserSuccess]);

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  useListenWebsocketEvents([
    {
      name: "receive-notification",
      handler: receiveNotification,
    },
    {
      name: "remove-received-notification",
      handler: removeReceivedNotification,
    },
  ]);

  return (
    <>
      <div className="flex pb-40">
        <div className="flex-1">
          <div className="mx-auto w-full md:w-[500px]">
            <TopBar position="sticky">
              <TopBarLeftPart>
                <TopBarGoBackButton onClick={goToPreviousRoutes} />
                <TopBarTitle>Notifications</TopBarTitle>
              </TopBarLeftPart>
              <TopBarRightPart></TopBarRightPart>
            </TopBar>
            <div className="relative flex justify-center">
              {showRefreshButton && (
                <div className="w-max h-max absolute left-1/2 transform -translate-x-1/2">
                  <Button variant="default" onClick={refreshNotifications}>
                    <PiArrowUpFill />
                  </Button>
                </div>
              )}
            </div>
            <div className="px-1.5 sm:px-1">
              {isLoading ? (
                <>
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                </>
              ) : isSuccess ? (
                groupedNotifications.map((page) =>
                  page.notificationsSortedByGroup.map(({ elements }) =>
                    elements.length > 1 ? (
                      <GroupedNotificationItem
                        key={elements[0].id}
                        elements={elements}
                      />
                    ) : (
                      <NotificationItem
                        key={elements[0].id}
                        notification={elements[0]}
                      />
                    )
                  )
                )
              ) : // groupedNotifications.map(({ elements }) =>

              // )
              null}

              {isFetchingNextPage && (
                <>
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                </>
              )}
            </div>

            {hasNextPage && <div className="h-16" ref={ref}></div>}
          </div>
        </div>
        <div className="hidden xl:block w-[380px] pt-8 pr-8">
          <div className="w-full sticky top-8">
            <WhoToFollow />
            <UtilLinks />
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
};

export default Notifications;
