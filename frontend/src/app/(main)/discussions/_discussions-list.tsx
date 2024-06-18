"use client";
import { IconButton } from "@/components/core/icon-button";
import { Input } from "@/components/core/input";
import {
  TopBar,
  TopBarLeftPart,
  TopBarRightPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import CreateGroupModal from "@/components/modals/create-group-discussion-modal";
import NewMessageModal from "@/components/modals/new-message-modal";
import {
  discussionsQueryKey,
  loggedInUserQueryKey,
} from "@/constants/query-keys";
import { useDiscussions } from "@/hooks/use-discussions";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useSearchDiscussions } from "@/hooks/use-search-discussions";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { show } from "@ebay/nice-modal-react";
import { useDebouncedValue } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useParams } from "next/navigation";
import {
  ChangeEventHandler,
  FocusEventHandler,
  useEffect,
  useState,
} from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import { PiArrowLeft, PiMagnifyingGlass } from "react-icons/pi";
import { RiMailAddLine } from "react-icons/ri";
import { useInView } from "react-intersection-observer";
import { webSocketAtom } from "../_web-socket-atom";
import { isChatBodyScrollLevelAtTheBottomAtom } from "./[discussionId]/_chat-body";
import {
  DiscucssionItemLoader,
  DiscussionItem,
} from "@/components/items/discussion-item";

// const isSearchModeActiveAtom = atom(false);

const DiscussionsList = () => {
  const queryClient = useQueryClient();
  const [isSearchModeActive, setIsSearchModeActive] = useState(false);
  const params = useParams();
  const webSocket = useAtomValue(webSocketAtom);

  const isChatBodyScrollLevelAtTheBottom = useAtomValue(
    isChatBodyScrollLevelAtTheBottomAtom
  );

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);

  const openNewMessageModal = () => {
    show(NewMessageModal);
  };

  const openCreateGroupModal = () => {
    show(CreateGroupModal);
  };

  const handleFocusOnSearchInput: FocusEventHandler<HTMLInputElement> = (e) => {
    setIsSearchModeActive(true);
  };

  const handleBlurOnSearchInput: FocusEventHandler<HTMLInputElement> = (e) => {
    closeSearchMode();
  };

  const closeSearchMode = () => {
    setIsSearchModeActive(false);
    setQ("");
  };

  const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQ(e.target.value || "");
  };

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const {
    data: searchDiscussionsData,
    isSuccess: isSearchDiscussionsSuccess,
    isLoading: isSearchDiscussionsLoading,
  } = useSearchDiscussions(debouncedQ, {
    enabled: debouncedQ.length > 0,
  });

  const {
    data,
    isSuccess,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useDiscussions({
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  const receiveMessageEvent = (eventData: {
    discussion: Discussion;
    message: Message;
  }) => {
    // if (
    //   isSearchModeActive &&
    //   eventData.message.senderId === loggedInUserData?.user.id &&
    //   eventData.message.discussionId === params.discussionId
    // ) {
    //   closeSearchMode();
    // }
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
                      (params.discussionId !== eventData.discussion.id ||
                        (params.discussionId === eventData.discussion.id &&
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

  useEffect(() => {
    if (isSuccess) {
      webSocket?.on("receive-message", receiveMessageEvent);
      webSocket?.on("send-message-success", receiveMessageEvent);
      webSocket?.on("group-created", groupCreatedEvent);
      webSocket?.on(
        "be-added-to-group-discussion-on-creation",
        beAddedToGroupDiscussionOnCreationEvent
      );
      webSocket?.on(
        "see-discussion-messages-success",
        seeDiscussionMessageSuccess
      );
      webSocket?.on("discussion-messages-viewed", discussionMessagesViewved);

      webSocket?.on("receive-message-deletion", receiveMessageDeletion);
      webSocket?.on("delete-discussion-success", removeDiscussionFromList);
      webSocket?.on("exit-group-discussion-success", removeDiscussionFromList);
      webSocket?.on(
        "be-removed-from-group-discussion",
        beRemovedFromGroupDiscussionEvent
      );
      webSocket?.on("edit-group-discussion-success", editGroupDiscussion);
      webSocket?.on("group-discussion-edited", editGroupDiscussion);
      webSocket?.on("be-added-to-group-discussion", beAddedToGroupDiscussion);
      webSocket?.on(
        "delete-message-for-me-success",
        deleteMessageForMeSuccessEvent
      );
      webSocket?.on(
        "online-status-update-of-an-user",
        onlineStatusUpdateOfAnUser
      );
    }
    return () => {
      webSocket?.off("receive-message", receiveMessageEvent);
      webSocket?.off("group-created", groupCreatedEvent);
      webSocket?.off("send-message-success", receiveMessageEvent);
      webSocket?.off(
        "be-added-to-group-discussion-on-creation",
        beAddedToGroupDiscussionOnCreationEvent
      );
      webSocket?.off(
        "see-discussion-messages-success",
        seeDiscussionMessageSuccess
      );
      webSocket?.off("discussion-messages-viewed", discussionMessagesViewved);

      webSocket?.off("receive-message-deletion", receiveMessageDeletion);
      webSocket?.off("delete-discussion-success", removeDiscussionFromList);
      webSocket?.off("exit-group-discussion-success", removeDiscussionFromList);
      webSocket?.off(
        "be-removed-from-group-discussion",
        beRemovedFromGroupDiscussionEvent
      );
      webSocket?.off("edit-group-discussion-success", editGroupDiscussion);
      webSocket?.off("group-discussion-edited", editGroupDiscussion);
      webSocket?.off("be-added-to-group-discussion", beAddedToGroupDiscussion);
      webSocket?.off(
        "delete-message-for-me-success",
        deleteMessageForMeSuccessEvent
      );
      webSocket?.off(
        "online-status-update-of-an-user",
        onlineStatusUpdateOfAnUser
      );
    };
  }, [webSocket, isSuccess]);

  //
  //
  //
  //
  //

  return (
    <div className="flex-1 md:flex-none w-screen md:w-[280px] lg:w-[324px] h-screen flex flex-col">
      <TopBar>
        <TopBarLeftPart>
          <TopBarTitle>Discussions</TopBarTitle>
        </TopBarLeftPart>
        <TopBarRightPart>
          <div className="flex -mr-2">
            <IconButton variant="ghost" onClick={openCreateGroupModal}>
              <MdOutlineGroupAdd />
            </IconButton>
            <IconButton variant="ghost" onClick={openNewMessageModal}>
              <RiMailAddLine />
            </IconButton>
          </div>
        </TopBarRightPart>
      </TopBar>
      <div className="flex gap-x-2 mx-6 mt-2 mb-1">
        {isSearchModeActive && (
          <IconButton variant="ghost" onClick={closeSearchMode}>
            <PiArrowLeft />
          </IconButton>
        )}
        <div className="relative flex-1">
          <div className="absolute top-0 bottom-0 left-3 flex items-center">
            <PiMagnifyingGlass />
          </div>
          <Input
            value={q}
            placeholder="Search discussion"
            className="pl-9"
            onChange={handleSearchInputChange}
            onFocus={handleFocusOnSearchInput}
            onBlur={handleBlurOnSearchInput}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col px-2 pt-2 pb-32 overflow-y-auto">
        {isSearchModeActive ? (
          <>
            {debouncedQ === "" &&
              isSuccess &&
              data.pages.map((page) =>
                page.discussions.map((discussion) => (
                  <DiscussionItem key={discussion.id} discussion={discussion} />
                ))
              )}
            {isSearchDiscussionsLoading ? (
              <>
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
              </>
            ) : isSearchDiscussionsSuccess &&
              searchDiscussionsData.discussions.length === 0 ? (
              <div className="text-center mt-4 text-gray-700">
                No results <br /> for this search
              </div>
            ) : isSearchDiscussionsSuccess ? (
              searchDiscussionsData.discussions.map((discussion) => (
                <DiscussionItem
                  key={discussion.id}
                  discussion={discussion}
                  onClick={closeSearchMode}
                />
              ))
            ) : null}
          </>
        ) : (
          <>
            {isPending ? (
              <>
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
              </>
            ) : isSuccess && data.pages[0].discussions.length === 0 ? (
              <div className="text-center mt-4 text-gray-700">
                You have no discussion
              </div>
            ) : isSuccess ? (
              data.pages.map((page) =>
                page.discussions.map((discussion) => (
                  <DiscussionItem key={discussion.id} discussion={discussion} />
                ))
              )
            ) : null}
            {isFetchingNextPage && (
              <>
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
                <DiscucssionItemLoader />
              </>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <div className="h-16" ref={ref}></div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscussionsList;
