import React from "react";
import UserProfile from "./user-profile";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useUser } from "@/hooks/use-user";
import { useRoute } from "@react-navigation/native";
import { userScreenName } from "@/constants/screens-names-constants";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";

const UserScreen = () => {
  const route = useRoute();
  const { userName }: any = route.params;
  const { data, isLoading, isSuccess, refetch, isError, error } = useUser({
    userName,
    refetchOnMount: true,
  });
  useRefreshOnScreenFocus(refetch);

  return (
    <UserProfile
      isLoading={isLoading}
      isSuccess={isSuccess}
      user={data?.user}
      isError={isError}
      error={error}
    />
  );
};

//
//
//
//
//

//
//
//
//
//

export const userScreen = {
  name: userScreenName,
  component: UserScreen,
  options: {
    title: "",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
