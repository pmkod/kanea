"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu";
import { Skeleton } from "@/components/core/skeleton";
import ChatMessageMediaModal from "@/components/modals/chat-message-media-modal";
import DeleteChatMessageModal from "@/components/modals/delete-chat-message-modal";
import ReportModal from "@/components/modals/report-modal";
import { AudioPlayer } from "@/components/players/audio-player";
import { baseFileUrl } from "@/configs";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { useDiscussion } from "@/hooks/use-discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Message } from "@/types/message";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal from "@ebay/nice-modal-react";
import { useHover } from "@mantine/hooks";
import dayjs from "dayjs";
import { useSetAtom } from "jotai";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import {
  PiArrowBendUpLeftBold,
  PiChecksBold,
  PiCopySimple,
  PiDotsThreeBold,
  PiDownloadSimple,
  PiFileFill,
  PiFlag,
  PiPlayFill,
  PiTrash,
} from "react-icons/pi";
import { useInView } from "react-intersection-observer";
import { messageToReplyToAtom } from "./_chat-footer";
import ParentChatMessage from "./_parent-chat-message";
import { wrapAllUrlInTextWithATag } from "@/utils/url-utils";
import Link from "next/link";
import { downloadFile } from "@/utils/file-utils";
import Linkify from "linkify-react";

interface ChatMessageProps {
  message: Message;
  isGroupMessage: boolean;
  chatBodySize: {
    width: number;
    height: number;
  };
}

const ChatMessage = ({
  message,
  isGroupMessage,
  chatBodySize,
}: ChatMessageProps) => {
  const params = useParams();
  const { hovered, ref } = useHover();

  const { ref: senderPictureRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: "400px",
  });

  const textMessageRef = useRef<HTMLInputElement>(null);

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const { data: discussionData, isSuccess: isDiscussionData } = useDiscussion(
    params.discussionId.toString(),
    {
      enabled: false,
    }
  );

  const [messageOptionMenuOpen, setMessageOptionMenuOpen] = useState(false);

  const handleMessageOptionMenuOpenChange = (open: boolean) => {
    setMessageOptionMenuOpen(open);
  };
  const setMessageToReplyTo = useSetAtom(messageToReplyToAtom);

  const sentByLoggedInUser = loggedInUserData?.user.id === message.senderId;

  const changeMessageToReplyTo = () => {
    setMessageToReplyTo(message);
  };

  const copyTextOfMessage = async () => {
    try {
      if (message.text !== undefined) {
        await navigator.clipboard.writeText(message.text);
      }
    } catch (error) {}
  };

  const openDeleteMessageModal = () => {
    NiceModal.show(DeleteChatMessageModal, { message });
  };

  const openMediaModal = (mediaIndex: number) => {
    NiceModal.show(ChatMessageMediaModal, { mediaIndex, message });
  };

  const openReportMessageModal = () => {
    NiceModal.show(ReportModal, {
      message,
    });
  };

  return (
    <div
      ref={ref as any }
      className={`flex w-max gap-x-3 ${
        sentByLoggedInUser ? "flex-row-reverse ml-auto" : ""
      }`}
    >
      {!sentByLoggedInUser && isGroupMessage && (
        <Avatar ref={senderPictureRef} className="w-7 h-7 cursor-pointer">
          <AvatarImage
            src={
              inView && message.sender.profilePicture
                ? baseFileUrl + message.sender.profilePicture.lowQualityFileName
                : ""
            }
            alt="@shadcn"
          />
          <AvatarFallback>
            {getNameInitials(message.sender.displayName)}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`relative gap-x-2 h-max border rounded-md  ${
          sentByLoggedInUser
            ? "bg-white border-gray-300"
            : "bg-gray-100 border-gray-100"
        }`}
      >
        {!sentByLoggedInUser && isGroupMessage && (
          <Link
            href={`/users/${message.sender.userName}`}
            className={`block text-xs mx-3 mt-2.5 leading-none text-gray-600`}
          >
            {message.sender.displayName}
          </Link>
        )}
        {message.parentMessage && (
          <div className="p-1">
            <ParentChatMessage
              message={message.parentMessage}
              chatBodySize={chatBodySize}
              onTheRight={message.senderId === loggedInUserData?.user.id}
            />
          </div>
        )}
        {message.medias && message.medias.length > 0 && (
          <div className="p-1">
            <div
              style={{
                maxWidth: `${chatBodySize.width * 0.46}px`,
              }}
              className={`grid aspect-square w-60 bg-gray-100 gap-px rounded overflow-hidden ${
                message.medias.length === 1
                  ? "grid-cols-1"
                  : message.medias.length === 2
                  ? "grid-cols-2 grid-rows-1"
                  : message.medias.length === 3
                  ? "grid-cols-2 grid-rows-2"
                  : message.medias.length === 4
                  ? "grid-cols-2 grid-rows-2"
                  : ""
              }`}
            >
              {message.medias.map((media, index) => (
                <div
                  key={media.bestQualityFileName}
                  className={`w-full h-full ${
                    message.medias.length === 3 &&
                    index === 2 &&
                    "col-start-1 col-end-3"
                  }`}
                  onClick={() => openMediaModal(index)}
                >
                  <ChatMessageMediaItem media={media} message={message} />
                </div>
              ))}
            </div>
          </div>
        )}
        {message.docs && message.docs.length > 0 && (
          <div className="p-1">
            <div className={`space-y-1`}>
              {message.docs.map((doc) => (
                <ChatMessageDocItem
                  key={doc.fileName}
                  message={message}
                  chatBodySize={chatBodySize}
                  doc={doc}
                />
              ))}
            </div>
          </div>
        )}
        {message.voiceNote && (
          <div className="p-1">
            <AudioPlayer message={message} chatBodySize={chatBodySize} />
          </div>
        )}

        <div className="flex gap-x-2 items-end justify-between overflow-x-hidden">
          <div className="">
            <div
              ref={textMessageRef}
              style={{
                maxWidth: `${chatBodySize.width * 0.5}px`,
              }}
              className={`text-base text-gray-700 h-max mx-3 mb-2 break-words font-medium leading-none ${
                sentByLoggedInUser ? " mt-2" : "mt-1.5 "
              }`}
            >
              <Linkify
                options={{
                  className: "text-blue-600 clear-both hover:underline",
                  truncate: 50,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  render: {
                    url: ({ attributes, content }) => {
                      return (
                        <>
                          <br /> <a {...attributes}>{content}</a>
                        </>
                      );
                    },
                  },
                }}
              >
                {message.text}
              </Linkify>
            </div>
          </div>

          <div
            className={`text-[10px] mr-2 text-gray-700 transform -translate-y-1.5 inline-block leading-none ${
              (message.text === "" || message.text === undefined) && "mt-2"
            }`}
          >
            {dayjs(message.createdAt).format("HH:mm")}
            {message.senderId === loggedInUserData?.user.id &&
              discussionData &&
              message.viewers.length ===
                discussionData.discussion.members.length - 1 && (
                <div className="ml-1.5 relative top-1 inline-block text-blue-400 text-[15px]">
                  <PiChecksBold />
                </div>
              )}
          </div>
        </div>
      </div>

      <div
        className={`${
          hovered || messageOptionMenuOpen ? "visible" : "invisible"
        } flex items-center relative w-max`}
      >
        <button
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          onClick={changeMessageToReplyTo}
        >
          <PiArrowBendUpLeftBold />
        </button>
        <DropdownMenu
          open={messageOptionMenuOpen}
          onOpenChange={handleMessageOptionMenuOpenChange}
        >
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded hover:bg-gray-200 transition-colors">
              <PiDotsThreeBold />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuItem className="gap-x-3">
              <div className="text-lg">
                <PiArrowBendDoubleUpRight />
              </div>
              <span className="font-medium">Forward</span>
            </DropdownMenuItem> */}
            <DropdownMenuItem className="gap-x-3" onClick={copyTextOfMessage}>
              <div className="text-lg">
                <PiCopySimple />
              </div>
              <span className="font-medium">Copy</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-x-3"
              onClick={openReportMessageModal}
            >
              <div className="text-lg">
                <PiFlag />
              </div>
              <span className="font-medium">Report</span>
            </DropdownMenuItem>
            {/*  */}
            <DropdownMenuItem
              className="gap-x-3"
              onClick={openDeleteMessageModal}
            >
              <div className="text-lg">
                <PiTrash />
              </div>
              <span className="font-medium">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatMessage;

//
//
//
//
//

interface ChatMessageMediaItemProps {
  message: Message;
  media: Message["medias"][0];
}

const ChatMessageMediaItem = ({
  message,
  media,
}: ChatMessageMediaItemProps) => {
  const { ref: mediaRef, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: "200px",
  });

  // const url = buildMessageFileUrl({
  //   discussionId: message.discussionId,
  //   messageId: message.id,
  //   fileName: media.lowQualityFileName,
  // });

  return (
    <div ref={mediaRef} className="w-full h-full">
      {inView && acceptedImageMimetypes.includes(media.mimetype) && (
        <img
          className="cursor-pointer object-cover w-full h-full"
          src={buildMessageFileUrl({
            discussionId: message.discussionId,
            messageId: message.id,
            fileName: media.lowQualityFileName,
          })}
        />
      )}
      {inView && acceptedVideoMimetypes.includes(media.mimetype) && (
        <div className="w-full h-full relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2 text-white bg-gray-900 cursor-pointer">
            <PiPlayFill />
          </div>
          <video
            className="cursor-pointer object-cover w-full h-full"
            src={buildMessageFileUrl({
              discussionId: message.discussionId,
              messageId: message.id,
              fileName: media.bestQualityFileName,
            })}
          ></video>
        </div>
      )}
    </div>
  );
};

//
//
//
//
//

interface ChatMessageLoaderProps {
  side?: "left" | "right";
  widthPercentage?: number;
}
export const ChatMessageLoader = ({
  widthPercentage = 30,
  side = "right",
}: ChatMessageLoaderProps) => {
  return (
    <Skeleton
      style={{ width: `${widthPercentage}%` }}
      className={`w-20 h-9 rounded-md ${side === "right" && "ml-auto"}`}
    />
  );
};

interface ChatMessageDocItemProps {
  message: Message;
  doc: Message["docs"][0];
  chatBodySize: {
    width: number;
    height: number;
  };
}

const ChatMessageDocItem = ({
  message,
  doc,
  chatBodySize,
}: ChatMessageDocItemProps) => {
  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });
  const sentByLoggedInUser = loggedInUserData?.user.id === message.senderId;

  const downloadDoc = () => {
    downloadFile(
      buildMessageFileUrl({
        discussionId: message.discussionId,
        messageId: message.id,
        fileName: doc.fileName,
      }),
      doc.originalFileName
    );
  };

  return (
    <div
      key={doc.fileName}
      onClick={downloadDoc}
      className={`cursor-pointer relative flex items-center border px-2.5 rounded py-1.5 transition-colors ${
        sentByLoggedInUser
          ? "text-gray-600 border-gray-200 hover:bg-gray-100"
          : "text-gray-600 border-gray-300 hover:bg-gray-200"
      } overflow-hidden`}
    >
      <div className="mr-2">
        <PiFileFill />
      </div>
      <div
        style={{
          maxWidth: `${chatBodySize.width * 0.4}px`,
        }}
        className="truncate inline-block h-5 text-sm mr-2"
      >
        {doc.originalFileName}
      </div>
      <div className="ml-auto">
        <PiDownloadSimple />
      </div>
    </div>
  );
};
