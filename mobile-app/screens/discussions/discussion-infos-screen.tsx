import MyText from "@/components/core/my-text";
import { Skeleton } from "@/components/core/skeleton";
import Space from "@/components/core/space";
import { DiscussionItemAvatar } from "@/components/items/discussion-item";
import {
  addNewMembersToDiscussionGroupScreenName,
  discussionInfosScreenName,
  discussionMediasAndDocsScreenName,
  editDiscussionGroupSceenName,
  makeReportScreenName,
  messagesMediasScreenName,
  pictureScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import { useDiscussion } from "@/hooks/use-discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useTheme } from "@/hooks/use-theme";
import {
  buildDiscussionFileUrl,
  buildMessageFileUrl,
} from "@/utils/discussion-utils";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React, { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/core/dropdown-menu";
import {
  defineGroupDiscussionMemberAsAdminRequest,
  dismissGroupDiscussionMemberAsAdminRequest,
  getDiscussionMessagesWithMediasAndDocsRequest,
} from "@/services/discussion-service";
import {
  discussionsQueryKey,
  messagesWithMediasAndDocsQueryKey,
} from "@/constants/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Message } from "@/types/message";
import Avatar from "@/components/core/avatar";
import { IconButton } from "@/components/core/icon-button";
import { User } from "@/types/user";
import Toast from "react-native-toast-message";
import NiceModal from "@ebay/nice-modal-react";
import { RemoveUserFromDiscussionGroupConfirmModal } from "@/components/modals/remove-user-from-discussion-group-confirm-modal";
import { ExitDiscussionGroupConfirmModal } from "@/components/modals/exit-discussion-group-confirm-modal";
import { DeleteDiscussionConfirmModal } from "@/components/modals/delete-discussion-confirm-modal";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { BlockUserConfirmModal } from "@/components/modals/block-user-confirm-modal";
import { isEmpty } from "radash";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { AVPlaybackStatusSuccess, ResizeMode, Video } from "expo-av";
import { themes } from "@/styles/themes";
import { acceptedVideoMimetypes } from "@/constants/file-constants";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DiscussionInfosScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const network = useNetInfo();
  const webSocket = useAtomValue(webSocketAtom);

  const route = useRoute();
  const {
    discussionId,
  }: {
    discussionId: string;
  } = route.params as any;

  const {
    data,
    isSuccess,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
    isRefetching,
  } = useDiscussion(discussionId, {
    enabled: true,
  });
  useRefreshOnScreenFocus(refetch);

  const { isSuccess: isLoggedInUserSuccess, data: loggedInUserData } =
    useLoggedInUser({
      enabled: false,
    });

  const chatType: "group" | "private" =
    data?.discussion.name !== undefined ? "group" : "private";

  const userToShow =
    chatType === "private"
      ? data?.discussion.members.find(
          (member) => member.userId !== loggedInUserData?.user.id
        )?.user
      : undefined;

  const name =
    userToShow !== undefined ? userToShow.displayName : data?.discussion.name;

  const discussionPictureUrl =
    userToShow && userToShow.profilePicture && chatType === "private"
      ? buildPublicFileUrl({
          fileName: userToShow.profilePicture.lowQualityFileName,
        })
      : data && data.discussion.picture !== undefined && chatType === "group"
      ? buildDiscussionFileUrl({
          discussionId: data.discussion.id,
          fileName: data.discussion.picture.lowQualityFileName,
        })
      : undefined;

  const isLoggedInUserAdminOfDiscussionGroup = data?.discussion.members.find(
    ({ userId }) => userId === loggedInUserData?.user.id
  )?.isAdmin;

  const loggedInUserBlockOtherMember =
    data?.blocksInRelationToThisDiscussion.find(
      ({ blockerId }) => blockerId === loggedInUserData?.user.id
    ) !== undefined;

  const openEditGroupScreen = () => {
    navigation.navigate(editDiscussionGroupSceenName, {
      discussionId: data?.discussion.id,
    });
  };

  const openAddNewMembersToGroupScreen = () => {
    navigation.navigate(addNewMembersToDiscussionGroupScreenName, {
      discussionId: data?.discussion.id,
    });
  };

  const visitProfile = () => {
    navigation.navigate(userScreenName, {
      userName: loggedInUserData?.user.userName,
    });
  };

  const openExitDiscussionGroupConfirmModal = () => {
    NiceModal.show(ExitDiscussionGroupConfirmModal, {
      discussion: data?.discussion,
    });
  };

  const openDeleteDiscussionConfirmModal = () => {
    NiceModal.show(DeleteDiscussionConfirmModal, {
      discussion: data?.discussion,
    });
  };

  const goToMakeReportScreen = () => {
    navigation.navigate(makeReportScreenName, {
      discussion: data?.discussion,
    });
  };

  const openBlockUserConfirmModal = () => {
    NiceModal.show(BlockUserConfirmModal, {
      user: userToShow,
    });
  };

  const unblockUser = () => {
    if (!network.isConnected) {
      return;
    }
    webSocket?.emit("unblock-user", {
      userToUnblockId: userToShow?.id,
    });
  };

  const visitUserProfile = (user: User) => {
    navigation.navigate(userScreenName, { userName: user.userName });
  };

  const defineAsAdminMutation = useMutation({
    mutationFn: (user: User) =>
      defineGroupDiscussionMemberAsAdminRequest(discussionId, user.id),
    onSuccess: (data, user, context) => {
      queryClient.setQueryData(
        [discussionsQueryKey, discussionId],
        (qData: any) => {
          return {
            ...qData,
            discussion: {
              ...qData.discussion,
              members: qData.discussion.members.map((member: any) => ({
                ...member,
                isAdmin: member.userId === user.id ? true : member.isAdmin,
              })),
            },
          };
        }
      );
      Toast.show({ type: "success", text2: "Success" });
    },
    onError: (err: any, variable, context) => {
      Toast.show({
        type: "error",
        text2: err.errors[0].message,
      });
    },
  });

  const dismissAsAdminMutation = useMutation({
    mutationFn: (user: User) =>
      dismissGroupDiscussionMemberAsAdminRequest(discussionId, user.id),
    onSuccess: (data, user, context) => {
      queryClient.setQueryData(
        [discussionsQueryKey, discussionId],
        (qData: any) => {
          return {
            ...qData,
            discussion: {
              ...qData.discussion,
              members: qData.discussion.members.map((member: any) => ({
                ...member,
                isAdmin: member.userId === user.id ? false : member.isAdmin,
              })),
            },
          };
        }
      );
      Toast.show({ type: "success", text2: "Success" });
    },
    onError: (err: any, variable, context) => {
      Toast.show({
        type: "error",
        text2: err.errors[0].message,
      });
    },
  });

  const defineAsAdmin = (user: User) => {
    defineAsAdminMutation.mutate(user);
  };

  const dismissAsAdmin = (user: User) => {
    dismissAsAdminMutation.mutate(user);
  };

  const openRemoveUserFromGroupConfirmModal = (user: User) => {
    NiceModal.show(RemoveUserFromDiscussionGroupConfirmModal, {
      user,
    });
  };

  const seePicture = () => {
    let url = "";
    if (userToShow && userToShow.profilePicture) {
      url = buildPublicFileUrl({
        fileName: userToShow.profilePicture.lowQualityFileName,
      });
    } else if (data?.discussion.name && data.discussion.picture) {
      url = buildDiscussionFileUrl({
        fileName: data.discussion.picture.lowQualityFileName,
        discussionId: data.discussion.id,
      });
    }
    if (!url) {
      return;
    }
    navigation.navigate(pictureScreenName, { url });
  };

  const reportUser = (user: User) => {
    navigation.navigate(makeReportScreenName, {
      user,
    });
  };

  const unblockUserSuccessEvent = (eventData: { unblockedUser: User }) => {
    Toast.show({
      type: "success",
      text2: `@${userToShow?.userName} Unblocked`,
    });
  };

  const unblockUserErrorEvent = () => {
    Toast.show({ type: "error", text2: "Error" });
  };

  useListenWebsocketEvent({
    name: "unblock-user-success",
    handler: unblockUserSuccessEvent,
  });
  useListenWebsocketEvent({
    name: "unblock-user-error",
    handler: unblockUserErrorEvent,
  });

  return (
    <ScrollView
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isFetching}
          onRefresh={refetch}
        />
      }
    >
      <View style={{ alignItems: "center" }}>
        {isLoading ? (
          <>
            <Skeleton style={{ width: 100, height: 100, borderRadius: 300 }} />
            <Space height={10} />
            <Skeleton style={{ width: 100, height: 14, borderRadius: 300 }} />
            <Space height={10} />
            <Skeleton style={{ width: 80, height: 14, borderRadius: 300 }} />

            <Space height={20} />
          </>
        ) : isSuccess ? (
          <>
            <Pressable
              // android_ripple={{ radius: 2000 }}
              onPress={seePicture}
              style={{ borderRadius: 300, overflow: "hidden" }}
            >
              {({ pressed }) => (
                <View
                  style={{
                    opacity:
                      pressed && discussionPictureUrl !== undefined ? 0.5 : 1,
                  }}
                >
                  <DiscussionItemAvatar
                    chatType={chatType}
                    name={name}
                    discussionPictureUrl={discussionPictureUrl}
                    width={100}
                    online={userToShow?.online}
                  />
                </View>
              )}
            </Pressable>
            <Space height={10} />
            <MyText style={{ fontSize: 24 }}>{name}</MyText>
            <Space height={4} />
            <MyText style={{ fontSize: 18, color: theme.gray500 }}>
              {chatType === "private"
                ? "@" + userToShow?.userName
                : data.discussion.members.length + " members"}
            </MyText>
            <Space height={20} />
            <View
              style={{ gap: 16, flexDirection: "row", alignItems: "stretch" }}
            >
              {chatType === "group" && (
                <>
                  <ActionButton
                    icon={
                      <MaterialCommunityIcons
                        name="pencil-outline"
                        color={theme.gray500}
                        size={26}
                      />
                    }
                    text="Edit"
                    onPress={openEditGroupScreen}
                  />
                  {isLoggedInUserAdminOfDiscussionGroup && (
                    <ActionButton
                      icon={
                        <Feather
                          name="user-plus"
                          size={26}
                          color={theme.gray500}
                        />
                      }
                      text="Add"
                      onPress={openAddNewMembersToGroupScreen}
                    />
                  )}
                </>
              )}

              {userToShow !== undefined && (
                <ActionButton
                  icon={<Feather name="user" size={26} color={theme.gray500} />}
                  text="profile"
                  onPress={visitProfile}
                />
              )}

              <DropdownMenu
                anchor={
                  <ActionButton
                    icon={
                      <Ionicons name="ellipsis-horizontal-outline" size={26} />
                    }
                    text="Options"
                  />
                }
              >
                {chatType === "private" &&
                  (loggedInUserBlockOtherMember ? (
                    <DropdownMenuItem
                      onPress={unblockUser}
                      title="Unblock user"
                    />
                  ) : (
                    <DropdownMenuItem
                      onPress={openBlockUserConfirmModal}
                      title="Block user"
                    />
                  ))}
                <DropdownMenuItem
                  onPress={goToMakeReportScreen}
                  title="Report"
                />
                <DropdownMenuItem
                  onPress={openDeleteDiscussionConfirmModal}
                  title="Delete"
                />
                {chatType === "group" && (
                  <DropdownMenuItem
                    onPress={openExitDiscussionGroupConfirmModal}
                    title="Exit group"
                  />
                )}
              </DropdownMenu>
            </View>

            <MediasAndDocsPart />

            <View style={{ marginTop: 30, width: "100%" }}>
              <MyText
                style={{
                  fontSize: 14,
                  paddingHorizontal: 20,
                  color: theme.gray600,
                  marginBottom: 10,
                }}
              >
                Members
              </MyText>
              <View style={{ marginHorizontal: 20 }}>
                {data.discussion.members.map(({ user, isAdmin }) => (
                  <View
                    key={user.id}
                    style={{
                      alignItems: "center",
                      gap: 16,
                      paddingVertical: 10,
                      flexDirection: "row",
                    }}
                  >
                    <Avatar
                      src={
                        user.profilePicture
                          ? buildPublicFileUrl({
                              fileName: user.profilePicture?.lowQualityFileName,
                            })
                          : ""
                      }
                      name={user.displayName}
                    />

                    <View style={{ flex: 1 }}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <MyText
                          style={{
                            fontFamily: "NunitoSans_600SemiBold",
                          }}
                        >
                          {user?.displayName}
                        </MyText>
                        {isAdmin && (
                          <View
                            style={{
                              paddingHorizontal: 4,
                              paddingTop: 0.5,
                              paddingBottom: 2,
                              marginLeft: 6,
                              borderRadius: 4,
                              backgroundColor: theme.green100,
                            }}
                          >
                            <MyText
                              style={{
                                fontSize: 12,
                                fontFamily: "NunitoSans_600SemiBold",
                                color: theme.green600,
                              }}
                            >
                              admin
                            </MyText>
                          </View>
                        )}
                      </View>
                      <MyText style={{ color: theme.gray600 }}>
                        @{user?.userName}
                      </MyText>
                    </View>

                    {loggedInUserData?.user.id !== user.id && (
                      <DropdownMenu
                        anchor={
                          <IconButton variant="ghost">
                            <Ionicons
                              name="ellipsis-horizontal-outline"
                              size={26}
                            />
                          </IconButton>
                        }
                      >
                        <DropdownMenuItem
                          onPress={() => visitUserProfile(user)}
                          title="Visit profile"
                        />
                        {isLoggedInUserAdminOfDiscussionGroup &&
                          (isAdmin ? (
                            <DropdownMenuItem
                              onPress={() => dismissAsAdmin(user)}
                              title="Dismis as admin"
                            />
                          ) : (
                            <DropdownMenuItem
                              onPress={() => defineAsAdmin(user)}
                              title="Define as admin"
                            />
                          ))}
                        {isLoggedInUserAdminOfDiscussionGroup && (
                          <DropdownMenuItem
                            onPress={() =>
                              openRemoveUserFromGroupConfirmModal(user)
                            }
                            title="Remove from group"
                          />
                        )}
                        <DropdownMenuItem
                          onPress={() => reportUser(user)}
                          title="Report user"
                        />
                      </DropdownMenu>
                    )}
                  </View>
                ))}
              </View>
            </View>
            <Space height={40} />
          </>
        ) : isError ? (
          <View>
            <MyText style={{ textAlign: "center" }}>
              {(error as any).errors[0].message}
            </MyText>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

//
//
//
//
//

const ActionButton = ({
  icon,
  text,
  onPress,
}: {
  icon: ReactNode;
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
}) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            alignItems: "center",
            width: 88,
            paddingTop: 8,
            paddingBottom: 12,
            borderRadius: 10,
            borderColor: theme.gray300,
            borderWidth: 0.5,
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
          }}
        >
          {icon}
          <Space height={6} />
          <MyText style={{ fontSize: 14 }}>{text}</MyText>
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

const MediasAndDocsPart = () => {
  const route = useRoute();
  const {
    discussionId,
  }: {
    discussionId: string;
  } = route.params as any;
  const { theme } = useTheme();

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [
      discussionsQueryKey,
      discussionId,
      messagesWithMediasAndDocsQueryKey,
    ],
    queryFn: () => getDiscussionMessagesWithMediasAndDocsRequest(discussionId),
  });

  const navigation = useNavigation();

  const goToDiscussionMediasAndDocsScreen = () => {
    navigation.navigate(discussionMediasAndDocsScreenName, {
      discussionId,
    });
  };

  // const medias = isSuccess
  //   ? data.messages
  //       .map((message) =>
  //         message.medias.map((media) => ({ ...media, message }))
  //       )
  //       .flat()
  //   : [];

  return (
    <View
      style={{
        marginTop: 28,
        width: "100%",
        paddingLeft: 20,
        paddingRight: isSuccess && data.messages.length === 0 ? 20 : 0,
      }}
    >
      <Pressable onPress={goToDiscussionMediasAndDocsScreen}>
        <MyText
          style={{ fontSize: 14, color: theme.gray600, marginBottom: 10 }}
        >
          Medias and docs
        </MyText>
      </Pressable>
      <View
        style={{
          flexDirection: "row",
          gap: 4,
          height: 96,
          // flex: 1,
          // width: "100%",
        }}
      >
        {isSuccess && data.messages.length === 0 && (
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.gray300,
              borderStyle: "dashed",

              // flex: 1,
              borderRadius: 10,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              // marginRight: 20,
            }}
          >
            <MyText style={{ color: theme.gray400, fontSize: 14 }}>
              No media or doc
            </MyText>
          </View>
        )}
        <ScrollView
          keyboardShouldPersistTaps="never"
          horizontal={true}
          contentContainerStyle={{ gap: 8 }}
        >
          {isLoading ? (
            <>
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
              <Skeleton style={{ aspectRatio: "1/1", height: "100%" }} />
            </>
          ) : isSuccess && data.messages.length > 0 ? (
            <>
              {data.messages.map((message) => {
                if (!isEmpty(message.medias)) {
                  return message.medias.map((media) => (
                    <MediaItem
                      key={media.bestQualityFileName}
                      message={message}
                      media={media}
                    />
                  ));
                }
                if (!isEmpty(message.docs)) {
                  return message.docs.map((doc) => (
                    <DocItem key={doc.fileName} message={message} doc={doc} />
                  ));
                }
              })}
              <Pressable onPress={goToDiscussionMediasAndDocsScreen}>
                {({ pressed }) => (
                  <View
                    style={{
                      height: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 4,
                      backgroundColor: theme.gray200,
                      opacity: pressed ? 0.5 : 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Feather
                      name="chevron-left"
                      size={50}
                      color={theme.gray400}
                    />
                  </View>
                )}
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </View>
    </View>
  );
};

//
//
//
//
//

const MediaItem = ({
  media,
  message,
}: {
  message: Message;
  media: Message["medias"][0];
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const goToMessageMediaScreen = () => {
    navigation.navigate(messagesMediasScreenName, {
      discussionId: message.discussionId,
      initialMediaId: media.id,
    });
  };

  const [status, setStatus] = useState<AVPlaybackStatusSuccess | undefined>(
    undefined
  );

  return (
    <Pressable
      onPress={goToMessageMediaScreen}
      style={{
        height: "100%",
        aspectRatio: "1/1",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
          }}
        >
          {acceptedVideoMimetypes.includes(media.mimetype) ? (
            <View
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <Video
                style={{ flex: 1 }}
                source={{
                  uri: buildMessageFileUrl({
                    discussionId: message.discussionId,
                    fileName: media.bestQualityFileName,
                    messageId: message.id,
                  }),
                }}
                shouldPlay={false}
                videoStyle={{ backgroundColor: theme.gray200 }}
                resizeMode={ResizeMode.COVER}
                onPlaybackStatusUpdate={(status: any) => setStatus(status)}
              />
              <View
                style={{
                  position: "absolute",
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    borderRadius: 500,
                    padding: 8,
                    backgroundColor: themes.light.gray900,
                  }}
                >
                  {!status ? (
                    <ActivityIndicator size={16} color={themes.light.white} />
                  ) : (
                    <Ionicons
                      name="play"
                      size={16}
                      weight="fill"
                      color={themes.light.white}
                    />
                  )}
                </View>
              </View>
            </View>
          ) : (
            <Image
              src={buildMessageFileUrl({
                discussionId: message.discussionId,
                fileName: media.lowQualityFileName,
                messageId: message.id,
              })}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
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

const DocItem = ({
  doc,
  message,
}: {
  message: Message;
  doc: Message["docs"][0];
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const downloadDoc = () => {};

  return (
    <Pressable
      onPress={downloadDoc}
      style={{
        height: "100%",
        aspectRatio: "1/1",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: pressed ? theme.gray100 : theme.gray200,
            width: "100%",
            height: "100%",
            paddingHorizontal: 12,
            alignItems: "center",
            // paddingTop: 10,
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="file-outline"
            size={18}
            color={theme.gray600}
          />
          <Space height={10} />
          <MyText
            numberOfLines={2}
            style={{
              textAlign: "center",
              fontSize: 14,
              color: theme.gray600,
              lineHeight: 16,
            }}
          >
            {doc.originalFileName}
          </MyText>
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

export const discussionInfosScreen = {
  name: discussionInfosScreenName,
  component: DiscussionInfosScreen,
  options: {
    animation: "ios",
    title: "",
  } as NativeStackNavigationOptions,
};
