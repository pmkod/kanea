import React, { useEffect, useState } from "react";
import { FlatList, View } from "react-native";
import {
  NotificationItem,
  NotificationItemLoader,
} from "../components/items/notification-item";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { atom, useAtom } from "jotai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  loggedInUserQueryKey,
  notificationsQueryKey,
} from "@/constants/query-keys";
import { Notification } from "@/types/notification";
import { useNotifications } from "@/hooks/use-notifications";
import { sortNotificationsByGroup } from "@/utils/notification-utils";
import { GroupedNotificationItem } from "@/components/items/grouped-notification.item";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useListenWebsocketEvents } from "@/hooks/use-listen-websocket-events";
import { seeNotificationsRequest } from "@/services/user-service";
import { User } from "@/types/user";
import { Button } from "@/components/core/button";
import MyText from "@/components/core/my-text";
import { useTheme } from "@/hooks/use-theme";
import { notificationsScreenName } from "@/constants/screens-names-constants";
import { useDidUpdate } from "@mantine/hooks";
import { Feather, Ionicons } from "@expo/vector-icons";

const firstPageRequestedAtAtom = atom<Date | undefined>(new Date());

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [showRefreshButton, setShowRefreshButton] = useState(false);
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  const { theme } = useTheme();
  const { data: loggedInUserData } = useLoggedInUser();

  const queryClient = useQueryClient();

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setFirstPageRequestedAt(new Date());
    } else {
      setFirstPageRequestedAt(undefined);
    }
  }, [isFocused]);

  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    refetch,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    isFetching,
  } = useNotifications({ firstPageRequestedAt });
  // useRefreshOnScreenFocus(refetch);

  const groupedNotifications = isSuccess
    ? data.pages
        .map((pageData) =>
          sortNotificationsByGroup(pageData.notifications).flat()
        )
        .flat()
    : [];

  const loadMoreNotifications = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

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
  useDidUpdate(() => {
    if (firstPageRequestedAt && !isFetching) {
      refetch();
    }
  }, [firstPageRequestedAt]);

  //
  //
  //
  //

  useEffect(() => {
    if (isFocused && showRefreshButton) {
      setShowRefreshButton(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused) {
      mutate();
    }
  }, [isFocused]);

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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          showRefreshButton && (
            <View style={{ marginRight: 20 }}>
              <Button
                variant="outline"
                size="sm"
                onPress={refreshNotifications}
                text="Get news notifis"
                leftDecorator={
                  <Ionicons name="refresh" size={12} color="white" />
                }
              />
            </View>
          )
        );
      },
    });
  }, [navigation, refreshNotifications, showRefreshButton]);

  // const [refreshing, setRefreshing] = React.useState(false);

  // const onRefresh = () => {
  //   refetch();
  // };

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        {isLoading ? (
          <>
            <NotificationItemLoader />
            <NotificationItemLoader />
            <NotificationItemLoader />
            <NotificationItemLoader />
            <NotificationItemLoader />
            <NotificationItemLoader />
            <NotificationItemLoader />
            <NotificationItemLoader />
            <NotificationItemLoader />
          </>
        ) : isSuccess ? (
          <FlatList
            data={groupedNotifications}
            numColumns={1}
            refreshing={isRefetching && !isFetching}
            onRefresh={refreshNotifications}
            // refreshControl={
            //   <RefreshControl refreshing={true} onRefresh={onRefresh} />
            // }
            initialNumToRender={18}
            renderItem={({ item }) =>
              item.elements.length > 1 ? (
                <GroupedNotificationItem
                  key={item.elements[0].id}
                  elements={item.elements}
                />
              ) : (
                <NotificationItem notification={item.elements[0]} />
              )
            }
            keyExtractor={(item, index) => index.toString()}
            style={{
              flex: 1,
              backgroundColor: theme.white,
            }}
            overScrollMode="never"
            ListEmptyComponent={
              <MyText style={{ marginTop: 26, textAlign: "center" }}>
                You have no notification
              </MyText>
            }
            onResponderEnd={loadMoreNotifications}
            onEndReachedThreshold={0.3}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              isFetchingNextPage ? (
                <>
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                  <NotificationItemLoader />
                </>
              ) : null
            }
          />
        ) : null}
      </View>
    </>
  );
};

export const notificationsScreen = {
  name: notificationsScreenName,
  component: NotificationsScreen,
  options: {
    tabBarIcon: ({ color, size, focused }) => (
      <Feather name="bell" color={color} size={24} />
    ),
  } as BottomTabNavigationOptions,
};
