"use client";
import { discussionsQueryKey, messagesQueryKey } from "@/constants/query-keys";
import { useDiscussion } from "@/hooks/use-discussion";
import { useDiscussionMessages } from "@/hooks/use-discussion-messages";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { useDidUpdate, useScrollIntoView } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { UIEventHandler, useEffect, useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useInView } from "react-intersection-observer";
import { webSocketAtom } from "../../_web-socket-atom";
import { messageToReplyToAtom } from "./_chat-footer";
import ChatMessage, { ChatMessageLoader } from "./_chat-message";
import GoToBottomOfChatButton from "./_go-to-bottom-of-chat-button";
import { isMessageSendingAtom } from "./_is-message-sending-atom";
import { getUnseenDiscussionMessagesOfThisDiscussion } from "./_utils";

interface ChatBodyProps {
  chatBodySize: {
    width: number;
    height: number;
  };
}

export const isChatBodyScrollLevelAtTheBottomAtom = atom(false);

const ChatBody = ({ chatBodySize }: ChatBodyProps) => {
  const params = useParams();
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const router = useRouter();
  const [simpleCounter, setSimpleCounter] = useState(0);
  const searchParams = useSearchParams();

  const [_, setIsMessageSending] = useAtom(isMessageSendingAtom);
  const [
    isChatBodyScrollLevelAtTheBottom,
    setIsChatBodyScrollLevelAtTheBottom,
  ] = useAtom(isChatBodyScrollLevelAtTheBottomAtom);

  const { data: loggedInUserData, isSuccess: isLoggedInUserSuccess } =
    useLoggedInUser({
      enabled: false,
    });

  const { data: discussionData, isSuccess: isDiscussionSuccess } =
    useDiscussion(params.discussionId.toString(), {
      enabled: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });

  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLDivElement,
    HTMLDivElement
  >({
    duration: 0,
    onScrollFinish: () => {
      defineIfChatBodyScrollIsNearOfTheBottom();
    },
  });

  const defineIfChatBodyScrollIsNearOfTheBottom = () => {
    const chatBody = scrollableRef.current;
    if (chatBody === null) {
      return
    }
    const isChatBodyScrollbarNearOfBottom =
      chatBody.scrollTop >= chatBody.scrollHeight - chatBody.offsetHeight - 50;

    const isChatBodyScrollable = chatBody.scrollHeight > chatBody.clientHeight;

    if (isChatBodyScrollbarNearOfBottom || !isChatBodyScrollable) {
      setIsChatBodyScrollLevelAtTheBottom(true);
    } else {
      setIsChatBodyScrollLevelAtTheBottom(false);
    }
  };

  const { ref: divOnTopInChatBodyRef, inView } = useInView({});

  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useDiscussionMessages(params.discussionId.toString(), {
    enabled: params.discussionId !== "new",
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  //
  //
  //

  useEffect(() => {
    if (isSuccess) {
      scrollIntoView();
    }
  }, [isSuccess, params.discussionId]);

  const receiveMessageEvent = (eventData: {
    message: Message;
    discussion: Discussion;
  }) => {
    setIsMessageSending(false);
    if (params.discussionId === eventData.discussion.id) {
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
      params.discussionId === "new" &&
      eventData.discussion.name === undefined &&
      loggedInUserData !== undefined
    ) {
      const currentSelectedMemberId = searchParams.get("memberId");

      const privateDiscussionMemberIds = eventData.discussion.members.map(
        ({ userId }) => userId
      );
      if (
        currentSelectedMemberId !== null &&
        privateDiscussionMemberIds.includes(currentSelectedMemberId)
      ) {
        router.push(`/discussions/${eventData.discussion.id}`);
      }
    }
  };
  const messageToReplyTo = useAtomValue(messageToReplyToAtom);

  useEffect(() => {
    defineIfChatBodyScrollIsNearOfTheBottom();
  }, [messageToReplyTo]);

  useDidUpdate(() => {
    if (messageToReplyTo && isChatBodyScrollLevelAtTheBottom) {
      const chatBody = scrollableRef.current;
      if (chatBody === null) {
        return
      }
      const isChatBodyScrollbarNearOfBottom =
        chatBody.scrollTop >=
        chatBody.scrollHeight - chatBody.offsetHeight - 80;
      if (isChatBodyScrollbarNearOfBottom) {
        goToBottomOfChat();
      }
    }
  }, [messageToReplyTo]);

  useDidUpdate(() => {
    if (data?.pages[0].messages[0].senderId === loggedInUserData?.user.id) {
      scrollIntoView();
      return;
    }
    if (isChatBodyScrollLevelAtTheBottom) {
      scrollIntoView();
      if (data?.pages[0].messages[0].senderId !== loggedInUserData?.user.id) {
        webSocket?.emit("see-discussion-messages", {
          discussionId: params.discussionId,
        });
      }
    }
  }, [simpleCounter]);

  //
  //
  //
  const [chatBodyScrollEnable, setChatBodyScrollEnable] = useState(true);

  const handleChatBodyScroll: UIEventHandler<HTMLDivElement> = (e) => {
    defineIfChatBodyScrollIsNearOfTheBottom();
    if (!hasNextPage) {
      setChatBodyScrollEnable(true);
    } else if (e.currentTarget.scrollTop < 40) {
      setChatBodyScrollEnable(false);
    } else {
      setChatBodyScrollEnable(true);
    }
  };

  useEffect(() => {
    if (scrollableRef.current === null) {
      return
    }
    if (inView && hasNextPage && !isFetchingNextPage) {
      scrollableRef.current.scrollTop = 44;
      fetchNextPage();
    }
  }, [inView]);

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
      params.discussionId !== "new" &&
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
          discussionId: params.discussionId,
        });
      }
    }
  }, [
    webSocket,
    isSuccess,
    isDiscussionSuccess,
    isLoggedInUserSuccess,
    isChatBodyScrollLevelAtTheBottom,
    params.discussionId,
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
      [discussionsQueryKey, params.discussionId, messagesQueryKey],
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
      [discussionsQueryKey, params.discussionId, messagesQueryKey],
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
      [discussionsQueryKey, params.discussionId, messagesQueryKey],
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
      [discussionsQueryKey, params.discussionId, messagesQueryKey],
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
    if (eventData.discussion.id === params.discussionId) {
      router.push("/discussions");
    }
  };

  const deleteMessageForMeSuccessEvent = ({
    message,
  }: {
    message: Message;
  }) => {
    queryClient.setQueryData(
      [discussionsQueryKey, params.discussionId, messagesQueryKey],
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
      [discussionsQueryKey, params.discussionId, messagesQueryKey],
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
    if (isSuccess) {
      webSocket?.on("discussion-messages-viewed", discussionMessagesViewved);
      webSocket?.on(
        "see-discussion-messages-success",
        seeDiscussionMessagesSuccess
      );
      webSocket?.on("receive-message-deletion", receiveMessageDeletion);
      webSocket?.on("receive-message", receiveMessageEvent);
      webSocket?.on("send-message-success", receiveMessageEvent);

      webSocket?.on("delete-discussion-success", goToDiscussionsPage);
      webSocket?.on("exit-group-discussion-success", goToDiscussionsPage);
      webSocket?.on(
        "delete-message-for-me-success",
        deleteMessageForMeSuccessEvent
      );
    } else if (params.discussionId === "new") {
      webSocket?.on("receive-message", receiveMessageEvent);
      webSocket?.on("send-message-success", receiveMessageEvent);
    }

    return () => {
      webSocket?.off("discussion-messages-viewed", discussionMessagesViewved);
      webSocket?.off(
        "see-discussion-messages-success",
        seeDiscussionMessagesSuccess
      );
      webSocket?.off("receive-message-deletion", receiveMessageDeletion);
      webSocket?.off("receive-message", receiveMessageEvent);
      webSocket?.off("send-message-success", receiveMessageEvent);

      webSocket?.off("delete-discussion-success", goToDiscussionsPage);
      webSocket?.off("exit-group-discussion-success", goToDiscussionsPage);
      webSocket?.off(
        "delete-message-for-me-success",
        deleteMessageForMeSuccessEvent
      );
    };
  }, [webSocket, isSuccess]);

  //
  //
  //

  const goToBottomOfChat = () => {
    if (scrollableRef.current === null) {
      return
    }
    scrollableRef.current.scrollTo({
      top: scrollableRef.current.scrollHeight,
      left: 0,
      behavior: "instant",
    });
  };

  //
  //
  //

  return (
    <>
      <div
        ref={scrollableRef}
        onScroll={handleChatBodyScroll}
        className={`flex-1 chat-body-scrollbar relative overflow-x-hidden ${
          isFetchingNextPage || !chatBodyScrollEnable
            ? "overflow-y-hidden"
            : "overflow-y-auto"
        }`}
        style={{ overflowAnchor: "auto" }}
      >
        {!isChatBodyScrollLevelAtTheBottom && isSuccess && (
          <GoToBottomOfChatButton
            onClick={goToBottomOfChat}
            unseenDiscussionMessagesCountOfThisDiscussion={
              unseenDiscussionMessagesCountOfThisDiscussion
            }
          />
        )}
        <div className="px-4 pt-10 h-max">
          <div ref={divOnTopInChatBodyRef} className="h-px"></div>
          {isFetchingNextPage && (
            <div className="sticky top-0 left-1/2 transform w-max -translate-x-1/2 border shadow z-50 rounded-full bg-white p-1.5">
              <BiLoaderAlt className="animate-spin text-gray-900 text-xl" />
            </div>
          )}
          <div className="flex flex-col-reverse gap-y-1.5">
            {isLoading ? (
              <>
                <ChatMessageLoader widthPercentage={15} />
                <ChatMessageLoader />
                <ChatMessageLoader side="left" widthPercentage={10} />
                <ChatMessageLoader widthPercentage={25} />
                <ChatMessageLoader side="left" widthPercentage={30} />
                <ChatMessageLoader side="left" widthPercentage={35} />
                <ChatMessageLoader widthPercentage={25} />
                <ChatMessageLoader widthPercentage={16} />
                <ChatMessageLoader widthPercentage={20} />
                <ChatMessageLoader widthPercentage={10} />
              </>
            ) : isSuccess ? (
              data?.pages.map((page) =>
                page.messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    chatBodySize={chatBodySize}
                    isGroupMessage={
                      discussionData?.discussion.name ? true : false
                    }
                  />
                ))
              )
            ) : null}
          </div>
          <div ref={targetRef} className="h-4"></div>
        </div>
      </div>
    </>
  );
};

export default ChatBody;
