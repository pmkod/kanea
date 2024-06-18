"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import { Skeleton } from "@/components/core/skeleton";
import { baseFileUrl } from "@/configs";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Discussion } from "@/types/discussion";
import { formatMilisecondsToMinutes } from "@/utils/datetime-utils";
import { buildDiscussionFileUrl } from "@/utils/discussion-utils";
import { getNameInitials } from "@/utils/user-utils";
import dayjs from "dayjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineUserGroup } from "react-icons/hi";
import {
  PiChecksBold,
  PiFileFill,
  PiImageSquare,
  PiMicrophoneFill,
  PiProhibit,
} from "react-icons/pi";

interface DiscussionItemProps {
  discussion: Discussion;
  onClick?: () => void;
}

export const DiscussionItem = ({
  discussion,
  onClick,
}: DiscussionItemProps) => {
  const pathname = usePathname();
  const { data, isSuccess } = useLoggedInUser({
    enabled: false,
  });
  const chatType: "group" | "private" = discussion.name ? "group" : "private";

  const userToShow =
    chatType === "private"
      ? discussion.members.find((member) => member.userId !== data?.user?.id)
          ?.user
      : undefined;

  const name = discussion.name || userToShow?.displayName;

  const unseenDiscussionMessagesCount =
    discussion.members.find((member) => member.userId === data?.user?.id)
      ?.unseenDiscussionMessagesCount ?? 0;

  const isOpen = pathname === `/discussions/${discussion.id}`;

  const lastMessageDate = discussion.lastMessage
    ? dayjs(discussion.lastMessageSentAt).isToday()
      ? dayjs(discussion.lastMessageSentAt).format("HH:mm")
      : dayjs(discussion.lastMessageSentAt).format("MM/DD/YY")
    : null;

  return (
    <Link
      onClick={onClick}
      href={`/discussions/${discussion.id}`}
      scroll={false}
      className={`w-full flex items-center cursor-pointer py-2 px-4 rounded transition-colors ${
        isOpen ? "bg-gray-100" : ""
      } hover:bg-gray-100`}
    >
      <div className="mr-4">
        {chatType === "private" ? (
          <div className="relative h-10 w-10">
            <Avatar className="w-full h-full">
              <AvatarImage
                src={
                  userToShow && userToShow.profilePicture
                    ? baseFileUrl + userToShow.profilePicture.lowQualityFileName
                    : ""
                }
                alt={`@${userToShow?.userName}`}
              />
              <AvatarFallback>
                {getNameInitials(userToShow!.displayName)}
              </AvatarFallback>
            </Avatar>
            {userToShow?.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 p-0.5 rounded-full bg-white">
                <div className="w-full h-full bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>
        ) : chatType === "group" ? (
          <Avatar>
            <AvatarImage
              src={
                discussion.picture
                  ? buildDiscussionFileUrl({
                      discussionId: discussion.id,
                      fileName: discussion.picture.lowQualityFileName,
                    })
                  : ""
              }
              alt={discussion.name}
            />
            <AvatarFallback>
              <HiOutlineUserGroup />
            </AvatarFallback>
          </Avatar>
        ) : null}
      </div>
      <div className="flex-1 overflow-x-hidden mr-2 flex flex-col justify-center">
        <div className="w-full truncate text-sm font-semibold">{name}</div>
        <div className="w-full flex items-center truncate text-sm text-gray-500">
          {discussion.lastMessage?.senderId === data?.user.id &&
            discussion.lastMessage?.viewers.length ===
              discussion.members.length - 1 &&
            !discussion.lastMessage?.usersWhoDeletedTheMessageForThem.includes(
              data!.user.id
            ) &&
            discussion.lastMessage !== null && (
              <div className="mr-1.5 relative top-0.5 inline-block text-blue-500 text-[16px]">
                <PiChecksBold />
              </div>
            )}
          {isSuccess && discussion.lastMessage ? (
            discussion.lastMessage.usersWhoDeletedTheMessageForThem.includes(
              data.user.id
            ) ? (
              <div className="flex items-center">
                <div className="mr-0.5">
                  <PiProhibit />
                </div>
                You have deleted this message
              </div>
            ) : isSuccess &&
              discussion.lastMessage.medias &&
              discussion.lastMessage.medias.length > 0 ? (
              <div className="flex items-center mt-0.5">
                <div className="mr-0.5">
                  <PiImageSquare />
                </div>
                {`${discussion.lastMessage.medias.length} media${
                  discussion.lastMessage.medias.length > 1 ? "s" : ""
                }`}
              </div>
            ) : isSuccess &&
              discussion.lastMessage.docs &&
              discussion.lastMessage.docs.length > 0 ? (
              <div className="flex items-center mt-0.5">
                <div className="mr-0.5">
                  <PiFileFill />
                </div>
                {`${discussion.lastMessage.docs.length} document${
                  discussion.lastMessage.docs.length > 1 ? "s" : ""
                }`}
              </div>
            ) : isSuccess && discussion.lastMessage.voiceNote !== undefined ? (
              <div className="inline-flex items-center">
                <div className="mr-px">
                  <PiMicrophoneFill />
                </div>
                <span className="text-xs mt-0.5">
                  {formatMilisecondsToMinutes(
                    discussion.lastMessage.voiceNote.durationInMs
                  )}
                </span>
              </div>
            ) : (
              discussion?.lastMessage?.text
            )
          ) : isSuccess &&
            discussion.lastMessage === null &&
            discussion.lastMessageId === undefined ? (
            <div className="mt-0.5">Group created</div>
          ) : (
            <div className="flex items-center">
              <div className="mr-1">
                <PiProhibit />
              </div>
              Message deleted
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="text-xs font-medium mt-2 text-gray-600">
          {lastMessageDate}
        </div>

        <div
          className={`mt-1 ${
            unseenDiscussionMessagesCount <= 0 && "invisible"
          } p-1 flex justify-center leading-none min-w-[20px] font-bold rounded-full bg-blue-600 text-white text-xs`}
        >
          {unseenDiscussionMessagesCount > 999
            ? "+999"
            : unseenDiscussionMessagesCount}
        </div>
      </div>
    </Link>
  );
};

export const DiscucssionItemLoader = () => {
  return (
    <div className="w-full flex items-center py-2 px-4">
      <Skeleton className="w-10 h-10 mr-4 rounded-full" />
      <div className="flex-1">
        <Skeleton className="w-2/3 h-2 mb-3 rounded-md" />
        <Skeleton className="w-1/3 h-2 rounded-md" />
      </div>
    </div>
  );
};
