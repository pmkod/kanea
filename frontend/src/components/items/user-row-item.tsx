"use client";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { baseFileUrl } from "@/configs";
import { loggedInUserQueryKey } from "@/constants/query-keys";
import { Follow } from "@/types/follow";
import { User } from "@/types/user";
import { getNameInitials } from "@/utils/user-utils";
import { useNetwork } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import Link from "next/link";
import React, { ReactNode, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import { Button } from "../core/button";
import { Skeleton } from "../core/skeleton";
import { useToast } from "../core/use-toast";
import UserProfileHoverCard from "../hover-card/user-profile-hover-card";

interface UserRowItemProps {
  children: ReactNode;
  onClick?: () => any;
  user: User;
}

const UserRowItem = ({ user, onClick, children }: UserRowItemProps) => {
  const childrens = React.Children.map(children, (child) => {
    if (
      React.isValidElement<
        UserRowItemAvatarProps | UserRowItemNameAndUserNameProps
      >(child)
    ) {
      return React.cloneElement(child, { user });
    }
  });
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-x-3 px-3 py-2.5 hover:bg-gray-100 transition-colors rounded cursor-pointer"
    >
      {childrens}
    </div>
  );
};

export default UserRowItem;

interface UserRowItemAvatarProps {
  user?: User;
  hasHoverCard?: boolean;
}

export const UserRowItemAvatar = ({
  user,
  hasHoverCard,
}: UserRowItemAvatarProps) => {
  return (
    <UserProfileHoverCard user={user!} hasHoverCard={hasHoverCard}>
      <Avatar asChild>
        <Link href={`/users/${user?.userName}`}>
          <AvatarImage
            src={
              user && user.profilePicture
                ? baseFileUrl + user.profilePicture.lowQualityFileName
                : ""
            }
            alt={`@${user?.userName}`}
          />
          <AvatarFallback>{getNameInitials(user?.displayName!)}</AvatarFallback>
        </Link>
      </Avatar>
    </UserProfileHoverCard>
  );
};

interface UserRowItemNameAndUserNameProps {
  user?: User;
}

export const UserRowItemNameAndUserName = ({
  user,
}: UserRowItemNameAndUserNameProps) => {
  return (
    <div className="text-sm flex-1 leading-none">
      <Link
        href={`/users/${user?.userName}`}
        className="block font-semibold mb-1"
      >
        {user?.displayName}
      </Link>
      <Link href={`/users/${user?.userName}`} className="block text-gray-600">
        <span className="text-xs">@</span>
        <span>{user?.userName}</span>
      </Link>
    </div>
  );
};

interface UserRowItemFollowButtonProps {
  user?: User;
  onFollowSuccess: (user: User) => void;
  onUnfollowSuccess: (user: User) => void;
  size?: "sm" | "default";
}

export const UserRowItemFollowButton = ({
  user,
  onFollowSuccess,
  onUnfollowSuccess,
  size = "default",
}: UserRowItemFollowButtonProps) => {
  const queryClient = useQueryClient();

  const network = useNetwork();
  const [isLoading, setIsLoading] = useState(false);

  const webSocket = useAtomValue(webSocketAtom);
  const { toast } = useToast();

  const followUser = () => {
    if (!network.online) {
      return;
    }
    setIsLoading(true);

    webSocket?.emit("follow", {
      followedId: user?.id,
    });
  };

  const unfollowUser = () => {
    if (!network.online) {
      return;
    }
    setIsLoading(true);
    webSocket?.emit("unfollow", {
      followedId: user?.id,
    });
  };

  const followSuccess = (eventData: { follow: Follow }) => {
    if (eventData.follow.followedId === user?.id) {
      setIsLoading(false);
      onFollowSuccess(user!);
    }
  };

  const followError = ({ message }: { message: string }) => {
    setIsLoading(false);
    toast({ colorScheme: "destructive", description: message });
  };

  //
  //
  //

  const unfollowSuccess = (eventData: { follow: Follow }) => {
    if (eventData.follow.followedId === user?.id) {
      setIsLoading(false);
      onUnfollowSuccess(user!);
    }
  };

  const unfollowError = ({ message }: { message: string }) => {
    setIsLoading(false);
    toast({ colorScheme: "destructive", description: message });
  };

  useEffect(() => {
    webSocket?.on("follow-success", followSuccess);
    webSocket?.on("follow-error", followError);

    webSocket?.on("unfollow-success", unfollowSuccess);
    webSocket?.on("unfollow-error", unfollowError);
    return () => {
      webSocket?.off("follow-success", followSuccess);
      webSocket?.off("follow-error", followError);

      webSocket?.off("unfollow-success", unfollowSuccess);
      webSocket?.off("unfollow-error", unfollowError);
    };
  }, [webSocket]);

  return user?.followedByLoggedInUser ? (
    <Button
      variant="outline"
      size={size}
      isLoading={isLoading}
      onClick={unfollowUser}
    >
      Following
    </Button>
  ) : (
    <Button
      variant="default"
      size={size}
      isLoading={isLoading}
      onClick={followUser}
    >
      Follow
    </Button>
  );
};

//
//
//
//
//
//

export const UserRowItemLoader = () => {
  return (
    <div className="flex gap-x-3 px-3 py-2.5">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 pt-px">
        <Skeleton className="w-28 h-2.5 rounded-lg mt-1.5 mb-2.5" />
        <Skeleton className="w-14 h-2.5 rounded-lg" />
      </div>
    </div>
  );
};
