"use client";
import { AccountStatItem } from "@/app/(main)/users/[userName]/(profile)/_account-stat-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/core/hover-card";
import { baseFileUrl } from "@/configs";
import { usersQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { getUserByUserNameRequest } from "@/services/user-service";
import { User } from "@/types/user";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal from "@ebay/nice-modal-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { UserRowItemFollowButton } from "../items/user-row-item";
import UserFollowersModal from "../modals/user-followers-modal";
import UserFollowingModal from "../modals/user-following-modal";

//

interface UserProfileHoverCardProps {
  children: ReactNode;
  user: User;
  hasHoverCard?: boolean;
}

//

const UserProfileHoverCard = ({
  children,
  user,
  hasHoverCard,
}: UserProfileHoverCardProps) => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data: loggedInUserData } = useLoggedInUser({ enabled: false });

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [usersQueryKey, user.userName],
    queryFn: () => getUserByUserNameRequest(user.userName),
    enabled: isCardVisible,
  });

  const openUserFollowersModal = () => {
    if (data?.user.followersCount === 0) {
      return;
    }
    NiceModal.show(UserFollowersModal, { user: data?.user });
  };
  //
  const openUserFollowingModal = () => {
    if (data?.user.followingCount === 0) {
      return;
    }
    NiceModal.show(UserFollowingModal, { user: data?.user });
  };

  //
  //
  //
  //

  const handleFollowSuccess = (user: User) => {
    queryClient.setQueryData(
      [usersQueryKey, data?.user.userName],
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

  const handleUnfollowSuccess = (user: User) => {
    queryClient.setQueryData(
      [usersQueryKey, data?.user.userName],
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

  //
  return (
    <HoverCard
      open={hasHoverCard !== undefined ? hasHoverCard : isCardVisible}
      onOpenChange={setIsCardVisible}
    >
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-[360px] rounded">
        <div className="flex justify-between">
          {isLoading ? (
            <div></div>
          ) : isSuccess ? (
            <>
              <Avatar asChild className="w-16 h-16">
                <Link href={`/users/${data?.user.userName}`}>
                  <AvatarImage
                    src={
                      data.user.profilePicture
                        ? baseFileUrl +
                          data.user.profilePicture.lowQualityFileName
                        : ""
                    }
                    alt={`@${data.user.userName}`}
                  />
                  <AvatarFallback>
                    {getNameInitials(data?.user.displayName!)}
                  </AvatarFallback>
                </Link>
              </Avatar>

              {data.user.id !== loggedInUserData?.user.id && (
                <UserRowItemFollowButton
                  user={data.user}
                  onFollowSuccess={handleFollowSuccess}
                  onUnfollowSuccess={handleUnfollowSuccess}
                />
              )}

              {/* {data.user.followedByLoggedInUser === true ? (
                <Button variant="outline" onClick={unfollowUser}>
                  Following
                </Button>
              ) : data.user.followedByLoggedInUser === false ? (
                <Button onClick={followUser}>Follow</Button>
              ) : null} */}
            </>
          ) : null}
        </div>
        <div className="mt-4">
          {isLoading ? (
            <div></div>
          ) : isSuccess ? (
            <div className="">
              <div className="font-semibold leading-none">
                {data.user.displayName}
              </div>
              <div className="mt-1 text-gray-500 leading-none">
                <span className="text-sm">@</span>
                {data.user.userName}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div></div>
          ) : isSuccess ? (
            <div className="">{data.user.bio}</div>
          ) : null}
        </div>

        <div className="mt-2 flex gap-x-5">
          {isLoading ? (
            <div></div>
          ) : isSuccess ? (
            <>
              <AccountStatItem label="Posts" value={data.user.postsCount} />
              <AccountStatItem
                label="Abonnés"
                value={data.user.followersCount}
                onClick={openUserFollowersModal}
              />
              <AccountStatItem
                label="Abonements"
                value={data.user.followingCount}
                onClick={openUserFollowingModal}
              />
            </>
          ) : null}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserProfileHoverCard;
