"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, {
  ChangeEventHandler,
  forwardRef,
  KeyboardEventHandler,
  LegacyRef,
  MouseEventHandler,
  ReactEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { TbLoader2 } from "react-icons/tb";

import { Skeleton } from "@/components/core/skeleton";
import { Textarea } from "@/components/core/textarea";
import { useToast } from "@/components/core/use-toast";
import { EmojiDropdown } from "@/components/dropdown/emoji-dropdown/emoji-dropdown";
import MediaDisplayModal from "@/components/modals/media-display-modal";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { discussionsQueryKey } from "@/constants/query-keys";
import { useDiscussion } from "@/hooks/use-discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Discussion } from "@/types/discussion";
import { Media } from "@/types/media";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { formatSecondsToMinutes } from "@/utils/datetime-utils";
import NiceModal from "@ebay/nice-modal-react";
import { useInterval } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import {
  PiCornersOut,
  PiFileDoc,
  PiImages,
  PiMicrophone,
  PiPaperPlaneRight,
  PiPauseFill,
  PiPlayFill,
  PiPlus,
  PiSmiley,
  PiStopFill,
  PiX,
  PiXBold,
} from "react-icons/pi";
import { useVoiceRecorder } from "use-voice-recorder";
import { webSocketAtom } from "../../_web-socket-atom";
import { isMessageSendingAtom } from "./_is-message-sending-atom";
import ParentChatMessage from "./_parent-chat-message";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Doc } from "@/types/doc";
import { IconButton } from "@/components/core/icon-button";

export const messageToReplyToAtom = atom<Message | undefined>(undefined);
export const selectedMediasAtom = atom<Media[]>([]);
export const selectedDocsAtom = atom<Doc[]>([]);

interface ChatFooterProps {
  chatBodySize: {
    width: number;
    height: number;
  };
}

const ChatFooter = ({ chatBodySize }: ChatFooterProps) => {
  const maxVoiceNoteSeconds = 120;
  const params = useParams();
  const searchParams = useSearchParams();
  const webSocket = useAtomValue(webSocketAtom);
  const queryClient = useQueryClient();
  const [messageToShowInsteadOfInput, setMessageToShowInsteadOfInput] =
    useState<string | undefined>(undefined);
  const router = useRouter();

  const maxChatMessageLength = 1000;
  const { toast } = useToast();

  const sendVoiceMessageButtonRef = useRef<HTMLButtonElement>(null);

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const { isRecording, stop, start, recorder, error } = useVoiceRecorder(
    (data) => {
      if (data) {
        setVoiceMessage({
          url: window.URL.createObjectURL(data),
          data,
        });
      }
    }
  );

  const [voiceMessageModeActive, setVoiceMessageModeActive] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState<{
    url: string | null;
    data: Blob | null;
  }>({
    url: null,
    data: null,
  });
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const recorderedVoiceMessageRef = useRef<HTMLAudioElement>(null);

  const [isMessageSending, setIsMessageSending] = useAtom(isMessageSendingAtom);

  const [selectedMedias, setSelectedMedias] = useAtom(selectedMediasAtom);
  const [selectedDocs, setSelectedDocs] = useAtom(selectedDocsAtom);

  const [messageToReplyTo, setMessageToReplyTo] = useAtom(messageToReplyToAtom);

  const [textInputCursorIndex, setTextInputCursorIndex] = useState(0);

  const [recorderedVoiceMessageSeconds, setRecorderedVoiceMessageSeconds] =
    useState(0);

  const [recorderedAudioState, setRecorderedAudioState] = useState<
    "pause" | "playing" | "end" | undefined
  >();

  const interval = useInterval(
    () => setRecorderedVoiceMessageSeconds((s) => s + 1),
    1000
  );

  const [recorderedAudioCurrentTime, setRecorderedAudioCurrentTime] =
    useState(0);

  const clearMessageToReplyTo = () => {
    setMessageToReplyTo(undefined);
  };

  //
  //
  //
  //
  //

  const adjustTextareaHeight = () => {
    if (textAreaRef.current) {
      if (textAreaRef.current.scrollHeight > 44) {
        textAreaRef.current.style.height = "46px";
        textAreaRef.current.style.height =
          textAreaRef.current.scrollHeight + "px";
      }
    }
  };

  const sendMessageByClickOnEnter: KeyboardEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleTimeUpdate: ReactEventHandler<HTMLAudioElement> = (e) => {
    setRecorderedAudioCurrentTime(e.currentTarget.currentTime);
  };

  const sendMessage = () => {
    if (isRecording) {
      stopRecordingVoiceMessage();
      setTimeout(() => {
        sendVoiceMessageButtonRef.current?.click();
      }, 20);
      return;
    }
    const text = textAreaRef.current?.value;
    if (
      (text && text.length > 0) ||
      selectedMedias.length > 0 ||
      selectedDocs.length > 0 ||
      (voiceMessage.url !== null && voiceMessage.data !== null)
    ) {
      setIsMessageSending(true);
      const dataToSend: any = {};
      if (textAreaRef) {
        dataToSend.text = text;
      }
      if (params.discussionId === "new") {
        dataToSend.isFirstPrivateMessage = true;
        dataToSend.memberId = searchParams.get("memberId");
      } else {
        dataToSend.discussionId = params.discussionId;
      }
      if (messageToReplyTo !== undefined) {
        dataToSend.parentMessageId = messageToReplyTo.id;
      }
      if (selectedMedias.length > 0) {
        dataToSend.medias = selectedMedias;
      } else if (selectedDocs.length > 0) {
        dataToSend.docs = selectedDocs;
      }

      if (voiceMessage.url !== null && voiceMessage.data !== null) {
        dataToSend.voiceMessage = voiceMessage;
      }
      webSocket?.emit("send-message", dataToSend);
      setMessageToReplyTo(undefined);
      setSelectedMedias([]);
      setSelectedDocs([]);
    }
  };

  //
  //
  //
  //
  //

  const selectPhotoOrVideo = () => {
    if (selectedDocs.length > 0) {
      toast({
        description: "You can't select image/video and docs at same time",
      });
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg, video/mp4";
    input.multiple = true;
    const maxImagesCount = 4;

    const handleMediaSelect = (e: Event) => {
      const files = input.files;

      if (!files || files?.length === 0) {
        return;
      }

      if (selectedMedias.length + files.length > maxImagesCount) {
        toast({
          colorScheme: "destructive",
          title: `The maximum number of media for a message is ${maxImagesCount}`,
        });
        return;
      }

      const newMedias: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const element = files[i];
        const media: Media = {
          id:
            selectedMedias.length > 0
              ? selectedMedias[selectedMedias.length - 1].id + 1 + i
              : 1 + i,
          file: element,
          url: URL.createObjectURL(element),
        };
        newMedias.push(media);
      }
      setSelectedMedias((prevState) => [...prevState, ...newMedias]);
      textAreaRef.current?.focus();

      // form.setValue("medias", [...selectedMedias, ...newMedias]);

      input.removeEventListener("change", handleMediaSelect);
    };
    input.addEventListener("change", handleMediaSelect);
    input.click();
  };

  //
  //
  //
  //
  //

  const selectDocs = () => {
    if (selectedMedias.length > 0) {
      toast({
        description: "You can't select image/video and docs at same time",
      });
      return;
    }
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    const maxDocsCount = 4;

    const s = (e: Event) => {
      const files = input.files;
      files?.length;

      if (!files || files?.length === 0) {
        return;
      }

      if (selectedMedias.length + files.length > maxDocsCount) {
        toast({
          colorScheme: "destructive",
          title: `The maximum number of doc for a message is ${maxDocsCount}`,
        });
        return;
      }

      const newDocs: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const element = files[i];

        const doc: Media = {
          id:
            selectedMedias.length > 0
              ? selectedMedias[selectedMedias.length - 1].id + 1 + i
              : 1 + i,
          file: element,
          url: URL.createObjectURL(element),
          name: element.name,
        };
        newDocs.push(doc);
      }
      setSelectedDocs((prevState) => [...prevState, ...newDocs]);

      input.removeEventListener("change", s);
    };
    input.addEventListener("change", s);
    input.click();
  };

  //
  //
  //
  //
  //

  const removeMedia = (id: number) => {
    const newMedias = selectedMedias.filter((media) => media.id !== id);
    setSelectedMedias(newMedias);
  };

  const removeDoc = (id: number) => {
    const newDocs = selectedDocs.filter((doc) => doc.id !== id);
    setSelectedDocs(newDocs);
  };

  const startRecordingVoiceMessage = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      stream.getAudioTracks().forEach((track) => {
        track.stop();
      });
    } catch (error) {
      toast({
        colorScheme: "default",
        description:
          "Authorise access to the microphone to send voice messages",
        duration: 2000,
      });
      return;
    }
    start();
    setVoiceMessageModeActive(true);
    interval.start();
  };

  const stopRecordingVoiceMessage = () => {
    stop();
    recorder?.stream.getAudioTracks().forEach((track) => {
      track.stop();
    });

    recorderedVoiceMessageRef.current?.pause();
    interval.stop();
  };

  useEffect(() => {
    if (recorderedVoiceMessageSeconds >= maxVoiceNoteSeconds) {
      stopRecordingVoiceMessage();
    }

    return () => {
      interval.stop;
    };
  }, [recorderedVoiceMessageSeconds]);

  useEffect(() => {
    if (recorderedAudioCurrentTime === recorderedVoiceMessageSeconds) {
      // plaiVoiceMessageInterval.stop();
      setRecorderedAudioCurrentTime(0);
    }
    return () => {
      // plaiVoiceMessageInterval.stop();
    };
  }, [recorderedAudioCurrentTime]);

  const cancelRecordingVoiceMessage = () => {
    setVoiceMessage({
      url: null,
      data: null,
    });
    stopRecordingVoiceMessage();
    setRecorderedVoiceMessageSeconds(0);

    setRecorderedAudioState(undefined);
    setVoiceMessageModeActive(false);
  };

  const { data, isSuccess, isLoading } = useDiscussion(
    params.discussionId.toString(),
    {
      enabled: params.discussionId !== "new",
    }
  );

  const playRecorderedVoiceMessage = () => {
    setRecorderedAudioState("playing");
    recorderedVoiceMessageRef.current?.play();
  };

  const onPlayRecorderedVoiceMessageEnd = () => {
    setRecorderedAudioState("end");
  };

  const discussionType: "group" | "private" =
    isSuccess && data.discussion.name ? "group" : "private";

  const userToShow =
    discussionType === "private"
      ? data?.discussion.members.find(
          (member) => member.userId !== loggedInUserData?.user?.id
        )?.user
      : undefined;

  useEffect(() => {
    if (recorderedVoiceMessageRef.current !== null) {
      recorderedVoiceMessageRef.current.addEventListener(
        "ended",
        onPlayRecorderedVoiceMessageEnd
      );
    }
    return () => {
      recorderedVoiceMessageRef.current?.removeEventListener(
        "ended",
        onPlayRecorderedVoiceMessageEnd
      );
    };
  }, [recorderedVoiceMessageRef.current]);

  const pauseRecorderedVoiceMessage = () => {
    // setIsRecorderedVoiceMessagePlaying(false);
    setRecorderedAudioState("pause");
    // plaiVoiceMessageInterval.stop();
    recorderedVoiceMessageRef.current?.pause();
  };

  //
  //
  //
  //
  //

  const beRemovedFromGroupDiscussionEvent = (eventData: {
    discussion: Discussion;
  }) => {
    // setMessageToShowInsteadOfInput("You have been removed from the group");
    router.push("/discussions");
  };

  const addUserInMembersOfDiscussionWhoBlockedList = (eventData: {
    blockedUser: User;
    userWhoBlocked: User;
  }) => {
    const blockedUserIsInGroup = data?.discussion.members.find(
      ({ userId }) => userId === eventData.blockedUser.id
    );
    const userWhoBlockedIsInGroup = data?.discussion.members.find(
      ({ userId }) => userId === eventData.userWhoBlocked.id
    );
    if (
      data?.discussion.name === undefined &&
      blockedUserIsInGroup !== undefined &&
      userWhoBlockedIsInGroup !== undefined
    ) {
      queryClient.setQueryData(
        [discussionsQueryKey, data?.discussion.id],
        (qData: any) => {
          return {
            ...qData,
            discussion: {
              ...qData.discussion,
            },
            blocksInRelationToThisDiscussion: [
              ...qData.blocksInRelationToThisDiscussion,
              {
                blocker: eventData.userWhoBlocked,
                blocked: eventData.blockedUser,
                blockerId: eventData.userWhoBlocked.id,
                blockedId: eventData.blockedUser.id,
              },
            ],
          };
        }
      );
    }
  };

  const blockUserErrorEvent = (eventData: { message: string }) => {
    toast({ colorScheme: "destructive", description: "Error" });
  };

  const removeUserFromMemberOfDiscussionWhoBlockedOfTheList = (eventData: {
    unblockedUser: User;
  }) => {
    if (eventData.unblockedUser.id === userToShow?.id) {
      queryClient.setQueryData(
        [discussionsQueryKey, data?.discussion.id],
        (qData: any) => ({
          ...qData,
          discussion: {
            ...qData.discussion,
          },
          blocksInRelationToThisDiscussion:
            qData.blocksInRelationToThisDiscussion.filter(
              ({ blockerId }: any) => blockerId !== loggedInUserData?.user.id
            ),
        })
      );
    }
  };

  const receiveMessageDeletion = (eventData: {
    discussion: Discussion;
    message: Message;
  }) => {
    if (eventData.message.id === messageToReplyTo?.id) {
      clearMessageToReplyTo();
    }
  };

  const sendMessageSuccess = () => {
    cancelRecordingVoiceMessage();
    if (textAreaRef.current) {
      textAreaRef.current.value = "";
    }
    adjustTextareaHeight();
    setIsMessageSending(false);
  };

  const sendMessageErrorEvent = ({ message }: { message: string }) => {
    setIsMessageSending(false);
    toast({ colorScheme: "destructive", description: message });
  };

  useEffect(() => {
    webSocket?.on(
      "be-removed-from-group-discussion",
      beRemovedFromGroupDiscussionEvent
    );

    webSocket?.on(
      "has-blocked-an-user",
      addUserInMembersOfDiscussionWhoBlockedList
    );
    webSocket?.on(
      "blocked-by-an-user",
      addUserInMembersOfDiscussionWhoBlockedList
    );

    webSocket?.on(
      "block-user-success",
      addUserInMembersOfDiscussionWhoBlockedList
    );
    webSocket?.on("block-user-error", blockUserErrorEvent);
    webSocket?.on(
      "unblock-user-success",
      removeUserFromMemberOfDiscussionWhoBlockedOfTheList
    );
    webSocket?.on(
      "has-unblocked-an-user",
      removeUserFromMemberOfDiscussionWhoBlockedOfTheList
    );
    webSocket?.on(
      "unblocked-by-an-user",
      removeUserFromMemberOfDiscussionWhoBlockedOfTheList
    );
    webSocket?.on("send-message-success", sendMessageSuccess);
    webSocket?.on("send-message-error", sendMessageErrorEvent);
    webSocket?.on("receive-message-deletion", receiveMessageDeletion);

    return () => {
      webSocket?.off(
        "be-removed-from-group-discussion",
        beRemovedFromGroupDiscussionEvent
      );
      webSocket?.off(
        "has-blocked-an-user",
        addUserInMembersOfDiscussionWhoBlockedList
      );
      webSocket?.off(
        "blocked-by-an-user",
        addUserInMembersOfDiscussionWhoBlockedList
      );

      webSocket?.off(
        "block-user-success",
        addUserInMembersOfDiscussionWhoBlockedList
      );
      webSocket?.off("block-user-error", blockUserErrorEvent);
      webSocket?.off(
        "unblock-user-success",
        removeUserFromMemberOfDiscussionWhoBlockedOfTheList
      );
      webSocket?.off(
        "has-unblocked-an-user",
        removeUserFromMemberOfDiscussionWhoBlockedOfTheList
      );
      webSocket?.off(
        "unblocked-by-an-user",
        removeUserFromMemberOfDiscussionWhoBlockedOfTheList
      );
      webSocket?.off("send-message-success", sendMessageSuccess);
      webSocket?.off("send-message-error", sendMessageErrorEvent);
      webSocket?.off("receive-message-deletion", receiveMessageDeletion);

      setSelectedMedias([]);
      setSelectedDocs([]);
    };
  }, [webSocket]);

  if (isLoading) {
    return (
      <div className="px-4 pb-5">
        <Skeleton className="w-full h-11 rounded-md" />
      </div>
    );
  }

  if (
    isSuccess &&
    data.discussion.name === undefined &&
    data.blocksInRelationToThisDiscussion.length > 0
  ) {
    const loggedInUserBlock = data.blocksInRelationToThisDiscussion.find(
      ({ blockerId }) => blockerId === loggedInUserData?.user.id
    );
    const otherMemberBlock = data.blocksInRelationToThisDiscussion.find(
      ({ blockerId }) => blockerId !== loggedInUserData?.user.id
    );
    return (
      <div className="text-sm text-center py-3 text-gray-500">
        {loggedInUserBlock ? (
          <>
            You have blocked{" "}
            <span className="font-bold">
              {loggedInUserBlock.blocked.displayName}
            </span>
          </>
        ) : (
          <>
            <span className="font-bold">
              {otherMemberBlock?.blocker.displayName}
            </span>
            &nbsp;blocked you
          </>
        )}
      </div>
    );
  }

  const handleMouseUp: MouseEventHandler<HTMLTextAreaElement> = (e) => {
    adjustTextareaHeight();
    setTextInputCursorIndex(e.currentTarget.selectionStart || 0);
  };

  const handleKeyUp: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    adjustTextareaHeight();
    setTextInputCursorIndex(e.currentTarget.selectionStart || 0);
  };

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setTextInputCursorIndex(e.currentTarget.selectionStart || 0);
    adjustTextareaHeight();
    if (e.target.value.length > maxChatMessageLength) {
      e.target.value = e.target.value.slice(0, maxChatMessageLength);
      toast({
        colorScheme: "destructive",
        description: `Max length of message is ${maxChatMessageLength}`,
        duration: 1800,
      });
    }
  };

  const handleEmojiSelect = (emojiObject: any) => {
    if (textAreaRef.current) {
      textAreaRef.current.value = textAreaRef
        .current!.value.split("")
        .toSpliced(textInputCursorIndex, 0, emojiObject.native)
        .join("");

      setTextInputCursorIndex(
        (prevState) => prevState + emojiObject.native.length
      );
    }
    adjustTextareaHeight();
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active.id !== over?.id) {
      const activeIndex = selectedMedias.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = selectedMedias.findIndex(
        (item) => item.id === over?.id
      );
      setSelectedMedias(arrayMove(selectedMedias, activeIndex, overIndex));
    }
  };

  if (messageToShowInsteadOfInput) {
    return (
      <div className="text-sm text-center py-3 text-gray-500">
        {messageToShowInsteadOfInput}
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6 pt-3 pb-3 sm:pb-5">
      {messageToReplyTo && (
        <div className="relative flex items-center gap-x-2 mb-1 pt-2 pb-1 border-t">
          <div className="flex-1">
            <ParentChatMessage
              chatBodySize={chatBodySize}
              message={messageToReplyTo}
              isMessageToReplyTo={true}
            />
          </div>
          <IconButton onClick={clearMessageToReplyTo} variant="ghost">
            <PiX />
          </IconButton>
        </div>
      )}
      {selectedMedias.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedMedias}
            strategy={horizontalListSortingStrategy}
          >
            <div className="relative flex flex-wrap gap-x-2 mb-1 pt-2 pb-1 border-t">
              {selectedMedias?.map((item) => (
                <SelectedMediaItem
                  key={item.id}
                  media={item}
                  remove={() => removeMedia(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {selectedDocs.length > 0 && (
        <div className="relative flex flex-wrap gap-x-2 mb-1 pt-2 pb-1 border-t">
          {selectedDocs.map((item) => (
            <SelectedDocItem
              key={item.id}
              doc={item}
              remove={() => removeDoc(item.id)}
            />
          ))}
        </div>
      )}
      <div
        className={`h-max flex px-1.5 items-center rounded-md ${
          voiceMessageModeActive
            ? "bg-white border text-gray-800"
            : "bg-gray-200"
        }`}
      >
        {voiceMessageModeActive ? (
          <div className="h-11 flex-1 flex items-center">
            <IconButton variant="ghost" onClick={cancelRecordingVoiceMessage}>
              <PiXBold />
            </IconButton>
            {!isRecording ? (
              <div className="ml-1 mr-3">
                <IconButton
                  variant="ghost"
                  onClick={
                    recorderedAudioState === "playing"
                      ? pauseRecorderedVoiceMessage
                      : playRecorderedVoiceMessage
                  }
                >
                  {recorderedAudioState === "playing" ? (
                    <PiPauseFill />
                  ) : (
                    <PiPlayFill />
                  )}
                </IconButton>
              </div>
            ) : (
              <div className="ml-1 mr-3">
                <IconButton variant="ghost" onClick={stopRecordingVoiceMessage}>
                  <PiStopFill />
                </IconButton>
              </div>
            )}
            {voiceMessage.url !== null && (
              <audio
                src={voiceMessage.url}
                ref={recorderedVoiceMessageRef}
                className="absolute invisible"
                onTimeUpdate={handleTimeUpdate}
              ></audio>
            )}
            <div className="flex-1 h-7 relative gap-x-2 flex items-center justify-end px-4 bg-green-400 rounded-full overflow-hidden">
              {(recorderedAudioState === "playing" ||
                recorderedAudioState === "pause") && (
                <>
                  <div className="text-white text-xs font-bold">
                    {formatSecondsToMinutes(recorderedAudioCurrentTime)}
                  </div>
                  <div className="text-white text-xs font-bold">/</div>
                </>
              )}
              <div className="text-white text-xs font-bold">
                {/* {recorderedVoiceMessageSeconds} */}
                {formatSecondsToMinutes(recorderedVoiceMessageSeconds)}
              </div>
            </div>
            <div className="ml-3">
              <IconButton
                variant="ghost"
                onClick={sendMessage}
                ref={sendVoiceMessageButtonRef}
              >
                <PiPaperPlaneRight />
              </IconButton>
            </div>
          </div>
        ) : (
          <>
            <EmojiDropdown handleEmojiSelect={handleEmojiSelect}>
              <ButtonOnChatInput>
                <PiSmiley />
              </ButtonOnChatInput>
            </EmojiDropdown>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <ButtonOnChatInput>
                  {/* <div className="text-xl"> */}
                  <PiPlus />
                  {/* </div> */}
                </ButtonOnChatInput>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="gap-x-2"
                  onClick={selectPhotoOrVideo}
                >
                  <PiImages />
                  Photos or videos
                </DropdownMenuItem>

                <DropdownMenuItem className="gap-x-2" onClick={selectDocs}>
                  <PiFileDoc />
                  Documents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative flex-1 h-max">
              {isMessageSending && (
                <div className="absolute top-1/2 left-4 transform -translate-y-1/2 flex items-center gap-x-2 text-gray-600">
                  <div className="animate-spin origin-center">
                    <TbLoader2 />
                  </div>
                  <div className="text-sm">Message is sending</div>
                </div>
              )}

              <Textarea
                className={`h-11 max-h-20 pt-2.5 tracking-wide border-transparent shadow-none font-medium disabled:hover:cursor-text placeholder:whitespace-nowrap ${
                  isMessageSending ? "text-transparent" : ""
                }`}
                placeholder={isMessageSending ? "" : "Message"}
                disabled={isMessageSending}
                onKeyDown={sendMessageByClickOnEnter}
                ref={textAreaRef}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                onMouseUp={handleMouseUp}
              ></Textarea>
            </div>
            {/* <ButtonOnChatInput onClick={sendMessage}>
              <div className="w-max h-max text-blue-600">
                <PiPaperPlaneRight />
              </div>
            </ButtonOnChatInput> */}
            {(textAreaRef.current && textAreaRef.current.value.length > 0) ||
            selectedDocs.length > 0 ||
            selectedMedias.length > 0 ? (
              <ButtonOnChatInput onClick={sendMessage}>
                <div className="w-max h-max text-blue-600">
                  <PiPaperPlaneRight />
                </div>
              </ButtonOnChatInput>
            ) : (
              <ButtonOnChatInput onClick={startRecordingVoiceMessage}>
                <PiMicrophone />
              </ButtonOnChatInput>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatFooter;

interface SelectedMediaItemProps {
  media: Media;
  remove: () => void;
}

const SelectedMediaItem = ({ media, remove }: SelectedMediaItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: media.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const onRemove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    remove();
  };
  const isImage = acceptedImageMimetypes.includes(media.file!.type);
  const isVideo = acceptedVideoMimetypes.includes(media.file!.type);

  const openMediaDisplayModal = () => {
    NiceModal.show(MediaDisplayModal, { media });
  };
  return (
    <div style={style} className="relative">
      <div className="absolute top-1 right-1 flex gap-x-0.5">
        <div
          className="rounded-full z-30 text-xs text-[#ffffff] bg-[#1d2424] p-1 cursor-pointer"
          onClick={openMediaDisplayModal}
        >
          {isImage ? <PiCornersOut /> : isVideo ? <PiPlayFill /> : null}
        </div>
        <div
          className="rounded-full z-30 text-xs text-[#ffffff] bg-[#1d2424] p-1 cursor-pointer"
          onClick={onRemove}
        >
          <PiX />
        </div>
      </div>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="w-[84px] aspect-square rounded overflow-hidden"
      >
        {isImage && (
          <img src={media.url} alt="" className="w-full h-full object-cover" />
        )}
        {isVideo && (
          <video className="w-full h-full object-cover">
            <source src={media.url} type={media.file?.type} />
          </video>
        )}
      </div>
    </div>
  );
};

interface SelectedDocItemProps {
  doc: Media;
  remove: () => void;
}

const SelectedDocItem = ({ doc, remove }: SelectedDocItemProps) => {
  const onRemove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    remove();
  };
  // const ext = doc.name?.split(".").pop();

  const arr = doc.name!.split(".");
  const ic = arr.length === 1 ? "docs" : arr.pop();
  return (
    <div className="relative flex items-center justify-between px-1.5 rounded py-1.5 border overflow-hidden w-60">
      {ic && (
        <div className="w-8 aspect-square rounded bg-gray-200 flex justify-center items-center text-xs mr-2">
          {ic}
        </div>
      )}

      <div className="truncate h-8 flex items-center flex-1 text-sm mr-2">
        {doc.name}
      </div>
      <div
        className="rounded hover:bg-gray-100 bg-white p-1 cursor-pointer"
        onClick={onRemove}
      >
        <PiX />
      </div>
    </div>
  );
};

//
//
//
//

interface ButtonOnChatInputProps {
  children: ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

const ButtonOnChatInput = forwardRef(
  (
    { onClick, children }: ButtonOnChatInputProps,
    forwardedRef: LegacyRef<HTMLButtonElement>
  ) => {
    return (
      <IconButton variant="ghost" ref={forwardedRef} onClick={onClick}>
        {children}
      </IconButton>
    );
  }
);
