"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import { Skeleton } from "@/components/core/skeleton";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarRightPart,
} from "@/components/core/top-bar";
import DiscussionInfosModal from "@/components/modals/discussion-infos-modal";
import ProfilePictureModal from "@/components/modals/profile-picture-modal";
import { appName } from "@/constants/app-constants";
import { discussionsQueryKey } from "@/constants/query-keys";
import { useDiscussion } from "@/hooks/use-discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Discussion } from "@/types/discussion";
import { User } from "@/types/user";
import { buildDiscussionFileUrl } from "@/utils/discussion-utils";
import { buildProfilePictureUrl } from "@/utils/url-utils";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal from "@ebay/nice-modal-react";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import { PiInfo } from "react-icons/pi";
import { webSocketAtom } from "../../_web-socket-atom";

const ChatHeader = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const discussionId = params.discussionId.toString();

  const { data, isSuccess, isLoading } = useDiscussion(discussionId, {
    enabled: discussionId !== "new",
  });

  const webSocket = useAtomValue(webSocketAtom);

  const isToSendFirstPrivateMessage = searchParams.get("memberId") !== null;

  const chatType: "group" | "private" = isToSendFirstPrivateMessage
    ? "private"
    : data?.discussion.name
    ? "group"
    : "private";

  const { isSuccess: isLoggedInUserSuccess, data: loggedInUserData } =
    useLoggedInUser({
      enabled: false,
    });

  const userToShow = data?.discussion.name
    ? undefined
    : isToSendFirstPrivateMessage
    ? {
        displayName: searchParams.get("memberDisplayName"),
        userName: searchParams.get("memberUserName"),
        profilePicture: {
          lowQualityFileName:
            searchParams.get("memberLowQualityProfilePictureName") || undefined,

          bestQualityFileName:
            searchParams.get("memberBestQualityProfilePictureName") ||
            undefined,
        },
        online: false,
        previouslyOnlineAt: undefined,
        allowOtherUsersToSeeMyOnlineStatus: true,
      }
    : data
    ? data.discussion.members.find(
        (member) => member.userId !== loggedInUserData?.user?.id
      )?.user
    : undefined;

  const goToPreviousPage = () => {
    router.push("/discussions");
  };

  const openDiscussionInfosModal = () => {
    if (discussionId === "new") {
      return;
    }
    NiceModal.show(DiscussionInfosModal, {
      discussion: data?.discussion,
      blocksInRelationToThisDiscussion: data?.blocksInRelationToThisDiscussion,
    });
  };

  const openProfilePictureModal = () => {
    if (
      userToShow &&
      userToShow.profilePicture &&
      userToShow.profilePicture.bestQualityFileName
    ) {
      NiceModal.show(ProfilePictureModal, {
        pictureUrl: buildProfilePictureUrl({
          fileName: userToShow.profilePicture.bestQualityFileName,
        }),
      });
    }
  };

  const openGroupPictureModal = () => {
    if (isSuccess && data.discussion.picture) {
      NiceModal.show(ProfilePictureModal, {
        pictureUrl: buildDiscussionFileUrl({
          discussionId: discussionId,
          fileName: data.discussion.picture.bestQualityFileName,
        }),
      });
    }
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

  useEffect(() => {
    if (isSuccess) {
      webSocket?.on(
        "a-member-has-exited-group-discussion",
        aMemberHasExitedGroupDiscussion
      );
      webSocket?.on("edit-group-discussion-success", editGroupDiscussion);
      webSocket?.on("group-discussion-edited", editGroupDiscussion);
      webSocket?.on(
        "add-members-to-group-discussion-success",
        addMembersToGroupDiscussion
      );
      webSocket?.on(
        "new-members-added-to-group-discussion",
        addMembersToGroupDiscussion
      );
      webSocket?.on(
        "online-status-update-of-an-user",
        onlineStatusUpdateOfAnUser
      );
    }

    return () => {
      webSocket?.off(
        "a-member-has-exited-group-discussion",
        aMemberHasExitedGroupDiscussion
      );
      webSocket?.off("edit-group-discussion-success", editGroupDiscussion);
      webSocket?.off("group-discussion-edited", editGroupDiscussion);
      webSocket?.off(
        "add-members-to-group-discussion-success",
        addMembersToGroupDiscussion
      );
      webSocket?.off(
        "new-members-added-to-group-discussion",
        addMembersToGroupDiscussion
      );
      webSocket?.off(
        "online-status-update-of-an-user",
        onlineStatusUpdateOfAnUser
      );
    };
  }, [webSocket, isSuccess]);

  useEffect(() => {
    if (isLoggedInUserSuccess) {
      const unseenDiscussionMessagesAndNotificationsCount =
        loggedInUserData.user.unseenNotificationsCount +
        loggedInUserData.user.unseenDiscussionMessagesCount;

      const prefix =
        unseenDiscussionMessagesAndNotificationsCount > 0
          ? `(${unseenDiscussionMessagesAndNotificationsCount}) `
          : "";

      const rightParenthesisIndex = document.title.indexOf(")");

      const documentTitleContainParenthesis = document.title.includes("(");

      document.title = documentTitleContainParenthesis
        ? document.title.slice(rightParenthesisIndex + 2)
        : document.title;

      if (data && data.discussion.name) {
        document.title =
          prefix +
          `Group discussion : ${data.discussion.name}` +
          " - " +
          appName;
      } else if (userToShow !== undefined) {
        document.title =
          prefix +
          `Discussion with ${userToShow.displayName}` +
          " - " +
          appName;
      }
    }
  }, [userToShow, data, isLoggedInUserSuccess, loggedInUserData]);

  return (
    <TopBar>
      <TopBarLeftPart>
        <div className="flex-1 flex items-center gap-x-4">
          <TopBarGoBackButton onClick={goToPreviousPage} />
          <div className="w-8 h-8">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-full" />
            ) : (isSuccess && chatType === "private") ||
              isToSendFirstPrivateMessage ? (
              <div className="w-full h-full relative">
                <Avatar
                  className="w-full h-full cursor-pointer"
                  onClick={openProfilePictureModal}
                >
                  <AvatarImage
                    src={
                      userToShow &&
                      userToShow.profilePicture &&
                      userToShow.profilePicture.lowQualityFileName
                        ? buildProfilePictureUrl({
                            fileName:
                              userToShow.profilePicture.lowQualityFileName!,
                          })
                        : ""
                    }
                    alt={`@${userToShow?.userName}`}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <AvatarFallback className="text-xs">
                    {getNameInitials(userToShow?.displayName!)}
                  </AvatarFallback>
                </Avatar>
                {userToShow?.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 p-0.5 rounded-full bg-white">
                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ) : isSuccess && chatType === "group" ? (
              <Avatar
                className="w-full h-full cursor-pointer"
                onClick={openGroupPictureModal}
              >
                <AvatarImage
                  src={
                    data.discussion.picture
                      ? buildDiscussionFileUrl({
                          discussionId: data.discussion.id,
                          fileName: data.discussion.picture.lowQualityFileName,
                        })
                      : ""
                  }
                  className="hover:opacity-80 transition-opacity"
                  alt={data.discussion.name}
                />
                <AvatarFallback>
                  <HiOutlineUserGroup />
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>

          <div
            onClick={openDiscussionInfosModal}
            className="cursor-pointer flex-1 text-sm sm:text-lg font-medium w-20"
          >
            {isLoading ? (
              <Skeleton className="w-1/4 h-2 mb-2" />
            ) : (
              <div className="w-full leading-none truncate">
                {chatType === "group"
                  ? data?.discussion.name
                  : userToShow?.displayName}
              </div>
            )}
            {isLoading ? (
              <Skeleton className="w-1/3 h-2" />
            ) : isSuccess ? (
              <div className="mt-1 w-full text-xs leading-none text-gray-500 truncate">
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
                ) : userToShow?.online ? (
                  "Online"
                ) : userToShow?.previouslyOnlineAt !== undefined ? (
                  getLastSeenDate(userToShow.previouslyOnlineAt)
                ) : (
                  ""
                )}
              </div>
            ) : null}
          </div>
        </div>
      </TopBarLeftPart>
      {isSuccess && (
        <TopBarRightPart>
          <button
            className="transform translate-x-2.5 sm:translate-x-0 p-2 rounded-full text-2xl hover:bg-gray-100 transition-colors"
            onClick={openDiscussionInfosModal}
          >
            <PiInfo />
          </button>
        </TopBarRightPart>
      )}
    </TopBar>
  );
};

export default ChatHeader;
