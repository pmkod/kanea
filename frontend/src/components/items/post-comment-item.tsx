"use client";
import { baseFileUrl } from "@/configs";
import {
  postCommentRepliesQueryKey,
  postCommentsQueryKey,
} from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { getCommentRepliesRequest } from "@/services/comment-replie-service";
import { PostComment } from "@/types/post-comment";
import { durationFromNow } from "@/utils/datetime-utils";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal from "@ebay/nice-modal-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom, useSetAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiDotsThreeOutlineLight, PiFlag, PiTrash } from "react-icons/pi";
import { RiHeart3Fill, RiHeart3Line } from "react-icons/ri";
import { useInView } from "react-intersection-observer";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../core/dropdown-menu";
import { Skeleton } from "../core/skeleton";
import UserProfileHoverCard from "../hover-card/user-profile-hover-card";
import ReportModal from "../modals/report-modal";
import { wrapAllUrlInTextWithATag } from "@/utils/url-utils";
import { formatStatNumber } from "@/utils/number-utils";
import { useDeletePostComment } from "@/hooks/use-delete-post-comment";
import { useLikePostComment } from "@/hooks/use-like-post-comment";
import { useUnlikePostComment } from "@/hooks/use-unlike-post-comment";
import { postCommentToReplyToAtom } from "@/atoms/post-comment-to-reply-to-atom";
import Linkify from "linkify-react";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

export const PostCommentItem = ({
  postComment,
  level = 1,
}: {
  postComment: PostComment;
  level?: number;
  mostDistantParentPostComment?: PostComment;
}) => {
  const [isRepliesVisible, setIsRepliesVisible] = useState(true);
  const [canLoadReplies, setCanLoadReplies] = useState(false);
  const { likePostComment } = useLikePostComment({ postComment });
  const { unlikePostComment } = useUnlikePostComment({ postComment });
  const { deletePostComment, isDeleting } = useDeletePostComment({
    postComment,
  });

  const setPostCommentToReplyTo = useSetAtom(postCommentToReplyToAtom);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
  });

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const [
    loadedDescendantPostCommentsCount,
    setLoadedDescendantPostCommentsCount,
  ] = useState(0);

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const {
    data,
    isSuccess,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [
      postCommentsQueryKey,
      postComment.id,
      postCommentRepliesQueryKey,
    ],
    initialPageParam: 1,
    initialData: {
      pageParams: [],
      pages: [],
    },
    queryFn: ({ pageParam }) =>
      getCommentRepliesRequest(postComment.id, {
        page: pageParam,
        firstPageRequestedAt: firstPageRequestedAt!,
        limit: 5,
      }),
    getNextPageParam: (lastPage, _) =>
      lastPage !== undefined ? lastPage.nextPage : undefined,
    enabled:
      canLoadReplies && level === 1 && firstPageRequestedAt !== undefined,
  });

  const loadReplies = () => {
    if (!isRepliesVisible) {
      setIsRepliesVisible(true);
    }
    if (!canLoadReplies) {
      setCanLoadReplies(true);
    }
    if (!isFetchingNextPage && hasNextPage && level === 1) {
      fetchNextPage();
    }
  };

  const openReportPostCommentModal = () => {
    NiceModal.show(ReportModal, { postComment });
  };

  const hideReplies = () => {
    setIsRepliesVisible(false);
  };

  const selectPostCommentToReplyTo = () => {
    setPostCommentToReplyTo(postComment);
  };

  useEffect(() => {
    if (isSuccess) {
      setLoadedDescendantPostCommentsCount(
        data?.pages.reduce((acc, page) => page.postComments.length + acc, 0)
      );
    }
  }, [isSuccess, data, isRepliesVisible]);

  useEffect(() => {
    if (!isRepliesVisible) {
      setIsRepliesVisible(true);
    }
  }, [data]);

  return (
    <div
      ref={ref}
      className={`flex mb-3 ${isDeleting && "opacity-50 pointer-events-none"} ${
        level === 2 ? "mt-3" : ""
      }`}
    >
      <UserProfileHoverCard user={postComment.commenter}>
        <Avatar className="w-9 h-9 mr-3" asChild>
          <Link href={`/users/${postComment.commenter.userName}`}>
            <AvatarImage
              src={
                inView
                  ? postComment.commenter.profilePicture !== undefined
                    ? baseFileUrl +
                      postComment.commenter.profilePicture.lowQualityFileName
                    : ""
                  : ""
              }
              alt=""
            />
            <AvatarFallback>
              {getNameInitials(postComment.commenter.displayName)}
            </AvatarFallback>
          </Link>
        </Avatar>
      </UserProfileHoverCard>

      <div className="flex-1 overflow-x-hidden">
        <div className="flex items-center">
          <Link
            href={`/users/${postComment.commenter.userName}`}
            className="text-sm text-gray-500 mr-1  truncate"
          >
            {postComment.commenter.displayName}
          </Link>
          <Link
            href={`/users/${postComment.commenter.userName}`}
            className="text-sm text-gray-500  truncate"
          >
            <span className="text-xs">@</span>
            {postComment.commenter.userName}
          </Link>
          <div className="mx-2 text-gray-600">·</div>
          <div className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">
            {durationFromNow(postComment.createdAt)}
          </div>
        </div>

        <p className="text-sm break-words">
          {level === 2 && (
            <>
              <Link
                href={`/users/${postComment.parentPostComment?.commenter.userName}`}
                className="text-blue-500"
              >
                @{postComment.parentPostComment?.commenter.userName}
              </Link>
              &nbsp;
            </>
          )}
          <span className="text-gray-900 max-w-full">
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
              {postComment.text}
            </Linkify>
          </span>
        </p>

        <div className="mt-1 flex items-center gap-x-4">
          <div className="flex items-center gap-x-2 mt-1">
            {postComment.likedByLoggedInUser ? (
              <button className="text-red-600" onClick={unlikePostComment}>
                <RiHeart3Fill />
              </button>
            ) : (
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={likePostComment}
              >
                <RiHeart3Line />
              </button>
            )}
            <div
              className={`text-xs text-gray-400 ${
                postComment.likesCount === 0 && "invisible"
              }`}
            >
              {formatStatNumber(postComment.likesCount)}
            </div>
          </div>
          <button
            onClick={selectPostCommentToReplyTo}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Reply
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <PiDotsThreeOutlineLight />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={openReportPostCommentModal}>
                <PiFlag />
                <span className="ml-2">Report</span>
              </DropdownMenuItem>
              {postComment.commenterId === loggedInUserData?.user.id && (
                <DropdownMenuItem onClick={deletePostComment}>
                  <PiTrash />
                  <span className="ml-2">Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          {isRepliesVisible &&
            data?.pages.map((page) =>
              page.postComments.map((postCommentReply) => (
                <PostCommentItem
                  key={postCommentReply.id}
                  postComment={postCommentReply}
                  level={2}
                  mostDistantParentPostComment={postComment}
                />
              ))
            )}
        </div>
        {level === 1 && postComment.descendantPostCommentsCount > 0 && (
          <div className="mt-1 font-medium text-gray-400 text-sm cursor-pointer w-max">
            {postComment.descendantPostCommentsCount -
              loadedDescendantPostCommentsCount >
              0 || !isRepliesVisible ? (
              <div onClick={loadReplies}>
                {isLoading || isFetchingNextPage
                  ? "Loading ..."
                  : `show ${
                      loadedDescendantPostCommentsCount > 0 && isRepliesVisible
                        ? "more "
                        : ""
                    }replies ` +
                    "(" +
                    formatStatNumber(
                      isRepliesVisible
                        ? postComment.descendantPostCommentsCount -
                            loadedDescendantPostCommentsCount!
                        : postComment.descendantPostCommentsCount
                    ) +
                    ")"}
              </div>
            ) : (
              <div onClick={hideReplies}>Hide replies</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const PostCommentItemLoader = () => {
  return (
    <div className="flex mb-4">
      <Skeleton className="w-9 h-9 rounded-full mr-3" />
      <div className="flex-1">
        <Skeleton className="h-2 mb-2.5 rounded-full w-1/3" />
        <Skeleton className="h-2 rounded-full w-1/2" />
      </div>
    </div>
  );
};
