import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { exploreScreen } from "../screens/explore-screen";
import { homeScreen } from "../screens/home-screen";
import { notificationsScreen } from "../screens/notifications-screen";
import { discussionsScreen } from "@/screens/discussions/discussions-sreen";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/use-theme";
import { loggedInUserProfileScreen } from "@/screens/logged-in-user-profile-screen";
import { bottomTabNavigatorName } from "@/constants/navigators-names-constants";
import { useEffect, useMemo } from "react";
import * as Notifications from "expo-notifications";

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const { theme } = useTheme();
  const { data } = useLoggedInUser({
    enabled: true,
  });

  discussionsScreen.options.tabBarBadge = useMemo(
    () =>
      data && data?.user.unseenDiscussionMessagesCount > 0
        ? data?.user.unseenDiscussionMessagesCount
        : undefined,
    [data]
  );
  notificationsScreen.options.tabBarBadge = useMemo(
    () =>
      data && data.user.unseenNotificationsCount > 0
        ? data.user.unseenNotificationsCount
        : undefined,
    [data]
  );

  // ! Implement it with task manager
  // useEffect(() => {
  //   if (data) {
  //     const badgeCount =
  //       data.user.unseenNotificationsCount +
  //       data.user.unseenDiscussionMessagesCount;
  //     Notifications.setBadgeCountAsync(badgeCount);
  //   }
  // }, [data]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 60,
          backgroundColor: theme.white,
          borderTopColor: theme.gray200,
        },

        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarVisibilityAnimationConfig: {
          show: { animation: "timing", config: { delay: 0, duration: 0 } },
          hide: { animation: "timing", config: { delay: 0, duration: 0 } },
        },
        headerTitleStyle: {
          fontFamily: "NunitoSans_700Bold",
        },
        headerStyle: {
          backgroundColor: theme.white,
        },
        headerTintColor: theme.gray900,
        headerShadowVisible: false,
        tabBarInactiveTintColor: theme.gray950,
        tabBarActiveTintColor: theme.blue,
        tabBarBadgeStyle: {
          fontSize: 12,
          marginTop: 7,
          // marginRight: 2,
          transform: [{ translateX: -1 }],
          fontFamily: "NunitoSans_700Bold",
          backgroundColor: theme.blue,
          // marginRight: 5,
        },
      }}
      detachInactiveScreens
    >
      <Tab.Screen {...homeScreen} />
      <Tab.Screen {...exploreScreen} />
      <Tab.Screen {...notificationsScreen} />
      <Tab.Screen {...discussionsScreen} />
      <Tab.Screen {...loggedInUserProfileScreen} />
    </Tab.Navigator>
  );
};

export const bottomTabNavigator = {
  name: bottomTabNavigatorName,
  component: BottomTabNavigator,
  options: {
    animation: "none",
    headerShown: false,
  } as NativeStackNavigationOptions,
};
