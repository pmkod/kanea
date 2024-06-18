import React from "react";
import { FlatList, View } from "react-native";
import {
  DiscussionItem,
  DiscussionItemLoader,
} from "../../components/items/discussion-item";
import { useDiscussions } from "@/hooks/use-discussions";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import MyText from "@/components/core/my-text";
import { useAtomValue } from "jotai";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import {
  discussionsQueryKey,
  loggedInUserQueryKey,
} from "@/constants/query-keys";
import { User } from "@/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { currentlyOpenDiscussionIdAtom } from "@/atoms/currently-open-discussion-id-atom";
import { isChatBodyScrollLevelAtTheBottomAtom } from "./chat-body";
import Space from "@/components/core/space";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { useTheme } from "@/hooks/use-theme";

export const DiscussionsList = () => {
  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });
  const queryClient = useQueryClient();
  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useDiscussions();
  const { theme } = useTheme();

  useRefreshOnScreenFocus(refetch);

  const loadMoreDiscussions = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const isChatBodyScrollLevelAtTheBottom = useAtomValue(
    isChatBodyScrollLevelAtTheBottomAtom
  );

  const currentlyOpenDiscussionId = useAtomValue(currentlyOpenDiscussionIdAtom);

  const receiveMessageEvent = (eventData: {
    discussion: Discussion;
    message: Message;
  }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any, pageIndex: number) => {
          let discussions = [...pageData.discussions];
          discussions = discussions.filter(
            (disc: Discussion) => disc.id !== eventData.discussion.id
          );
          if (pageIndex === 0) {
            const discussion = {
              ...eventData.discussion,
              members: eventData.discussion.members.map((m) => ({
                ...m,
                unseenDiscussionMessagesCount:
                  m.userId === loggedInUserData?.user.id
                    ? eventData.message.senderId !==
                        loggedInUserData?.user.id &&
                      (currentlyOpenDiscussionId !== eventData.discussion.id ||
                        (currentlyOpenDiscussionId ===
                          eventData.discussion.id &&
                          !isChatBodyScrollLevelAtTheBottom))
                      ? m.unseenDiscussionMessagesCount
                      : 0
                    : m.unseenDiscussionMessagesCount,
              })),
            };
            discussions = [discussion, ...discussions];
          }
          return {
            ...pageData,
            discussions,
          };
        }),
      };
    });
  };

  const groupCreatedEvent = (eventData: { discussion: Discussion }) => {
    queryClient.setQueriesData(
      { queryKey: [discussionsQueryKey], exact: true },
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any, pageIndex: number) => ({
            ...pageData,
            discussions:
              pageIndex === 0
                ? [eventData.discussion, ...pageData.discussions]
                : pageData.discussions,
          })),
        };
      }
    );
  };

  //
  //
  //
  //
  //

  const beAddedToGroupDiscussionOnCreationEvent = (eventData: {
    discussion: Discussion;
  }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any, pageIndex: number) => ({
          ...pageData,
          discussions:
            pageIndex === 0
              ? [eventData.discussion, ...pageData.discussions]
              : pageData.discussions,
        })),
      };
    });
  };

  //
  //
  //
  //
  //

  const seeDiscussionMessageSuccess = (eventData: {
    date: Date;
    discussionId: string;
    viewerId: string;
  }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          discussions: pageData.discussions.map((discussion: Discussion) =>
            discussion.id === eventData.discussionId
              ? {
                  ...discussion,
                  members: discussion.members.map((member) => ({
                    ...member,
                    lastSeenAt: eventData.date,
                    unseenDiscussionMessagesCount:
                      member.userId === loggedInUserData?.user.id
                        ? 0
                        : member.unseenDiscussionMessagesCount,
                  })),
                  lastMessage:
                    discussion.lastMessage !== null
                      ? {
                          ...discussion.lastMessage,
                          viewers:
                            discussion.lastMessage?.viewers &&
                            discussion.lastMessage.senderId !==
                              loggedInUserData?.user.id
                              ? [
                                  ...discussion.lastMessage?.viewers,
                                  {
                                    viewerId: eventData.viewerId,
                                    viewAt: eventData.date,
                                  },
                                ]
                              : discussion.lastMessage?.viewers
                              ? discussion.lastMessage?.viewers
                              : [],
                        }
                      : null,
                }
              : { ...discussion }
          ),
        })),
      };
    });
  };

  //
  //
  //
  //
  //

  const discussionMessagesViewved = (eventData: {
    date: Date;
    discussionId: string;
    viewerId: string;
  }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          discussions: pageData.discussions.map((discussion: Discussion) =>
            discussion.id === eventData.discussionId
              ? {
                  ...discussion,
                  lastMessage:
                    discussion.lastMessage !== null
                      ? {
                          ...discussion.lastMessage,
                          viewers:
                            discussion.lastMessage?.viewers &&
                            discussion.lastMessage.senderId ===
                              loggedInUserData?.user.id
                              ? [
                                  ...discussion.lastMessage?.viewers,
                                  {
                                    viewerId: eventData.viewerId,
                                    viewAt: eventData.date,
                                  },
                                ]
                              : discussion.lastMessage?.viewers
                              ? discussion.lastMessage?.viewers
                              : [],
                        }
                      : null,
                }
              : { ...discussion }
          ),
        })),
      };
    });
  };

  //
  //
  //
  //
  //

  const receiveMessageDeletion = (eventData: {
    discussion: Discussion;
    message: Message;
  }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          discussions: pageData.discussions.map((discussion: Discussion) =>
            discussion.id === eventData.discussion.id
              ? eventData.discussion
              : discussion
          ),
        })),
      };
    });
  };

  //
  //
  //
  //
  //

  const beRemovedFromGroupDiscussionEvent = (eventData: {
    discussion: Discussion;
    user: User;
  }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          discussions: pageData.discussions.filter(
            (disc: Discussion) => disc.id !== eventData.discussion.id
          ),
        })),
      };
    });
    queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => {
      return {
        ...qData,
        user: {
          ...qData.user,
          unseenDiscussionMessagesCount:
            eventData.user.unseenDiscussionMessagesCount,
        },
      };
    });
  };
  const removeDiscussionFromList = (eventData: {
    user: User;
    discussion: Discussion;
  }) => {
    queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => {
      return {
        ...qData,
        user: {
          ...qData.user,
          unseenDiscussionMessagesCount:
            eventData.user.unseenDiscussionMessagesCount,
        },
      };
    });
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          discussions: pageData.discussions.filter(
            (disc: Discussion) => disc.id !== eventData.discussion.id
          ),
        })),
      };
    });
  };

  const editGroupDiscussion = (eventData: { discussion: Discussion }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          discussions: pageData.discussions.map((disc: Discussion) =>
            disc.id === eventData.discussion.id
              ? {
                  ...disc,
                  name: eventData.discussion.name,
                  picture: eventData.discussion.picture,
                }
              : disc
          ),
        })),
      };
    });
  };

  const beAddedToGroupDiscussion = (eventData: { discussion: Discussion }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any, pageIndex: number) => ({
          ...pageData,
          discussions:
            pageIndex === 0
              ? [eventData.discussion, ...pageData.discussions]
              : pageData.discussions,
        })),
      };
    });
  };

  const deleteMessageForMeSuccessEvent = ({
    message,
    discussion,
  }: {
    message: Message;
    discussion: Discussion;
  }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          discussions: pageData.discussions.map((discussionData: Discussion) =>
            discussionData.id === discussion.id &&
            discussionData.lastMessage !== undefined &&
            discussionData.lastMessage !== null
              ? {
                  ...discussionData,
                  lastMessage: {
                    ...discussionData.lastMessage,
                    usersWhoDeletedTheMessageForThem:
                      message.id === discussionData.lastMessageId
                        ? [
                            ...discussionData.lastMessage!
                              .usersWhoDeletedTheMessageForThem,
                            loggedInUserData?.user.id,
                          ]
                        : discussionData.lastMessage
                            ?.usersWhoDeletedTheMessageForThem,
                  },
                }
              : discussionData
          ),
        })),
      };
    });
  };

  const onlineStatusUpdateOfAnUser = (eventData: { user: User }) => {
    queryClient.setQueryData([discussionsQueryKey], (qData: any) => ({
      ...qData,
      pages: qData.pages.map((pageData: any) => ({
        ...pageData,
        discussions: pageData.discussions.map((discussion: Discussion) => ({
          ...discussion,
          members: discussion.members.map((member) =>
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
        })),
      })),
    }));
  };

  const discussions = isSuccess
    ? data.pages.map((page) => page.discussions).flat()
    : [];

  useListenWebsocketEvent({
    name: "receive-message",
    handler: receiveMessageEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "send-message-success",
    handler: receiveMessageEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "group-created",
    handler: groupCreatedEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "be-added-to-group-discussion-on-creation",
    handler: beAddedToGroupDiscussionOnCreationEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "see-discussion-messages-success",
    handler: seeDiscussionMessageSuccess,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "discussion-messages-viewed",
    handler: discussionMessagesViewved,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "receive-message-deletion",
    handler: receiveMessageDeletion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "delete-discussion-success",
    handler: removeDiscussionFromList,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "exit-group-discussion-success",
    handler: removeDiscussionFromList,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "be-removed-from-group-discussion",
    handler: beRemovedFromGroupDiscussionEvent,
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
    name: "be-added-to-group-discussion",
    handler: beAddedToGroupDiscussion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "delete-message-for-me-success",
    handler: deleteMessageForMeSuccessEvent,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "online-status-update-of-an-user",
    handler: onlineStatusUpdateOfAnUser,
    enabled: isSuccess,
  });

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Space height={10} />
      {isLoading ? (
        <>
          <DiscussionItemLoader />
          <DiscussionItemLoader />
          <DiscussionItemLoader />
          <DiscussionItemLoader />
          <DiscussionItemLoader />
          <DiscussionItemLoader />
          <DiscussionItemLoader />
        </>
      ) : isSuccess ? (
        <FlatList
          data={discussions}
          numColumns={1}
          initialNumToRender={18}
          renderItem={({ item }) => <DiscussionItem discussion={item} />}
          keyExtractor={(item, index) => index.toString()}
          style={{
            flex: 1,
            backgroundColor: theme.white,
          }}
          overScrollMode="never"
          ListEmptyComponent={
            <MyText style={{ marginTop: 8, textAlign: "center" }}>
              You have no discussion
            </MyText>
          }
          onResponderEnd={loadMoreDiscussions}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            isFetchingNextPage ? (
              <>
                <DiscussionItemLoader />
                <DiscussionItemLoader />
                <DiscussionItemLoader />
                <DiscussionItemLoader />
                <DiscussionItemLoader />
              </>
            ) : null
          }
        />
      ) : null}
    </View>
  );
};
