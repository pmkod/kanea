import React, { ReactNode, useEffect, useState } from "react";
import { GestureResponderEvent, Image, Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { User } from "@/types/user";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { Skeleton } from "../core/skeleton";
import Avatar from "../core/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAtomValue } from "jotai";
import { loggedInUserQueryKey } from "@/constants/query-keys";
import { Follow } from "@/types/follow";
import Toast from "react-native-toast-message";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { Button } from "../core/button";
import { useTheme } from "@/hooks/use-theme";

export const UserRowItem = ({
  user,
  children,
  onPress,
}: {
  user: User;
  children: ReactNode;
  onPress?: ((event: GestureResponderEvent) => void) | null;
}) => {
  const { theme } = useTheme();
  const childrens = React.Children.map(children, (child) => {
    if (
      React.isValidElement<
        UserRowItemAvatarProps | UserRowItemDisplayNameAndUserNameProps
      >(child)
    ) {
      return React.cloneElement(child, { user });
    }
  });
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 20,
            height: 72,

            backgroundColor: pressed ? theme.gray200 : theme.white,
          }}
        >
          {childrens}
        </View>
      )}
    </Pressable>
  );
};

//
//
//
//
//

interface UserRowItemAvatarProps {
  user?: User;
}

export const UserRowItemAvatar = ({ user }: UserRowItemAvatarProps) => {
  return (
    user && (
      <Avatar
        src={
          user.profilePicture
            ? buildPublicFileUrl({
                fileName: user.profilePicture.lowQualityFileName,
              })
            : undefined
        }
        name={user.displayName}
        width={50}
      />
    )
  );
};

//
//
//
//
//

export interface UserRowItemDisplayNameAndUserNameProps {
  user?: User;
}

export const UserRowItemDisplayNameAndUserName = ({
  user,
}: UserRowItemDisplayNameAndUserNameProps) => {
  return user !== undefined ? (
    <View style={{ flex: 1 }}>
      <MyText style={{ fontSize: 16 }}>{user.displayName}</MyText>
      <MyText style={{ fontSize: 16, color: "#9ca3af" }}>
        @{user.userName}
      </MyText>
    </View>
  ) : null;
};

export const UserRowItemLoader = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 72,
        alignItems: "center",
        // backgroundColor: "blue",
        gap: 12,
        paddingHorizontal: 20,
      }}
    >
      <Skeleton
        style={{
          width: 50,
          aspectRatio: "1/1",
          borderRadius: 300,
        }}
      />
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Skeleton style={{ width: "70%", borderRadius: 8, height: 12 }} />
        <Skeleton style={{ width: "35%", borderRadius: 8, height: 12 }} />
      </View>
    </View>
  );
};

//
//
//
//
//

interface UserRowItemFollowButtonProps {
  user?: User;
  onFollowSuccess: (user: User) => void;
  onUnfollowSuccess: (user: User) => void;
  size?: "sm";
}

export const UserRowItemFollowButton = ({
  user,
  onFollowSuccess,
  onUnfollowSuccess,
  size,
}: UserRowItemFollowButtonProps) => {
  const queryClient = useQueryClient();

  const network = useNetInfo();
  const [isLoading, setIsLoading] = useState(false);

  const webSocket = useAtomValue(webSocketAtom);

  const followUser = () => {
    if (!network.isConnected) {
      return;
    }
    setIsLoading(true);

    webSocket?.emit("follow", {
      followedId: user?.id,
    });
  };

  const unfollowUser = () => {
    if (!network.isConnected) {
      return;
    }
    setIsLoading(true);
    webSocket?.emit("unfollow", {
      followedId: user?.id,
    });
  };

  const followSuccess = (eventData: { follow: Follow }) => {
    if (eventData.follow.followedId === user?.id) {
      setIsLoading(false);
      queryClient.setQueryData(
        [loggedInUserQueryKey],
        (qData: { user: User }) => ({
          ...qData,
          user: {
            ...qData.user,
            followingCount: qData.user.followingCount! + 1,
          },
        })
      );
      onFollowSuccess(user!);
    }
  };

  const followError = ({ message }: { message: string }) => {
    setIsLoading(false);
    Toast.show({ type: "error", text1: message });
  };

  //
  //
  //

  const unfollowSuccess = (eventData: { follow: Follow }) => {
    if (eventData.follow.followedId === user?.id) {
      setIsLoading(false);
      queryClient.setQueryData(
        [loggedInUserQueryKey],
        (qData: { user: User }) => ({
          ...qData,
          user: {
            ...qData.user,
            followingCount:
              qData.user.followingCount! > 0
                ? qData.user.followingCount! - 1
                : 0,
          },
        })
      );
      onUnfollowSuccess(user!);
    }
  };

  const unfollowError = ({ message }: { message: string }) => {
    setIsLoading(false);
    Toast.show({ type: "success", text1: message });
  };

  useEffect(() => {
    webSocket?.on("follow-success", followSuccess);
    webSocket?.on("follow-error", followError);

    webSocket?.on("unfollow-success", unfollowSuccess);
    webSocket?.on("unfollow-error", unfollowError);
    return () => {
      webSocket?.off("follow-success", followSuccess);
      webSocket?.off("follow-error", followError);

      webSocket?.off("unfollow-success", unfollowSuccess);
      webSocket?.off("unfollow-error", unfollowError);
    };
  }, [webSocket]);

  return user?.followedByLoggedInUser ? (
    <Button
      variant="outline"
      size={size}
      isLoading={isLoading}
      onPress={unfollowUser}
      text="Following"
    />
  ) : (
    <Button
      variant="fill"
      size={size}
      isLoading={isLoading}
      onPress={followUser}
      text="Follow"
    />
  );
};
