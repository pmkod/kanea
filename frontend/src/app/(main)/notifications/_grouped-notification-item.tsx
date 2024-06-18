import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import { baseFileUrl } from "@/configs";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Notification } from "@/types/notification";
import { getNameInitials } from "@/utils/user-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { AiFillHeart } from "react-icons/ai";
import { PiUserPlusFill } from "react-icons/pi";
import { RiChat1Fill } from "react-icons/ri";

interface GroupedNotificationItemProps {
  elements: Notification[];
}

const GroupedNotificationItem = ({
  elements,
}: GroupedNotificationItemProps) => {
  const firstNotificationInGroup = elements[0];
  const { data } = useLoggedInUser({ enabled: false });
  const router = useRouter();

  const handleClick = () => {
    if (firstNotificationInGroup.followId) {
      router.push(`/users/${firstNotificationInGroup.initiator.userName}`);
    } else if (firstNotificationInGroup.postLikeId) {
      router.push(`/posts/${firstNotificationInGroup.postLike?.postId}`);
    } else if (firstNotificationInGroup.parentPostCommentId) {
      router.push(`/posts/${firstNotificationInGroup.postComment?.postId}`);
    } else if (firstNotificationInGroup.postCommentId) {
      router.push(`/posts/${firstNotificationInGroup.postComment?.postId}`);
    } else if (firstNotificationInGroup.postCommentLikeId) {
      // router.push(`/posts/${firstNotificationInGroup.postCommentLike.}`)
    }
  };

  const stopPropagation: React.MouseEventHandler = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center px-5 py-3 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
    >
      <div className="flex-1">
        <div className="flex mb-3">
          <Avatar className="w-8 h-8 z-30" asChild>
            <Link
              href={`/users/${firstNotificationInGroup.initiator.userName}`}
              onClick={stopPropagation}
            >
              <AvatarImage
                src={
                  firstNotificationInGroup.initiator.profilePicture
                    ? baseFileUrl +
                      firstNotificationInGroup.initiator.profilePicture
                        .lowQualityFileName
                    : ""
                }
              />
              <AvatarFallback>
                {getNameInitials(
                  firstNotificationInGroup.initiator.displayName
                )}
              </AvatarFallback>
            </Link>
          </Avatar>

          <div className="flex z-20 transform -translate-x-3 justify-end pr-0.5 items-center w-8 h-8 rounded-full bg-gray-700 text-xs font-semibold text-white">
            +{elements.length - 1 > 999 ? "999" : elements.length - 1}
          </div>
        </div>
        <div className="text-sm">
          <Link
            href={`/users/${firstNotificationInGroup.initiator.userName}`}
            onClick={stopPropagation}
          >
            {firstNotificationInGroup.initiator.displayName}
          </Link>
          <span className="text-gray-700">
            &nbsp;and {elements.length - 1} others&nbsp;
            {firstNotificationInGroup.followId ? (
              "started following you"
            ) : firstNotificationInGroup.postLikeId ? (
              "liked your post"
            ) : firstNotificationInGroup.parentPostCommentId &&
              firstNotificationInGroup.parentPostComment?.commenterId !==
                data?.user.id ? (
              "replied to a comment on your post"
            ) : firstNotificationInGroup.parentPostCommentId &&
              firstNotificationInGroup.parentPostComment?.commenterId ===
                data?.user.id ? (
              "replied to your comment"
            ) : firstNotificationInGroup.postCommentId ? (
              "commented your post"
            ) : firstNotificationInGroup.postCommentLikeId ? (
              <>
                liked your comment
                <br />
                {firstNotificationInGroup.postComment?.text}
              </>
            ) : null}
          </span>
        </div>
      </div>

      <div className="ml-2  text-xl">
        {firstNotificationInGroup.followId ? (
          <div className="text-blue-600">
            <PiUserPlusFill />
          </div>
        ) : firstNotificationInGroup.postLikeId ||
          firstNotificationInGroup.postCommentLikeId ? (
          <AiFillHeart className="text-red-500" />
        ) : firstNotificationInGroup.postCommentId ? (
          <div className="text-blue-600">
            <RiChat1Fill />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GroupedNotificationItem;
