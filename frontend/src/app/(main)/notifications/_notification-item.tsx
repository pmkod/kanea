"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import { Skeleton } from "@/components/core/skeleton";
import { baseFileUrl } from "@/configs";
import { loggedInUserQueryKey } from "@/constants/query-keys";
import { Notification } from "@/types/notification";
import { User } from "@/types/user";
import { durationFromNow } from "@/utils/datetime-utils";
import { getNameInitials } from "@/utils/user-utils";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { AiFillHeart } from "react-icons/ai";
import { PiUserPlusFill } from "react-icons/pi";
import { RiChat1Fill } from "react-icons/ri";

type NotificationProps = {
  notification: Notification;
};

const NotificationItem = ({ notification }: NotificationProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const loggedInUser = queryClient.getQueryData<{ user: User }>([
    loggedInUserQueryKey,
  ])?.user;

  const handleClick = () => {
    if (notification.followId) {
      router.push(`/users/${notification.initiator.userName}`);
    } else if (notification.postLikeId) {
      router.push(`/posts/${notification.postLike?.postId}`);
    } else if (notification.parentPostCommentId) {
      router.push(`/posts/${notification.postComment?.postId}`);
    } else if (notification.postCommentId) {
      router.push(`/posts/${notification.postComment?.postId}`);
    } else if (notification.postCommentLikeId) {
      // router.push(`/posts/${notification}`)
    }
  };

  const stopPropagation: React.MouseEventHandler = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center px-4 py-2.5 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <div>
        {notification.initiator !== undefined && (
          <Avatar className="w-11 h-11" asChild>
            <Link
              href={`/users/${notification.initiator.userName}`}
              onClick={stopPropagation}
            >
              <AvatarImage
                src={
                  notification.initiator.profilePicture
                    ? baseFileUrl +
                      notification.initiator.profilePicture.lowQualityFileName
                    : ""
                }
              />
              <AvatarFallback>
                {getNameInitials(notification.initiator.displayName)}
              </AvatarFallback>
            </Link>
          </Avatar>
        )}
      </div>
      <div className="flex-1 pl-4 text-sm text-gray-700">
        {notification.followId ? (
          <div>
            <div>
              <Link
                href={`/users/${notification.initiator?.userName}`}
                className="text-gray-900 font-semibold"
                onClick={stopPropagation}
              >
                {notification.initiator?.displayName}
              </Link>
              &nbsp; started following you
            </div>
            <div className="text-xs text-gray-500">
              {durationFromNow(notification.createdAt)}
            </div>
          </div>
        ) : notification.postLikeId ? (
          <div>
            <div>
              <Link
                href={`/users/${notification.initiator?.userName}`}
                className="text-gray-900 font-semibold"
                onClick={stopPropagation}
              >
                {notification.initiator?.displayName}
              </Link>
              &nbsp; liked your post
            </div>
            <div className="text-xs text-gray-500">
              {durationFromNow(notification.createdAt)}
            </div>
          </div>
        ) : notification.parentPostCommentId &&
          notification.parentPostComment?.commenterId !== loggedInUser?.id ? (
          <div>
            <div>
              <Link
                href={`/users/${notification.initiator?.userName}`}
                className="text-gray-900 font-semibold"
                onClick={stopPropagation}
              >
                {notification.initiator?.displayName}
              </Link>
              &nbsp; replied to a comment on your post
            </div>
            <div className="text-xs text-gray-500">
              {durationFromNow(notification.createdAt)}
            </div>
          </div>
        ) : notification.parentPostCommentId &&
          notification.parentPostComment?.commenterId === loggedInUser?.id ? (
          <div>
            <div>
              <Link
                href={`/users/${notification.initiator?.userName}`}
                className="text-gray-900 font-semibold"
                onClick={stopPropagation}
              >
                {notification.initiator?.displayName}
              </Link>
              &nbsp; replied to your comment
            </div>
            <div className="text-xs text-gray-500">
              {durationFromNow(notification.createdAt)}
            </div>
          </div>
        ) : notification.postCommentId ? (
          <div>
            <div>
              <Link
                href={`/users/${notification.initiator?.userName}`}
                className="text-gray-900 font-semibold"
                onClick={stopPropagation}
              >
                {notification.initiator?.displayName}
              </Link>
              &nbsp; commented your post
            </div>
            <div className="text-xs text-gray-500">
              {durationFromNow(notification.createdAt)}
            </div>
          </div>
        ) : notification.postCommentLikeId ? (
          <div>
            <div>
              <Link
                href={`/users/${notification.initiator?.userName}`}
                className="text-gray-900 font-semibold"
                onClick={stopPropagation}
              >
                {notification.initiator?.displayName}
              </Link>
              &nbsp; liked your comment
            </div>
            <div className="mb-1">{notification.postComment?.text}</div>
            <div className="text-xs text-gray-500">
              {durationFromNow(notification.createdAt)}
            </div>
          </div>
        ) : null}
      </div>
      <div className="ml-2 flex justify-end text-xl">
        {notification.followId ? (
          <div className="text-blue-600">
            <PiUserPlusFill />
          </div>
        ) : notification.postLikeId || notification.postCommentLikeId ? (
          <AiFillHeart className="text-red-500" />
        ) : notification.postCommentId ? (
          <div className="text-blue-600">
            <RiChat1Fill />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default NotificationItem;

export const NotificationItemLoader = () => {
  return (
    <div className="flex items-center rounded-md px-4 py-2.5 gap-x-4">
      <Skeleton className="w-11 h-11 rounded-full" />

      <div className="flex-1">
        <Skeleton className="w-2/3 h-2.5 mb-3 rounded-full" />
        <Skeleton className="w-1/4 h-2.5 rounded-full" />
      </div>
    </div>
  );
};
