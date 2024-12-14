import {
  ChatMessageItem,
  ChatMessageItemLoader,
} from "@/components/items/chat-message-item";
import React, { RefObject, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { GoToBottomOfChatButton } from "./go-to-bottom-of-chat-button";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { isCloseToBottomInInvertedComponent } from "@/utils/scroll-utils";
import { useQueryClient } from "@tanstack/react-query";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { useNavigation, useRoute } from "@react-navigation/native";
import { isMessageSendingAtom } from "@/atoms/is-message-sending-atom";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useDiscussion } from "@/hooks/use-discussion";
import { useDiscussionMessages } from "@/hooks/use-discussion-messages";
import { Discussion } from "@/types/discussion";
import { discussionsQueryKey, messagesQueryKey } from "@/constants/query-keys";
import { discussionScreenName } from "@/constants/screens-names-constants";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/routes";
import { messageToReplyToAtom } from "./chat-footer";
import { getUnseenDiscussionMessagesOfThisDiscussion } from "@/utils/discussion-utils";
import { Message } from "@/types/message";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import { User } from "@/types/user";
import { useKeyboard } from "@react-native-community/hooks";
import MyText from "@/components/core/my-text";
import { useTheme } from "@/hooks/use-theme";

export const isChatBodyScrollLevelAtTheBottomAtom = atom(false);

const ChatBody = () => {
  const [chatBodyHeight, setChatBodyHeight] = useState(0);
  const [chatBodyContentHeight, setChatBodyContentHeight] = useState(0);
  // const currentlyOpenDiscussionId = useAtomValue(currentlyOpenDiscussionIdAtom);
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, any>>();
  const [simpleCounter, setSimpleCounter] = useState(0);
  const setIsMessageSending = useSetAtom(isMessageSendingAtom);
  const [isChatBodyScrollable, setIsChatBodyScrollable] = useState(false);
  const route = useRoute();
  const keyboard = useKeyboard();
  const messageToReplyTo = useAtomValue(messageToReplyToAtom);

  const { discussionId, newInterlocutor } = route.params as {
    discussionId?: string;
    newInterlocutor?: User;
  };

  const [
    isChatBodyScrollLevelAtTheBottom,
    setIsChatBodyScrollLevelAtTheBottom,
  ] = useAtom(isChatBodyScrollLevelAtTheBottomAtom);

  const { theme } = useTheme();

  const { data: loggedInUserData, isSuccess: isLoggedInUserSuccess } =
    useLoggedInUser({
      enabled: false,
    });

  const { data: discussionData, isSuccess: isDiscussionSuccess } =
    useDiscussion(discussionId || "", {
      enabled: false,
    });

  const chatListRef: RefObject<FlatList> = useRef(null);

  const goToBottomOfChat = () => {
    chatListRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  useEffect(() => {
    if (chatBodyContentHeight !== 0) {
      setIsChatBodyScrollable(chatBodyContentHeight > chatBodyHeight);
    }
  }, [chatBodyContentHeight, chatBodyHeight]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const isNearOfBottom = isCloseToBottomInInvertedComponent(event);

    setIsChatBodyScrollLevelAtTheBottom(isNearOfBottom);
  };

  const defineIfChatBodyScrollIsNearOfTheBottomWhenContentHeightChange = () => {
    if (!isChatBodyScrollable) {
      setIsChatBodyScrollLevelAtTheBottom(true);
    }
  };

  useEffect(() => {
    // ! Voit si tu ne doit pas call defineIfChatBodyScrollIsNearOfTheBottom
    // defineIfChatBodyScrollIsNearOfTheBottom();
    defineIfChatBodyScrollIsNearOfTheBottomWhenContentHeightChange();
  }, [chatBodyContentHeight, chatBodyHeight]);

  useEffect(() => {
    if (isChatBodyScrollLevelAtTheBottom) {
      goToBottomOfChat();
    }
  }, [chatBodyHeight]);

  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
    hasPreviousPage,
  } = useDiscussionMessages(discussionId || "", {
    enabled: discussionId !== undefined,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const receiveMessageEvent = (eventData: {
    message: Message;
    discussion: Discussion;
  }) => {
    setIsMessageSending(false);
    if (discussionId === eventData.discussion.id) {
      queryClient.setQueryData(
        [discussionsQueryKey, eventData.discussion.id, messagesQueryKey],
        (qData: any) => {
          return {
            ...qData,
            pages: qData.pages.map((pageData: any, pageIndex: number) => ({
              ...pageData,
              messages:
                pageIndex === 0
                  ? [eventData.message, ...pageData.messages]
                  : pageData.messages,
            })),
          };
        }
      );
      setSimpleCounter((prevState) => (prevState >= 10000 ? 0 : prevState + 1));
    }
    if (
      discussionId === undefined &&
      eventData.discussion.name === undefined &&
      loggedInUserData !== undefined
    ) {
      const privateDiscussionMemberIds = eventData.discussion.members.map(
        ({ userId }) => userId
      );
      if (
        newInterlocutor !== undefined &&
        privateDiscussionMemberIds.includes(newInterlocutor.id)
      ) {
        navigation.replace(discussionScreenName, {
          discussionId,
        });
        // router.push(`/discussions/${eventData.discussion.id}`);
      }
    }
  };

  // !
  // useDidUpdate(() => {
  //   if (data?.pages[0].messages[0].senderId === loggedInUserData?.user.id) {
  //     scrollIntoView();
  //     return;
  //   }
  //   if (isChatBodyScrollLevelAtTheBottom) {
  //     scrollIntoView();
  //     if (data?.pages[0].messages[0].senderId !== loggedInUserData?.user.id) {
  //       webSocket?.emit("see-discussion-messages", {
  //         discussionId: currentlyOpenDiscussionId,
  //       });
  //     }
  //   }
  // }, [simpleCounter]);

  //
  //
  //
  // !
  // const [chatBodyScrollEnable, setChatBodyScrollEnable] = useState(true);

  //
  //
  //

  const unseenDiscussionMessagesCountOfThisDiscussion =
    isDiscussionSuccess && isSuccess
      ? getUnseenDiscussionMessagesOfThisDiscussion(
          discussionData,
          loggedInUserData
        )
      : 0;

  useEffect(() => {
    if (
      discussionId !== undefined &&
      isSuccess &&
      isLoggedInUserSuccess &&
      isDiscussionSuccess
    ) {
      const unseenDiscussionMessagesCountOfThisDiscussion =
        getUnseenDiscussionMessagesOfThisDiscussion(
          discussionData,
          loggedInUserData
        );
      if (
        isChatBodyScrollLevelAtTheBottom &&
        unseenDiscussionMessagesCountOfThisDiscussion !== undefined &&
        unseenDiscussionMessagesCountOfThisDiscussion > 0
      ) {
        webSocket?.emit("see-discussion-messages", {
          discussionId: discussionId,
        });
      }
    }
  }, [
    webSocket,
    isSuccess,
    isDiscussionSuccess,
    isLoggedInUserSuccess,
    isChatBodyScrollLevelAtTheBottom,
    discussionId,
  ]);

  //
  //
  //
  //
  //

  const discussionMessagesViewved = (eventData: {
    date: Date;
    viewerId: string;
  }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId, messagesQueryKey],
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            messages: pageData.messages.map((message: Message) =>
              message.senderId === loggedInUserData?.user.id &&
              message.viewers.find(
                (viewer) => viewer.viewerId === eventData.viewerId
              ) === undefined
                ? {
                    ...message,

                    viewers: [
                      ...message.viewers,
                      {
                        viewerId: eventData.viewerId,
                        viewAt: eventData.date,
                      },
                    ],
                  }
                : {
                    ...message,
                  }
            ),
          })),
        };
      }
    );
  };

  const seeDiscussionMessagesSuccess = (eventData: {
    date: Date;
    viewerId: string;
  }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId, messagesQueryKey],
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            messages: pageData.messages.map((message: Message) =>
              message.senderId === loggedInUserData?.user.id ||
              message.viewers.find(
                (viewer) => viewer.viewerId === eventData.viewerId
              ) !== undefined
                ? {
                    ...message,
                  }
                : {
                    ...message,
                    viewers: [
                      ...message.viewers,
                      {
                        viewerId: eventData.viewerId,
                        viewAt: eventData.date,
                      },
                    ],
                  }
            ),
          })),
        };
      }
    );
  };

  const receiveMessageDeletion = (eventData: {
    discussion: Discussion;
    message: Message;
  }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId, messagesQueryKey],
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            messages: pageData.messages.filter(
              (message: Message) => message.id !== eventData.message.id
            ),
          })),
        };
      }
    );
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId, messagesQueryKey],
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            messages: pageData.messages.map((message: Message) =>
              message.parentMessageId === eventData.message.id
                ? { ...message, parentMessage: null }
                : message
            ),
          })),
        };
      }
    );
  };

  const goToDiscussionsPage = (eventData: { discussion: Discussion }) => {
    if (eventData.discussion.id === discussionId) {
      navigation.replace(discussionScreenName);
      // router.push("/discussions");
    }
  };

  const deleteMessageForMeSuccessEvent = ({
    message,
  }: {
    message: Message;
  }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, discussionId, messagesQueryKey],
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            messages: pageData.messages.filter(
              (messageData: Message) => messageData.id !== message.id
            ),
          })),
        };
      }
    );

    queryClient.setQueryData(
      [discussionsQueryKey, discussionId, messagesQueryKey],
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            messages: pageData.messages.map((messageData: Message) =>
              messageData.parentMessageId === message.id
                ? { ...messageData, parentMessage: null }
                : messageData
            ),
          })),
        };
      }
    );
  };

  useEffect(() => {
    if (messageToReplyTo && isChatBodyScrollLevelAtTheBottom) {
      goToBottomOfChat();
    }
  }, [messageToReplyTo, isChatBodyScrollLevelAtTheBottom]);

  useEffect(() => {
    if (keyboard.keyboardShown && isChatBodyScrollLevelAtTheBottom) {
      goToBottomOfChat();
    }
    return () => {};
  }, [keyboard.keyboardShown]);

  useListenWebsocketEvent({
    name: "discussion-messages-viewed",
    handler: discussionMessagesViewved,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "see-discussion-messages-success",
    handler: seeDiscussionMessagesSuccess,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "receive-message-deletion",
    handler: receiveMessageDeletion,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "receive-message",
    handler: receiveMessageEvent,
    enabled: isSuccess || discussionId === undefined,
  });
  useListenWebsocketEvent({
    name: "send-message-success",
    handler: receiveMessageEvent,
    enabled: isSuccess || discussionId === undefined,
  });
  useListenWebsocketEvent({
    name: "delete-discussion-success",
    handler: goToDiscussionsPage,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "exit-group-discussion-success",
    handler: goToDiscussionsPage,
    enabled: isSuccess,
  });
  useListenWebsocketEvent({
    name: "delete-message-for-me-success",
    handler: deleteMessageForMeSuccessEvent,
    enabled: isSuccess,
  });

  //
  //
  //

  const messages = isSuccess
    ? data.pages.map((page) => page.messages).flat()
    : [];

  const loadPreviousMessage = () => {
    if (!isLoading && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View
      style={{ flex: 1, position: "relative" }}
      onLayout={(event) => setChatBodyHeight(event.nativeEvent.layout.height)}
    >
      {!isChatBodyScrollLevelAtTheBottom && isChatBodyScrollable && (
        <GoToBottomOfChatButton
          onPress={goToBottomOfChat}
          unseenDiscussionMessagesCountOfThisDiscussion={
            unseenDiscussionMessagesCountOfThisDiscussion
          }
        />
      )}
      {isFetchingNextPage && (
        <View
          style={{
            position: "absolute",
            top: 0,
            alignItems: "center",
            width: "100%",
          }}
        >
          <View
            style={{
              borderRadius: 300,
              padding: 4,
              backgroundColor: theme.white,
              // elevation: 2,
              borderWidth: 0.5,
              borderColor: theme.gray100 + "8C",
            }}
          >
            <ActivityIndicator
              size={22}
              color={theme.gray950}
              style={{
                position: "relative",
                zIndex: 1000,
              }}
            />
          </View>
        </View>
      )}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <ChatMessageItemLoader widthPercentage={55} />
          <ChatMessageItemLoader widthPercentage={40} />
          <ChatMessageItemLoader widthPercentage={35} />
          <ChatMessageItemLoader widthPercentage={45} side="right" />
          <ChatMessageItemLoader widthPercentage={40} side="right" />
          <ChatMessageItemLoader widthPercentage={40} />
          <ChatMessageItemLoader widthPercentage={25} side="right" />
        </View>
      ) : (
        isSuccess && (
          <FlatList
            onScroll={handleScroll}
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            initialNumToRender={20}
            // scrollEnabled={!isFetchingNextPage}
            onEndReachedThreshold={0.3}
            onEndReached={loadPreviousMessage}
            keyExtractor={(item, index) => index.toString()}
            // onRefresh={handleOnRefresh}
            // refreshControl={{}}
            overScrollMode="never"
            inverted
            data={messages}
            ListEmptyComponent={(index) => (
              <MyText
                key={index}
                style={{ textAlign: "center", paddingTop: 20 }}
              >
                No message
              </MyText>
            )}
            renderItem={({ item }) => (
              <ChatMessageItem
                message={item}
                // chatBodyWidth={chatBodyWidth}
                isGroupMessage={discussionData?.discussion.name ? true : false}
              />
            )}
            ref={chatListRef}
            onContentSizeChange={(_, contentHeight) => {
              setChatBodyContentHeight(contentHeight);
            }}
            keyboardShouldPersistTaps="handled"
          />
        )
      )}

      {isError ? (
        <View>
          <MyText style={{ textAlign: "center" }}>
            {(error as any).errors[0].message}
          </MyText>
        </View>
      ) : null}
    </View>
  );
};

export default ChatBody;
