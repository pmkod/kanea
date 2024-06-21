import { useState } from "react";
import { Pressable, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import UserStatItem, {
  UserStatItemLoader,
} from "../../components/items/user-stat-item";
import LikesTab from "../../components/tabs/likes-tab";
import MyText from "@/components/core/my-text";
import { useNavigation } from "@react-navigation/native";
import { User } from "@/types/user";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { Button } from "@/components/core/button";
import { PostsTab } from "@/components/tabs/posts-tab";
import { useTheme } from "@/hooks/use-theme";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { usersQueryKey } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import {
  editUserProfileScreenName,
  makeReportScreenName,
  pictureScreenName,
  userFollowersScreenName,
  userFollowingScreenName,
} from "@/constants/screens-names-constants";
import Avatar from "@/components/core/avatar";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/core/dropdown-menu";
import { UserRowItemFollowButton } from "@/components/items/user-row-item";
import { BlockedUserButton } from "@/components/others/blocked-user-button";
import Toast from "react-native-toast-message";
import { webAppUrl } from "@/constants/app-constants";
import { IconButton } from "@/components/core/icon-button";
import { PublishPostButton } from "@/components/others/publish-post-button";
import { Skeleton } from "@/components/core/skeleton";
import Space from "@/components/core/space";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import {
  MaterialTabBar,
  MaterialTabItem,
  Tabs,
} from "react-native-collapsible-tab-view";
import {
  Entypo,
  Feather,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

interface UserProfileProps {
  user?: User;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

const UserProfile = ({
  user,
  isLoading,
  isError,
  isSuccess,
}: UserProfileProps) => {
  const navigation = useNavigation();
  const [isBlockingUser, setIsBlockingUser] = useState(false);
  const [isUnblockingUser, setIsUnblockingUser] = useState(false);

  const { theme } = useTheme();
  const webSocket = useAtomValue(webSocketAtom);
  const queryClient = useQueryClient();

  const network = useNetInfo();

  const goToUserFollowersScreen = () => {
    navigation.navigate(userFollowersScreenName, {
      user,
    });
  };

  const goToUserFollowingScreen = () => {
    navigation.navigate(userFollowingScreenName, {
      user,
    });
  };

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const goToEditProfileScreen = () => {
    navigation.navigate(editUserProfileScreenName);
  };

  const isLoggedInUser =
    loggedInUserData !== undefined
      ? loggedInUserData.user.id === user?.id
      : false;

  const handleFollowSuccess = (user: User) => {
    queryClient.setQueryData(
      [usersQueryKey, user.userName],
      (qData: { user: User }) => ({
        ...qData,
        user: {
          ...qData.user,
          followedByLoggedInUser: true,
          followersCount: qData.user.followersCount! + 1,
        },
      })
    );
  };

  //
  //
  //
  //
  //
  //

  const handleUnfollowSuccess = (user: User) => {
    queryClient.setQueryData(
      [usersQueryKey, user.userName],
      (qData: { user: User }) => ({
        ...qData,
        user: {
          ...qData.user,
          followedByLoggedInUser: false,

          followersCount:
            qData.user.followersCount! > 0 ? qData.user.followersCount! - 1 : 0,
        },
      })
    );
  };

  const unblockUser = () => {
    if (!network.isConnected) {
      return;
    }
    webSocket?.emit("unblock-user", {
      userToUnblockId: user?.id,
    });
    setIsUnblockingUser(true);
  };

  const blockedByAnUserEvent = (eventData: { userWhoBlocked: User }) => {
    if (user?.id === eventData.userWhoBlocked.id) {
      queryClient.setQueryData(
        [usersQueryKey, eventData.userWhoBlocked.userName],
        (qData: { user: User }) => ({
          ...qData,
          user: {
            ...qData.user,
            hasBlockedLoggedInUser: true,

            followersCount: eventData.userWhoBlocked.followersCount,
            followingCount: eventData.userWhoBlocked.followingCount,
          },
        })
      );
    }
  };

  const blockUserSuccessEvent = (eventData: { blockedUser: User }) => {
    if (eventData.blockedUser.id === user?.id) {
      queryClient.setQueryData(
        [usersQueryKey, eventData.blockedUser.userName],
        (qData: any) => {
          return {
            ...qData,
            user: {
              ...qData.user,
              blockedByLoggedInUser: true,
              followedByLoggedInUser: false,
              followersCount: eventData.blockedUser.followersCount,
              followingCount: eventData.blockedUser.followingCount,
            },
          };
        }
      );
      setIsBlockingUser(false);
    }
  };
  //
  const blockUserErrorEvent = (eventData: { message: string }) => {
    Toast.show({ text1: eventData.message });
    setIsBlockingUser(false);
  };

  const hasBlockedAnUserEvent = (eventData: { blockedUser: User }) => {
    if (eventData.blockedUser.id === user?.id) {
      queryClient.setQueryData(
        [usersQueryKey, eventData.blockedUser.userName],
        (qData: any) => {
          return {
            ...qData,
            user: {
              ...qData.user,
              blockedByLoggedInUser: true,
              followedByLoggedInUser: false,
              followersCount: eventData.blockedUser.followersCount,
              followingCount: eventData.blockedUser.followingCount,
            },
          };
        }
      );
    }
  };

  const unblockUserSuccessEvent = (eventData: { unblockedUser: User }) => {
    if (eventData.unblockedUser.id === user?.id) {
      queryClient.setQueryData([usersQueryKey, user.userName], (qData: any) => {
        return {
          ...qData,
          user: {
            ...qData.user,
            blockedByLoggedInUser: false,
          },
        };
      });
      Toast.show({
        type: "info",
        text2: `@${user.userName} Unblocked`,
      });
      setIsUnblockingUser(false);
    }
  };

  const unblockUserErrorEvent = () => {
    setIsUnblockingUser(false);
  };

  const unblockedByAnUserEvent = (eventData: { unblockedUser: User }) => {
    if (eventData.unblockedUser.userName === user?.userName) {
      queryClient.setQueryData(
        [usersQueryKey, user?.userName],
        (qData: any) => {
          return {
            ...qData,
            user: {
              ...qData.user,
              hasBlockedLoggedInUser: false,
            },
          };
        }
      );
    }
  };

  useListenWebsocketEvent({
    name: "block-user-success",
    handler: blockUserSuccessEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "block-user-error",
    handler: blockUserErrorEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "has-blocked-an-user",
    handler: hasBlockedAnUserEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "blocked-by-an-user",
    handler: blockedByAnUserEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "unblock-user-success",
    handler: unblockUserSuccessEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "unblock-user-error",
    handler: unblockUserErrorEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "has-unblocked-an-user",
    handler: unblockUserSuccessEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "unblocked-by-an-user",
    handler: unblockedByAnUserEvent,
    enabled: isSuccess,
  });

  const seePicture = () => {
    if (user && user.profilePicture) {
      navigation.navigate(pictureScreenName, {
        url: buildPublicFileUrl({
          fileName: user.profilePicture.bestQualityFileName,
        }),
      });
    }
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <PublishPostButton />

      <Tabs.Container
        renderHeader={() => (
          <View
            pointerEvents="box-none"
            style={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 20,
              backgroundColor: theme.white,
              pointerEvents: "box-none",
              // alignItems: "center",
            }}
          >
            {isLoading || user === undefined ? (
              <>
                <View style={{ flexDirection: "row" }}>
                  <Skeleton
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 300,
                      marginRight: 18,
                    }}
                  />
                  <View>
                    <Skeleton
                      style={{ height: 16, width: 150, borderRadius: 20 }}
                    />
                    <Space height={18} />
                    <Skeleton
                      style={{ height: 16, width: 120, borderRadius: 20 }}
                    />
                    <Space height={14} />
                    <Skeleton
                      style={{ height: 38, width: 88, borderRadius: 4 }}
                    />
                  </View>
                </View>
                <Space height={30} />
                <Skeleton
                  style={{ height: 12, width: "30%", borderRadius: 20 }}
                />
                <Space height={30} />

                <View style={{ flexDirection: "row", gap: 20 }}>
                  <UserStatItemLoader />
                  <UserStatItemLoader />
                  <UserStatItemLoader />
                </View>
              </>
            ) : isSuccess ? (
              <>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      marginRight: 18,
                    }}
                  >
                    <Pressable onPress={seePicture}>
                      {({ pressed }) => (
                        <Avatar
                          style={{
                            opacity:
                              pressed && user && user.profilePicture ? 0.7 : 1,
                          }}
                          src={
                            user.profilePicture
                              ? buildPublicFileUrl({
                                  fileName:
                                    user.profilePicture.lowQualityFileName,
                                })
                              : undefined
                          }
                          name={user.displayName}
                          width={80}
                        />
                      )}
                    </Pressable>
                  </View>
                  <View
                    style={{
                      alignItems: "flex-start",
                      paddingRight: 100,
                    }}
                  >
                    <MyText
                      style={{
                        fontFamily: "NunitoSans_700Bold",
                        fontSize: 20,
                      }}
                    >
                      {user.displayName}
                    </MyText>
                    <MyText style={{ fontSize: 18, color: "gray" }}>
                      @{user.userName}
                    </MyText>
                    <View
                      style={{ marginTop: 10, flexDirection: "row", gap: 8 }}
                    >
                      {isLoggedInUser ? (
                        <Button
                          size="md"
                          text="Edit profile"
                          onPress={goToEditProfileScreen}
                          variant="outline"
                        />
                      ) : user.blockedByLoggedInUser ? (
                        <BlockedUserButton
                          isLoading={isUnblockingUser}
                          unblockUser={unblockUser}
                        />
                      ) : (
                        <UserRowItemFollowButton
                          user={user}
                          onFollowSuccess={handleFollowSuccess}
                          onUnfollowSuccess={handleUnfollowSuccess}
                        />
                      )}
                      {!isLoggedInUser && <UserProfileDropdown user={user} />}
                    </View>
                  </View>
                </View>

                {user.bio && (
                  <View style={{ marginTop: 10 }}>
                    <MyText>{user.bio}</MyText>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: "row",
                    columnGap: 30,
                    paddingTop: 16,
                  }}
                >
                  <UserStatItem
                    label={"Post" + (user.postsCount || 0 > 1 ? "s" : "")}
                    value={user.postsCount}
                  />
                  <UserStatItem
                    onPress={goToUserFollowersScreen}
                    label={"Follower" + (user.postsCount || 0 > 1 ? "s" : "")}
                    value={user.followersCount}
                  />
                  <UserStatItem
                    onPress={goToUserFollowingScreen}
                    label="Following"
                    value={user.followingCount}
                  />
                </View>
              </>
            ) : null}
          </View>
        )}
        renderTabBar={(props) =>
          user && user.hasBlockedLoggedInUser ? (
            <View
              style={{
                paddingTop: 40,
                borderTopWidth: 1,
                borderColor: theme.gray200,
                alignItems: "center",
                paddingHorizontal: 16,
                width: "100%",
              }}
            >
              <MyText
                style={{
                  fontSize: 24,
                  fontFamily: "NunitoSans_600SemiBold",
                  marginBottom: 8,
                }}
              >
                @{user.userName} blocked you
              </MyText>
              <MyText style={{ fontSize: 18, color: theme.gray500 }}>
                You can't follow him and see his posts
              </MyText>
            </View>
          ) : (
            <MaterialTabBar
              {...props}
              style={{ backgroundColor: theme.white }}
              labelStyle={{
                color: theme.gray900,
                fontFamily: "NunitoSans_600SemiBold",
                textTransform: "capitalize",
                fontSize: 16,
              }}
              TabItemComponent={(props) => (
                <MaterialTabItem {...props} android_ripple={{ radius: 0 }} />
              )}
              inactiveColor={theme.gray500}
              activeColor={theme.gray900}
              indicatorStyle={{ backgroundColor: theme.gray950 }}
            />
          )
        }
        allowHeaderOverscroll={true}
      >
        <Tabs.Tab name="posts">
          <PostsTab user={user} />
        </Tabs.Tab>
        <Tabs.Tab name="likes">
          <LikesTab user={user} />
        </Tabs.Tab>
      </Tabs.Container>
    </View>
  );
};

export default UserProfile;

//
//
//
//
//

const UserProfileDropdown = ({ user }: { user: User }) => {
  const { theme } = useTheme();
  const network = useNetInfo();
  const webSocket = useAtomValue(webSocketAtom);
  const navigation = useNavigation();

  const copyProfileLink = async () => {
    Toast.show({
      type: "info",
      text1: "Copied",
    });
    await Clipboard.setStringAsync(`${webAppUrl}/users/${user.userName}`);
  };

  const unBlockUser = () => {
    if (!network.isConnected) {
      return;
    }
    webSocket?.emit("unblock-user", {
      userToUnblockId: user.id,
    });
  };

  const blockUser = () => {
    if (!network.isConnected) {
      return;
    }
    webSocket?.emit("block-user", {
      userToBlockId: user.id,
    });
  };

  const reportUser = () => {
    navigation.navigate(makeReportScreenName, {
      user,
    });
  };

  return (
    <DropdownMenu
      anchor={
        <IconButton size="md" variant="outline" colorScheme="primary">
          <Ionicons name="ellipsis-horizontal-outline" size={22} />
        </IconButton>
      }
    >
      <DropdownMenuItem
        onPress={copyProfileLink}
        title="Copy profile link"
        leftDecorator={<Entypo name="link" />}
      />
      {user.blockedByLoggedInUser ? (
        <DropdownMenuItem
          onPress={unBlockUser}
          title={`Unblock @${user.userName}`}
          leftDecorator={<Feather name="x" />}
        />
      ) : (
        <DropdownMenuItem
          onPress={blockUser}
          title={`Block @${user.userName}`}
          leftDecorator={<MaterialCommunityIcons name="cancel" />}
        />
      )}
      <DropdownMenuItem
        onPress={reportUser}
        title={`Report @${user.userName}`}
        leftDecorator={<Ionicons name="flag-outline" />}
      />
    </DropdownMenu>
  );
};
