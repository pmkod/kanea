import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { baseFileUrl } from "@/configs";
import {
  discussionsQueryKey,
  messagesWithMediasAndDocsQueryKey,
} from "@/constants/query-keys";
import { useDiscussion } from "@/hooks/use-discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import {
  defineGroupDiscussionMemberAsAdminRequest,
  dismissGroupDiscussionMemberAsAdminRequest,
  getDiscussionMessagesWithMediasAndDocsRequest,
} from "@/services/discussion-service";
import { BlocksInRelationToThisDiscussion } from "@/types/blocks-in-relation-to-this-discussion";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import {
  buildDiscussionFileUrl,
  buildMessageFileUrl,
} from "@/utils/discussion-utils";
import { buildProfilePictureUrl } from "@/utils/url-utils";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useHover, useNetwork } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useEffect,
} from "react";
import {
  PiCaretRight,
  PiCaretRightBold,
  PiDotsThreeOutline,
  PiDownloadSimple,
  PiFileFill,
  PiPencil,
  PiPlayFill,
  PiUserPlus,
  PiUsersThree,
} from "react-icons/pi";
import { useInView } from "react-intersection-observer";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import { Button } from "../core/button";
import { Dialog, DialogClose, DialogContent } from "../core/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../core/dropdown-menu";
import { Skeleton } from "../core/skeleton";
import { useToast } from "../core/use-toast";
import AddNewMembersToGroupModal from "./add-new-members-to-group-modal";
import { BlockUserModal } from "./block-user-modal";
import ChatMessageMediaModal from "./chat-message-media-modal";
import { DeleteDiscussionModal } from "./delete-discussion-modal";
import DiscussionMediasAndDocsModal from "./discussion-medias-and-docs-modal";
import EditGroupModal from "./edit-group-discussion-modal";
import { ExitGroupDiscussionModal } from "./exit-group-discussion-modal";
import ProfilePictureModal from "./profile-picture-modal";
import { RemoveUserFromGroupModal } from "./remove-user-from-group-modal";
import ReportModal from "./report-modal";
import { IconButton } from "../core/icon-button";
import { downloadFile } from "@/utils/file-utils";

const DiscussionInfosModal = NiceModal.create(
  ({
    discussion,
    blocksInRelationToThisDiscussion,
  }: {
    discussion: Discussion;
    blocksInRelationToThisDiscussion: BlocksInRelationToThisDiscussion[];
  }) => {
    const modal = useModal();
    const pathname = usePathname();
    const { data: loggedInUserData } = useLoggedInUser({
      enabled: false,
    });
    const webSocket = useAtomValue(webSocketAtom);
    const network = useNetwork();

    const router = useRouter();
    const queryClient = useQueryClient();

    const { toast } = useToast();

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const { data, isSuccess, isFetching, refetch } = useDiscussion(
      discussion.id,
      { enabled: true }
    );
    discussion = isSuccess ? data.discussion : discussion;
    //
    //

    const discussionType: "group" | "private" = discussion.name
      ? "group"
      : "private";

    const isLoggedInUserAdminOfDiscussionGroup = discussion.members.find(
      ({ userId }) => userId === loggedInUserData?.user.id
    )?.isAdmin;

    const userToShow =
      discussionType === "private"
        ? discussion.members.find(
            (member) => member.userId !== loggedInUserData?.user?.id
          )?.user
        : undefined;

    const openEditGroupModal = () => {
      NiceModal.show(EditGroupModal, {
        discussion,
      });
    };

    const openAddNewMembersToGroupModal = () => {
      NiceModal.show(AddNewMembersToGroupModal, {
        discussion,
      });
    };

    const visitUserProfile = (user: User) => {
      router.push(`/users/${user.userName}`);
    };

    const openRemoveUserFromGroupModal = (user: User) => {
      NiceModal.show(RemoveUserFromGroupModal, {
        discussion,
        user,
      });
    };

    const { mutate: defineAsAdmin } = useMutation({
      mutationFn: (user: User) =>
        defineGroupDiscussionMemberAsAdminRequest(discussion.id, user.id),
      onSuccess: (data, user, context) => {
        queryClient.setQueryData(
          [discussionsQueryKey, discussion.id],
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
        toast({ colorScheme: "success", description: "Success" });
      },
      onError: (err: any, variable, context) => {
        toast({
          colorScheme: "destructive",
          description: err.errors[0].message,
        });
      },
    });

    const { mutate: dismissAsAdmin } = useMutation({
      mutationFn: (user: User) =>
        dismissGroupDiscussionMemberAsAdminRequest(discussion.id, user.id),
      onSuccess: (data, user, context) => {
        queryClient.setQueryData(
          [discussionsQueryKey, discussion.id],
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
        toast({ colorScheme: "success", description: "Success" });
      },
      onError: (err: any, variable, context) => {
        toast({
          colorScheme: "destructive",
          description: err.errors[0].message,
        });
      },
    });

    const openPictureModal = () => {
      if (userToShow !== undefined && userToShow.profilePicture !== undefined) {
        NiceModal.show(ProfilePictureModal, {
          pictureUrl: buildProfilePictureUrl({
            fileName: userToShow.profilePicture.bestQualityFileName,
          }),
        });
      } else if (discussion.picture !== undefined) {
        NiceModal.show(ProfilePictureModal, {
          pictureUrl: buildDiscussionFileUrl({
            discussionId: discussion.id,
            fileName: discussion.picture.bestQualityFileName,
          }),
        });
      }
    };

    const openDeleteDiscussionModal = () => {
      NiceModal.show(DeleteDiscussionModal, { discussion });
    };

    const openExitGroupDiscussionModal = () => {
      NiceModal.show(ExitGroupDiscussionModal, {
        discussion,
        user: loggedInUserData?.user,
      });
    };

    const openReportDiscussionModal = () => {
      NiceModal.show(ReportModal, { discussion });
    };

    const openBlockUserModal = () => {
      NiceModal.show(BlockUserModal, {
        discussion,
        user: userToShow!,
      });
    };

    const loggedInUserBlockOtherMember =
      blocksInRelationToThisDiscussion.find(
        ({ blockerId }) => blockerId === loggedInUserData?.user.id
      ) !== undefined;

    const unblockUser = () => {
      if (!network.online) {
        return;
      }
      webSocket?.emit("unblock-user", {
        userToUnblockId: userToShow?.id,
      });
    };

    const unblockUserSuccessEvent = (eventData: { unblockedUser: User }) => {
      toast({
        colorScheme: "success",
        description: `@${userToShow?.userName} Unblocked`,
      });
    };
    const unblockUserErrorEvent = () => {
      toast({
        colorScheme: "destructive",
        description: "Error",
      });
    };

    useEffect(() => {
      if (modal.visible) {
        if (!isFetching) {
          refetch();
        }
      }
    }, [modal.visible]);

    useEffect(() => {
      modal.hide();
    }, [pathname]);

    useEffect(() => {
      webSocket?.on("unblock-user-success", unblockUserSuccessEvent);
      webSocket?.on("unblock-user-error", unblockUserErrorEvent);
      return () => {
        webSocket?.off("unblock-user-success", unblockUserSuccessEvent);
        webSocket?.off("unblock-user-error", unblockUserErrorEvent);
      };
    }, [webSocket]);

    return (
      <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
        <DialogContent className="overflow-y-auto pt-0 outline-none">
          <div className="sticky bg-white top-0 h-14 flex items-center pl-6 z-50">
            <DialogClose />
            {/* <DialogTitle></DialogTitle> */}
          </div>
          <div className="pt-2 px-6 pb-4 h-[75vh] max-w-lg">
            <div className="flex gap-x-4">
              <div className="relative">
                <Avatar
                  className="w-20 h-20 cursor-pointer"
                  onClick={openPictureModal}
                >
                  <AvatarImage
                    src={
                      discussionType === "private"
                        ? userToShow && userToShow.profilePicture
                          ? baseFileUrl +
                            userToShow.profilePicture.lowQualityFileName
                          : ""
                        : discussion.picture
                        ? buildDiscussionFileUrl({
                            discussionId: discussion.id,
                            fileName: discussion.picture.lowQualityFileName,
                          })
                        : ""
                    }
                    alt={`@${userToShow?.userName || discussion.name}`}
                  />
                  <AvatarFallback className="text-4xl">
                    {discussionType === "private" ? (
                      getNameInitials(userToShow?.displayName!)
                    ) : (
                      <div>
                        <PiUsersThree />
                      </div>
                    )}
                  </AvatarFallback>
                </Avatar>
                {userToShow?.online && (
                  <div className="absolute bottom-px right-px w-4 h-4 p-0.5 rounded-full bg-white">
                    <div className="w-full h-full bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
              <div className="">
                <div className="text-2xl font-semibold text-gray-700 mt-2">
                  {discussionType === "private"
                    ? userToShow?.displayName
                    : discussion.name}
                </div>

                <div className="text-lg text-gray-500 font-semibold">
                  {discussionType === "private"
                    ? "@" + userToShow?.userName
                    : discussion.members.length + " members"}
                </div>
              </div>
            </div>
            {discussionType === "group" && (
              <div className="flex gap-x-4 mt-4">
                <ActionButton onClick={openEditGroupModal}>
                  <ActionButtonIcon>
                    <PiPencil />
                  </ActionButtonIcon>
                  <ActionButtonLabel>Edit</ActionButtonLabel>
                </ActionButton>
                {isLoggedInUserAdminOfDiscussionGroup && (
                  <ActionButton onClick={openAddNewMembersToGroupModal}>
                    <ActionButtonIcon>
                      <PiUserPlus />
                    </ActionButtonIcon>
                    <ActionButtonLabel>Add</ActionButtonLabel>
                  </ActionButton>
                )}
              </div>
            )}
            <MediasAndDocsPart discussion={discussion} />

            <div className="mt-8">
              <div className="text-sm text-gray-600 mb-2">Members</div>
              <div className="pb-16">
                {discussion.members.map(({ user, isAdmin }) => (
                  <div key={user.id} className="flex items-center gap-x-4 py-2">
                    <Avatar asChild>
                      <Link href={`/users/${user?.userName}`}>
                        <AvatarImage
                          src={
                            user.profilePicture
                              ? baseFileUrl +
                                user.profilePicture.lowQualityFileName
                              : ""
                          }
                          alt={`@${user.userName}`}
                        />
                        <AvatarFallback>
                          {getNameInitials(user?.displayName!)}
                        </AvatarFallback>
                      </Link>
                    </Avatar>
                    {/* <UserRowItemNameAndUserName user={user} /> */}
                    <div className="text-sm flex-1 leading-none">
                      <div className="flex items-center mb-1">
                        <Link
                          href={`/users/${user?.userName}`}
                          className="font-semibold"
                        >
                          {user?.displayName}
                        </Link>
                        {isAdmin && (
                          <div className="text-xs px-1 py-px ml-2 rounded-sm font-semibold text-green-600 bg-green-100">
                            admin
                          </div>
                        )}
                      </div>
                      <Link
                        href={`/users/${user?.userName}`}
                        className="block text-gray-600"
                      >
                        <span className="text-xs">@</span>
                        <span>{user?.userName}</span>
                      </Link>
                    </div>
                    {loggedInUserData?.user.id !== user.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <IconButton variant="ghost">
                            <PiDotsThreeOutline />
                          </IconButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="z-[80]">
                          <DropdownMenuItem
                            onClick={() => visitUserProfile(user)}
                          >
                            Visit profile
                          </DropdownMenuItem>
                          {isLoggedInUserAdminOfDiscussionGroup && (
                            <>
                              {isAdmin ? (
                                <DropdownMenuItem
                                  onClick={() => dismissAsAdmin(user)}
                                >
                                  Dismis as admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => defineAsAdmin(user)}
                                >
                                  Define as admin
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() =>
                                  openRemoveUserFromGroupModal(user)
                                }
                              >
                                Remove from group
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center sticky left-0 ring-0 bottom-0 w-full h-14 bg-white border-t">
              {discussionType === "private" &&
                (loggedInUserBlockOtherMember ? (
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => unblockUser()}
                  >
                    Unblock user
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={openBlockUserModal}
                  >
                    Block user
                  </Button>
                ))}
              <Button
                variant="ghost"
                fullWidth
                onClick={openReportDiscussionModal}
              >
                Report
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={openDeleteDiscussionModal}
              >
                Delete
              </Button>

              {discussionType === "group" && (
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={openExitGroupDiscussionModal}
                >
                  Exit group
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default DiscussionInfosModal;

interface ActionButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}

const ActionButton = ({ onClick, children }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-y-1 w-20 py-2.5 hover:bg-gray-100 transition-colors border rounded-md border-gray-200 text-sm font-semibold"
    >
      {children}
    </button>
  );
};

const ActionButtonIcon = ({ children }: PropsWithChildren) => {
  return <div className="text-xl">{children}</div>;
};

const ActionButtonLabel = ({ children }: PropsWithChildren) => {
  return <div className="text-sm text-gray-500">{children}</div>;
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//

const MediasAndDocsPart = ({ discussion }: { discussion?: Discussion }) => {
  const params = useParams();

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [
      discussionsQueryKey,
      params.discussionId,
      messagesWithMediasAndDocsQueryKey,
    ],
    queryFn: () =>
      getDiscussionMessagesWithMediasAndDocsRequest(
        params.discussionId.toString()
      ),
  });

  const openDiscussionMediasAndDocsModal = () => {
    NiceModal.show(DiscussionMediasAndDocsModal, {
      discussion: discussion,
    });
  };

  return (
    <div className="mt-8">
      <div
        className="text-sm text-gray-600 mb-2 cursor-pointer"
        onClick={openDiscussionMediasAndDocsModal}
      >
        Medias and docs
      </div>
      <div className="overflow-x-scroll whitespace-nowrap">
        <div className="flex gap-x-1 h-24 min-w-full w-max">
          {isLoading ? (
            <>
              <Skeleton className="h-full aspect-square" />
              <Skeleton className="h-full aspect-square" />
              <Skeleton className="h-full aspect-square" />
            </>
          ) : isSuccess && data.messages.length === 0 ? (
            <div className="border border-dashed border-gray-300 w-full rounded h-full flex justify-center items-center text-sm text-gray-400">
              No media or doc
            </div>
          ) : isSuccess ? (
            data?.messages.map((message) => {
              if (message.medias.length > 0) {
                return message.medias.map((media) => (
                  <MediaItem
                    key={media.lowQualityFileName}
                    message={message}
                    media={media}
                  />
                ));
              }
              if (message.docs.length > 0) {
                return message.docs.map((doc) => (
                  <DocItem
                    key={doc.originalFileName}
                    message={message}
                    doc={doc}
                  />
                ));
              }
            })
          ) : null}
          {data && data.messages.length > 0 && (
            <div
              className="h-full aspect-square inline-flex justify-center items-center rounded bg-gray-200 cursor-pointer"
              onClick={openDiscussionMediasAndDocsModal}
            >
              <PiCaretRightBold className="text-4xl text-gray-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MediaItem = ({
  media,
  message,
}: {
  message: Message;
  media: Message["medias"][0];
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: "200px",
  });

  const openMediaModal = () => {
    const mediaIndex = message.medias.findIndex(
      (m) => m.lowQualityFileName === media.lowQualityFileName
    );
    NiceModal.show(ChatMessageMediaModal, {
      mediaIndex,
      message,
    });
  };

  return (
    <div
      onClick={openMediaModal}
      ref={ref}
      className="h-full aspect-square cursor-pointer rounded overflow-hidden"
    >
      {media.mimetype.startsWith("video") ? (
        <div className="relative w-full h-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 text-sm text-white bg-gray-900 cursor-pointer">
            <PiPlayFill />
          </div>

          <video
            src={
              inView
                ? buildMessageFileUrl({
                    discussionId: message.discussionId,
                    fileName: media.lowQualityFileName,
                    messageId: message.id,
                  })
                : ""
            }
            className="w-full h-full object-cover"
          ></video>
        </div>
      ) : (
        <img
          src={
            inView
              ? buildMessageFileUrl({
                  discussionId: message.discussionId,
                  fileName: media.lowQualityFileName,
                  messageId: message.id,
                })
              : ""
          }
          alt=""
          className="w-full h-full object-cover"
        />
      )}
    </div>
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
  const { hovered, ref } = useHover();

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
      ref={ref as any}
      onClick={downloadDoc}
      title={doc.originalFileName}
      className="h-full bg-gray-200 aspect-square cursor-pointer rounded overflow-hidden"
    >
      <div className="pt-4 mb-2 flex justify-center items-center text-4xl text-gray-400">
        {hovered ? <PiDownloadSimple /> : <PiFileFill />}
      </div>
      <div className="line-clamp-2 truncate px-2 py-0.5 text-xs break-words">
        {doc.originalFileName}
      </div>
    </div>
  );
};
