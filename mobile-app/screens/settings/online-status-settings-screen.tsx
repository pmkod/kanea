import { webSocketAtom } from "@/atoms/web-socket-atom";
import MyText from "@/components/core/my-text";
import { Switch } from "@/components/core/switch";
import { loggedInUserQueryKey } from "@/constants/query-keys";
import { onlineStatusSettingsScreenName } from "@/constants/screens-names-constants";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { User } from "@/types/user";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useNetInfo } from "@react-native-community/netinfo";
import { Skeleton } from "@/components/core/skeleton";

const OnlineStatusSettingsScreen = () => {
  const { data, isPending, isSuccess } = useLoggedInUser({ enabled: false });
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const [isLoading, setIsLoading] = useState(false);

  const network = useNetInfo();

  //
  //
  const updateOnlineStatusVisibility = () => {
    if (!network.isConnected) {
      return;
    }
    setIsLoading(true);
    webSocket?.emit("define-if-other-user-can-see-my-online-status");
  };

  const defineIfOtherUserCanSeeMyOnlineStatusSuccess = (eventData: {
    user: User;
  }) => {
    setIsLoading(false);
    queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => ({
      ...qData,
      user: {
        ...qData.user,
        allowOtherUsersToSeeMyOnlineStatus:
          eventData.user.allowOtherUsersToSeeMyOnlineStatus,
      },
    }));
  };

  const defineIfOtherUserCanSeeMyOnlineStatusError = ({
    message,
  }: {
    message: string;
  }) => {
    setIsLoading(false);
    Toast.show({
      text1: message,
      type: "error",
    });
  };

  useEffect(() => {
    webSocket?.on(
      "define-if-other-user-can-see-my-online-status-success",
      defineIfOtherUserCanSeeMyOnlineStatusSuccess
    );
    webSocket?.on(
      "define-if-other-user-can-see-my-online-status-error",
      defineIfOtherUserCanSeeMyOnlineStatusError
    );
    return () => {
      webSocket?.off(
        "define-if-other-user-can-see-my-online-status-success",
        defineIfOtherUserCanSeeMyOnlineStatusSuccess
      );
      webSocket?.off(
        "define-if-other-user-can-see-my-online-status-error",
        defineIfOtherUserCanSeeMyOnlineStatusError
      );
    };
  }, [webSocket]);

  return (
    <View>
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <MyText
            style={{ fontSize: 18, fontFamily: "NunitoSans_600SemiBold" }}
          >
            Show online status
          </MyText>
          <View style={{ width: 40, height: 20 }}></View>
          {isPending ? (
            <Skeleton style={{ width: 44, height: 24, borderRadius: 50 }} />
          ) : isSuccess ? (
            <Switch
              value={data?.user.allowOtherUsersToSeeMyOnlineStatus}
              disabled={isLoading}
              onValueChange={updateOnlineStatusVisibility}
            />
          ) : null}
        </View>

        <MyText style={{ fontSize: 15, color: "#9ca3af" }}>
          Allow users you are chatting with to see if you are online.
        </MyText>
      </View>
    </View>
  );
};

export const onlineStatusSettingsScreen = {
  name: onlineStatusSettingsScreenName,
  component: OnlineStatusSettingsScreen,
  options: {
    title: "Online status",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
