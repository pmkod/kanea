import { IconButton } from "@/components/core/icon-button";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import UserProfile from "./user/user-profile";
import { useNavigation } from "@react-navigation/native";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useTheme } from "@/hooks/use-theme";
import { useUser } from "@/hooks/use-user";
import {
  loggedInUserProfileScreenName,
  settingsScreenName,
} from "@/constants/screens-names-constants";
import { usersQueryKey } from "@/constants/query-keys";
import { Post } from "@/types/post";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";

const LoggedInUserProfileScreen = () => {
  const { data: loggedInUserData, isSuccess: isLoggedInUserDataSuccess } =
    useLoggedInUser({
      // enabled: true,
    });

  const { data, isLoading, isPending, isSuccess, refetch, isError, error } =
    useUser({
      userName: loggedInUserData?.user.userName || "",
      enabled: isLoggedInUserDataSuccess,
      refetchOnMount: true,
    });
  useRefreshOnScreenFocus(refetch);

  const webSocket = useAtomValue(webSocketAtom);

  const queryClient = useQueryClient();

  // const screenName = useNavigationState(
  //   (state) => state.routes[state.index].name
  // );

  const publishPostSuccessEvent = (eventData: { post: Post }) => {
    if (data?.user?.userName === loggedInUserData?.user.userName) {
      queryClient.setQueryData(
        [usersQueryKey, loggedInUserData?.user.userName],
        (qData: any) => ({
          ...qData,
          user: {
            ...qData.user,
            postsCount: qData.postsCount + 1,
          },
        })
      );
      // const loggedInUserPostsState = queryClient.getQueryState([
      //   usersQueryKey,
      //   loggedInUserData?.user.id,
      //   postsQueryKey,
      // ]);
      // if (loggedInUserPostsState?.status === "success") {
      //   queryClient.setQueryData(
      //     [usersQueryKey, loggedInUserData?.user.id, postsQueryKey],
      //     (qData: any) => {
      //       return {
      //         ...qData,
      //         pages: qData.pages.map((pageData: any, pageIndex: number) => ({
      //           ...pageData,
      //           posts:
      //             pageIndex === 0
      //               ? [eventData.post, ...pageData.posts]
      //               : [...pageData.posts],
      //         })),
      //       };
      //     }
      //   );
      // }
    }
  };

  useEffect(() => {
    webSocket?.on("publish-post-success", publishPostSuccessEvent);

    return () => {
      webSocket?.off("publish-post-success", publishPostSuccessEvent);
    };
  }, [webSocket]);

  return (
    <UserProfile
      isLoading={isLoading || isPending}
      isSuccess={isSuccess}
      user={data?.user}
      isError={isError}
      error={error}
    />
  );
};

const UserScreenHeaderRight = () => {
  const navigation = useNavigation();
  const { theme, setTheme } = useTheme();
  const goToSettingsScreen = () => {
    navigation.navigate(settingsScreenName);
  };

  return (
    <View style={{ marginRight: 12 }}>
      <IconButton
        variant="ghost"
        colorScheme="primary"
        onPress={goToSettingsScreen}
      >
        <Ionicons name="settings-outline" size={22} color={theme.gray900} />
      </IconButton>
    </View>
  );
};

export const loggedInUserProfileScreen = {
  name: loggedInUserProfileScreenName,
  component: LoggedInUserProfileScreen,
  options: {
    title: "Profile",
    headerRight: () => <UserScreenHeaderRight />,
    tabBarIcon: ({ color, size, focused }) => (
      <Feather name="user" color={color} size={25} />
    ),
  } as BottomTabNavigationOptions,
};
