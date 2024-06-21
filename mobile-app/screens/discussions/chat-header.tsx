import { IconButton } from "@/components/core/icon-button";
import MyText from "@/components/core/my-text";
import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { Pressable, View } from "react-native";
import { useTheme } from "@/hooks/use-theme";
import { useDiscussion } from "@/hooks/use-discussion";
import { useQueryClient } from "@tanstack/react-query";
import { discussionsQueryKey } from "@/constants/query-keys";
import { User } from "@/types/user";
import dayjs from "dayjs";
import { Discussion } from "@/types/discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { DiscussionItemAvatar } from "@/components/items/discussion-item";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { buildDiscussionFileUrl } from "@/utils/discussion-utils";
import { HeaderGoBackButton } from "@/components/core/header";
import { Header, HeaderLeftPart } from "@/components/core/header";
import { Skeleton } from "@/components/core/skeleton";
import Space from "@/components/core/space";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import { discussionInfosScreenName } from "@/constants/screens-names-constants";
import { Ionicons } from "@expo/vector-icons";

const ChatHeader = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const route = useRoute();
  const { discussionId, newInterlocutor } = route.params as {
    discussionId?: string;
    newInterlocutor?: User;
  };

  const { isSuccess: isLoggedInUserSuccess, data: loggedInUserData } =
    useLoggedInUser({
      enabled: false,
    });

  const { data, isSuccess, isLoading, isError, error } = useDiscussion(
    discussionId || "",
    {
      enabled: discussionId !== undefined,
    }
  );

  const queryClient = useQueryClient();

  const isToSendFirstPrivateMessage = newInterlocutor !== undefined;
  // newInterlocutor?.online = false;

  const chatType: "group" | "private" =
    data?.discussion.name !== undefined ? "group" : "private";

  const userToShow = data?.discussion.name
    ? undefined
    : isToSendFirstPrivateMessage
    ? newInterlocutor
    : data !== undefined && loggedInUserData !== undefined
    ? data.discussion.members.find(
        (member) => member.userId !== loggedInUserData?.user.id
      )?.user
    : undefined;

  const name =
    userToShow === undefined ? data?.discussion.name : userToShow.displayName;

  const discussionPictureUrl =
    userToShow && userToShow.profilePicture && chatType === "private"
      ? buildPublicFileUrl({
          fileName: userToShow.profilePicture.lowQualityFileName,
        })
      : data !== undefined &&
        data.discussion.picture !== undefined &&
        chatType === "group"
      ? buildDiscussionFileUrl({
          discussionId: data.discussion.id,
          fileName: data.discussion.picture.lowQualityFileName,
        })
      : undefined;

  const goToDiscussionInfosScreen = () => {
    if (newInterlocutor !== undefined) {
      return;
    }
    navigation.navigate(discussionInfosScreenName, {
      discussionId,
    });
  };

  const aMemberHasExitedGroupDiscussion = (eventData: {
    user: User;
    discussion: Discussion;
  }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId],
      (qData: any) => {
        return {
          ...qData,
          discussion: eventData.discussion,
        };
      }
    );
  };

  const editGroupDiscussion = (eventData: { discussion: Discussion }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId],
      (qData: any) => {
        return {
          ...qData,
          discussion: {
            ...qData.discussion,
            name: eventData.discussion.name,
            picture: eventData.discussion.picture,
          },
        };
      }
    );
  };

  const addMembersToGroupDiscussion = (eventData: {
    discussion: Discussion;
  }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId],
      (qData: any) => {
        return {
          ...qData,
          discussion: {
            ...qData.discussion,
            members: eventData.discussion.members,
          },
        };
      }
    );
  };

  const getLastSeenDate = (date: Date) => {
    const dayjsDate = dayjs(date);

    if (dayjsDate.isToday()) return "Active " + dayjsDate.fromNow();

    if (dayjsDate.isYesterday())
      return "Active yesterday at" + dayjsDate.format("HH:mm");
    if (dayjsDate.year() === dayjs().year()) {
      return "Last seen " + dayjsDate.format("Do MMMM HH:mm");
    }
    return "Last seen " + dayjsDate.format("Do MMMM YYYY at HH:mm");
  };

  const onlineStatusUpdateOfAnUser = (eventData: { user: User }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId],
      (qData: any) => ({
        ...qData,
        discussion: {
          ...qData.discussion,
          members: qData.discussion.members.map((member: any) =>
            member.userId === eventData.user.id
              ? {
                  ...member,
                  user: {
                    ...member.user,
                    online: eventData.user.online,
                    previouslyOnlineAt: eventData.user.previouslyOnlineAt,
                  },
                }
              : member
          ),
        },
      })
    );
  };

  useListenWebsocketEvent({
    name: "a-member-has-exited-group-discussion",
    handler: aMemberHasExitedGroupDiscussion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "edit-group-discussion-success",
    handler: editGroupDiscussion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "group-discussion-edited",
    handler: editGroupDiscussion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "add-members-to-group-discussion-success",
    handler: addMembersToGroupDiscussion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "new-members-added-to-group-discussion",
    handler: addMembersToGroupDiscussion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "online-status-update-of-an-user",
    handler: onlineStatusUpdateOfAnUser,
    enabled: isSuccess,
  });

  return (
    <>
      {/* <Mytext></Mytext> */}
      <Header>
        {isLoading ? (
          <>
            <HeaderLeftPart>
              <HeaderGoBackButton />

              <Skeleton style={{ width: 40, height: 40, borderRadius: 300 }} />
              <Space width={12} />
              <View style={{ gap: 10 }}>
                <Skeleton
                  style={{ width: 140, height: 10, borderRadius: 100 }}
                />
                <Skeleton
                  style={{ width: 80, height: 10, borderRadius: 100 }}
                />
              </View>
            </HeaderLeftPart>
          </>
        ) : isSuccess || userToShow !== undefined ? (
          <>
            <HeaderLeftPart>
              <HeaderGoBackButton />

              <Pressable
                onPress={goToDiscussionInfosScreen}
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <DiscussionItemAvatar
                  width={40}
                  chatType={chatType}
                  discussionPictureUrl={discussionPictureUrl}
                  name={name}
                  online={
                    newInterlocutor !== undefined ? false : userToShow?.online
                  }
                />
                <Space width={12} />
                <View style={{ gap: 2 }}>
                  <MyText style={{ fontSize: 16, color: theme.gray800 }}>
                    {name}
                  </MyText>
                  <MyText style={{ fontSize: 12, color: theme.gray400 }}>
                    {chatType === "group" ? (
                      <>
                        You
                        {data?.discussion.members
                          .filter(
                            ({ userId }) => userId !== loggedInUserData?.user.id
                          )
                          .map(
                            ({ user }) => ", " + user.displayName.split(" ")[0]
                          )}{" "}
                      </>
                    ) : userToShow?.online && newInterlocutor === undefined ? (
                      "Online"
                    ) : userToShow !== undefined &&
                      userToShow.previouslyOnlineAt !== undefined ? (
                      getLastSeenDate(userToShow.previouslyOnlineAt)
                    ) : (
                      ""
                    )}
                  </MyText>
                </View>
              </Pressable>
            </HeaderLeftPart>

            {/* <HeaderRightPart>
            </HeaderRightPart> */}
            {discussionId !== undefined && (
              <IconButton variant="ghost" onPress={goToDiscussionInfosScreen}>
                <Ionicons name="information-circle-outline" size={26} />
              </IconButton>
            )}
          </>
        ) : isError ? (
          <View>
            <MyText style={{ textAlign: "center" }}>
              {(error as any).errors[0].message}
            </MyText>
          </View>
        ) : null}
      </Header>
    </>
  );
};

export default ChatHeader;
