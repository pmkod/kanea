"use client";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import { Button } from "@/components/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu";
import { IconButton } from "@/components/core/icon-button";
import { Skeleton } from "@/components/core/skeleton";
import {
  TopBar,
  TopBarLeftPart,
  TopBarRightPart,
} from "@/components/core/top-bar";
import { useToast } from "@/components/core/use-toast";
import { UserRowItemFollowButton } from "@/components/items/user-row-item";
import EditUserProfileModal from "@/components/modals/edit-user-profile-modal";
import ProfilePictureModal from "@/components/modals/profile-picture-modal";
import ReportModal from "@/components/modals/report-modal";
import UserFollowersModal from "@/components/modals/user-followers-modal";
import UserFollowingModal from "@/components/modals/user-following-modal";
import BottomNav from "@/components/partials/bottom-nav";
import { baseFileUrl } from "@/configs";
import { usersQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { getUserByUserNameRequest } from "@/services/user-service";
import { User } from "@/types/user";
import { buildProfilePictureUrl } from "@/utils/url-utils";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal, { show } from "@ebay/nice-modal-react";
import { useNetwork } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { TabLink } from "./_tab-link";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  PiFlagPennant,
  PiGear,
  PiGridFourLight,
  PiHeart,
  PiLinkSimple,
  PiList,
  PiMagnifyingGlass,
  PiProhibit,
  PiSignOut,
  PiX,
} from "react-icons/pi";
import { RiEditLine, RiMoreFill } from "react-icons/ri";
import { AccountStatItem } from "./_account-stat-item";
import { BlockedButton } from "./_blocked-button";
import { PublishPostButton } from "@/app/(main)/_publish-post-button";
import { useListenWebsocketEvents } from "@/hooks/use-listen-websocket-events";
import { useLogout } from "@/hooks/use-logout";

//
//
//
//
//

const UserProfileLayout = ({
  params,
  children,
}: {
  children: ReactNode;
  params: { userName: string };
}) => {
  const webSocket = useAtomValue(webSocketAtom);
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isBlockingUser, setIsBlockingUser] = useState(false);
  const [isUnblockingUser, setIsUnblockingUser] = useState(false);

  const { logout } = useLogout();

  const network = useNetwork();

  const { toast } = useToast();

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const { data, isPending, isSuccess, isError } = useQuery({
    queryKey: [usersQueryKey, params.userName],
    queryFn: () => getUserByUserNameRequest(params.userName),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  //
  //
  //
  //
  //
  //

  const handleFollowSuccess = (user: User) => {
    queryClient.setQueryData(
      [usersQueryKey, params.userName],
      (qData: { user: User }) => ({
        ...qData,
        user: {
          ...qData.user,
          followedByLoggedInUser: true,
          followersCount: qData.user.followersCount! + 1,
        },
      })
    );
  };

  //
  //
  //
  //
  //
  //

  const handleUnfollowSuccess = (user: User) => {
    queryClient.setQueryData(
      [usersQueryKey, params.userName],
      (qData: { user: User }) => ({
        ...qData,
        user: {
          ...qData.user,
          followedByLoggedInUser: false,

          followersCount:
            qData.user.followersCount! > 0 ? qData.user.followersCount! - 1 : 0,
        },
      })
    );
  };

  const openEditProfileDialog = () => {
    show(EditUserProfileModal);
  };

  const blockedByAnUserEvent = (eventData: { userWhoBlocked: User }) => {
    if (data?.user.id === eventData.userWhoBlocked.id) {
      queryClient.setQueryData(
        [usersQueryKey, eventData.userWhoBlocked.userName],
        (qData: { user: User }) => ({
          ...qData,
          user: {
            ...qData.user,
            hasBlockedLoggedInUser: true,

            followersCount: eventData.userWhoBlocked.followersCount,
            followingCount: eventData.userWhoBlocked.followingCount,
          },
        })
      );
    }
  };

  const openUserFollowersModal = () => {
    if (data?.user.followersCount === 0) {
      return;
    }
    NiceModal.show(UserFollowersModal, { user: data?.user });
  };

  const openUserFollowingModal = () => {
    if (data?.user.followingCount === 0) {
      return;
    }
    NiceModal.show(UserFollowingModal, { user: data?.user });
  };

  const blockUser = () => {
    if (!network.online) {
      return;
    }
    setIsBlockingUser(true);
    webSocket?.emit("block-user", {
      userToBlockId: data?.user.id,
    });
  };

  const blockUserSuccessEvent = (eventData: { blockedUser: User }) => {
    if (eventData.blockedUser.id === data?.user.id) {
      queryClient.setQueryData(
        [usersQueryKey, eventData.blockedUser.userName],
        (qData: any) => {
          return {
            ...qData,
            user: {
              ...qData.user,
              blockedByLoggedInUser: true,
              followedByLoggedInUser: false,
              followersCount: eventData.blockedUser.followersCount,
              followingCount: eventData.blockedUser.followingCount,
            },
          };
        }
      );
      setIsBlockingUser(false);
    }
  };
  //
  const blockUserErrorEvent = (eventData: { message: string }) => {
    toast({ description: eventData.message });
    setIsBlockingUser(false);
  };

  const hasBlockedAnUserEvent = (eventData: { blockedUser: User }) => {
    if (eventData.blockedUser.id === data?.user.id) {
      queryClient.setQueryData(
        [usersQueryKey, eventData.blockedUser.userName],
        (qData: any) => {
          return {
            ...qData,
            user: {
              ...qData.user,
              blockedByLoggedInUser: true,
              followedByLoggedInUser: false,
              followersCount: eventData.blockedUser.followersCount,
              followingCount: eventData.blockedUser.followingCount,
            },
          };
        }
      );
    }
  };

  const openReportUserModal = () => {
    NiceModal.show(ReportModal, { user: data?.user });
  };

  const copyUserProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {}
  };

  //
  //
  //
  //
  //
  //
  //

  const unblockUser = () => {
    if (!network.online) {
      return;
    }
    setIsUnblockingUser(true);
    webSocket?.emit("unblock-user", {
      userToUnblockId: data?.user.id,
    });
  };

  const unblockUserSuccessEvent = (eventData: { unblockedUser: User }) => {
    if (eventData.unblockedUser.id === data?.user.id) {
      queryClient.setQueryData(
        [usersQueryKey, params.userName],
        (qData: any) => {
          return {
            ...qData,
            user: {
              ...qData.user,
              blockedByLoggedInUser: false,
            },
          };
        }
      );
      setIsUnblockingUser(false);
      toast({
        colorScheme: "success",
        description: `@${data?.user.userName} Unblocked`,
      });
    }
  };
  const unblockUserErrorEvent = () => {
    setIsUnblockingUser(false);
  };

  const unblockedByAnUserEvent = (eventData: { unblockedUser: User }) => {
    if (eventData.unblockedUser.userName === params.userName) {
      queryClient.setQueryData(
        [usersQueryKey, params.userName],
        (qData: any) => {
          return {
            ...qData,
            user: {
              ...qData.user,
              hasBlockedLoggedInUser: false,
            },
          };
        }
      );
    }
  };

  const openProfilePictureModal = () => {
    if (isSuccess && data.user.profilePicture) {
      NiceModal.show(ProfilePictureModal, {
        pictureUrl: buildProfilePictureUrl({
          fileName: data.user.profilePicture.bestQualityFileName,
        }),
      });
    }
  };

  useListenWebsocketEvents([
    { name: "block-user-success", handler: blockUserSuccessEvent },
    { name: "block-user-error", handler: blockUserErrorEvent },
    { name: "has-blocked-an-user", handler: hasBlockedAnUserEvent },
    { name: "blocked-by-an-user", handler: blockedByAnUserEvent },
    { name: "unblock-user-success", handler: unblockUserSuccessEvent },
    { name: "unblock-user-error", handler: unblockUserErrorEvent },
    { name: "has-unblocked-an-user", handler: unblockUserSuccessEvent },
    { name: "unblocked-by-an-user", handler: unblockedByAnUserEvent },
  ]);

  return (
    <>
      <div className="sticky top-0 md:hidden left-0 w-full">
        <TopBar>
          <TopBarLeftPart></TopBarLeftPart>
          <TopBarRightPart>
            {loggedInUserData?.user.id === data?.user.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton variant="ghost" size="lg" className="-mx-2">
                    <PiList />
                  </IconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <PiGear />
                      <span className="ml-2.5">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <PiSignOut />
                    <span className="ml-2.5">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </TopBarRightPart>
        </TopBar>
      </div>
      <BottomNav />
      <div className="sm:pt-5 pb-32">
        <div className="px-4 sm:px-10 md:px-20">
          <div className="flex">
            <div className="mr-4 sm:mr-8">
              {isPending ? (
                <Skeleton className="w-20 h-20 sm:w-32 sm:h-32 rounded-full" />
              ) : isSuccess ? (
                <Avatar
                  onClick={openProfilePictureModal}
                  className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gray-100 object-cover cursor-pointer"
                >
                  <AvatarImage
                    src={
                      data.user.profilePicture
                        ? baseFileUrl +
                          data.user.profilePicture.lowQualityFileName
                        : ""
                    }
                    alt={`@${data?.user.userName}`}
                    className="hover:opacity-80 transition-opacity"
                  />
                  <AvatarFallback className="text-2xl sm:text-4xl md:text-5xl">
                    {getNameInitials(data.user.displayName)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-gray-200"></div>
              )}
            </div>

            <div className="mt-2">
              {isPending ? (
                <div>
                  <Skeleton className="h-3 w-36 mb-4 mt-1.5 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              ) : isSuccess ? (
                <div>
                  <div className="text-xl leading-none sm:text-2xl font-bold">
                    {data.user.displayName}
                  </div>
                  <div className="mt-1.5 text-lg leading-none sm:text-xl font-medium text-gray-500">
                    <span className="text-base">@</span>
                    {data.user.userName}
                  </div>
                </div>
              ) : null}

              <div className="flex gap-x-2.5 mt-2">
                {isPending ? (
                  <Skeleton className="h-9 rounded-full w-24 mt-5" />
                ) : params.userName === loggedInUserData?.user.userName ? (
                  <Button variant="outline" onClick={openEditProfileDialog}>
                    <RiEditLine className="-mx-1" />
                    <span className="ml-3">Edit profile</span>
                  </Button>
                ) : isSuccess && data?.user.blockedByLoggedInUser ? (
                  <BlockedButton
                    isLoading={isUnblockingUser}
                    unblockUser={unblockUser}
                  />
                ) : isSuccess ? (
                  <UserRowItemFollowButton
                    user={data.user}
                    onFollowSuccess={handleFollowSuccess}
                    onUnfollowSuccess={handleUnfollowSuccess}
                  />
                ) : null}

                {isSuccess &&
                  params.userName !== loggedInUserData?.user.userName && (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <IconButton variant="outline">
                          <RiMoreFill />
                        </IconButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="">
                        <DropdownMenuItem onClick={copyUserProfileLink}>
                          <div className="text-lg">
                            <PiLinkSimple />
                          </div>
                          <span className="ml-3">Copy profile link</span>
                        </DropdownMenuItem>
                        {data.user.blockedByLoggedInUser ? (
                          <DropdownMenuItem onClick={() => unblockUser()}>
                            <div className="text-lg">
                              <PiX />
                            </div>
                            <span className="ml-3">
                              Unblock @{data.user.userName}
                            </span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => blockUser()}>
                            <div className="text-lg">
                              <PiProhibit />
                            </div>

                            <span className="ml-3">
                              Block @{data.user.userName}
                            </span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={openReportUserModal}>
                          <div className="text-lg">
                            <PiFlagPennant />
                          </div>
                          <span className="ml-3">
                            Report @{data.user.userName}
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>
            </div>
          </div>
          <div className="max-w-lg w-full">
            <div className="mt-4 flex gap-x-5">
              {isPending ? (
                <div className="flex gap-x-3 mt-2">
                  <Skeleton className="w-20 h-2.5" />
                  <Skeleton className="w-20 h-2.5" />
                  <Skeleton className="w-20 h-2.5" />
                </div>
              ) : (
                isSuccess && (
                  <>
                    <AccountStatItem
                      label="Posts"
                      value={data.user.postsCount}
                    />
                    <AccountStatItem
                      label="Followers"
                      value={data.user.followersCount}
                      onClick={openUserFollowersModal}
                    />
                    <AccountStatItem
                      label="Following"
                      value={data.user.followingCount}
                      onClick={openUserFollowingModal}
                    />
                  </>
                )
              )}
            </div>
            {isPending ? (
              <div className="w-full md:w-4/5 space-y-2.5 mt-5">
                <Skeleton className="w-3/5 h-2" />
                <Skeleton className="w-4/5 h-2" />
                <Skeleton className="w-2/5 h-2" />
              </div>
            ) : (
              isSuccess && (
                <div className="mt-6 text-gray-700 font-light">
                  {data?.user.bio}
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-4 mb-10 sm:px-10 md:px-20">
          <div className="">
            {data?.user.hasBlockedLoggedInUser ? (
              <div className="pt-5 border-t">
                <div className="w-max mx-auto px-4">
                  <div className="text-2xl sm:text-3xl font-semibold mb-2">
                    @{data.user.userName} blocked you
                  </div>
                  <div className="text-lg sm:text-xl text-gray-500">
                    You can't follow him and see his <br /> posts
                  </div>
                </div>
              </div>
            ) : isPending ? (
              <div className="flex gap-x-3 py-3.5 border-b mb-3">
                <Skeleton className="w-16 rounded-lg h-2.5" />
                <Skeleton className="w-20 rounded-lg h-2.5" />
              </div>
            ) : isSuccess ? (
              <div className="flex border-b border-b-gray-200 mb-2">
                <TabLink path={`/users/${params.userName}`}>
                  <div className="text-xl">
                    <PiGridFourLight />
                  </div>
                  Posts
                </TabLink>
                <TabLink path={`/users/${params.userName}/likes`}>
                  <div className="text-xl">
                    <PiHeart />
                  </div>
                  Likes
                </TabLink>
              </div>
            ) : null}
            {isError && (
              <div className="mt-5 pl-4 sm:pl-0 pt-4">
                <div className="mb-2 text-2xl md:text-3xl font-semibold text-gray-600">
                  This user dosen't exist
                </div>

                <Button variant="outline" asChild>
                  <Link href="/explore">
                    <PiMagnifyingGlass />
                    <span className="ml-2">Go to explore</span>
                  </Link>
                </Button>
              </div>
            )}
            {!isError && !data?.user.hasBlockedLoggedInUser && (
              <div>{children}</div>
            )}
          </div>
        </div>
      </div>
      {isSuccess && <PublishPostButton />}
    </>
  );
};

export default UserProfileLayout;
