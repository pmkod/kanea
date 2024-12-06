"use client";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { baseFileUrl } from "@/configs";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import Linkify from "linkify-react";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Post } from "@/types/post";
import { durationFromNow } from "@/utils/datetime-utils";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal from "@ebay/nice-modal-react";
import {
  useDidUpdate,
  useElementSize,
  useMediaQuery,
  useNetwork,
} from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import {
  PiDotsThreeOutlineLight,
  PiFlag,
  PiLinkSimple,
  PiProhibit,
  PiTrash,
  PiUserMinus,
} from "react-icons/pi";
import { RiChat1Line, RiHeart3Fill, RiHeart3Line } from "react-icons/ri";
import { useInView } from "react-intersection-observer";

import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../core/dropdown-menu";
import { IconButton } from "../core/icon-button";
import { Sheet, SheetContent, SheetTrigger } from "../core/sheet";
import { Skeleton } from "../core/skeleton";
import UserProfileHoverCard from "../hover-card/user-profile-hover-card";
import { BlockUserModal } from "../modals/block-user-modal";
import PostLikesModal from "../modals/post-likes-modal";
import ReportModal from "../modals/report-modal";
import PostCommentsBlock from "../sheets/post-comments-block";
import { PostCommentItem } from "./post-comment-item";
import { wrapAllUrlInTextWithATag } from "@/utils/url-utils";
import { formatStatNumber } from "@/utils/number-utils";
import { useLikePost } from "@/hooks/use-like-post";
import { useUnLikePost } from "@/hooks/use-unlike-post";
import { DeletePostModal } from "../modals/delete-post-modal";
import { postCommentToReplyToAtom } from "@/atoms/post-comment-to-reply-to-atom";
import { PostCommentInput } from "../others/post-comment-input";
import { useToast } from "../core/use-toast";

interface PostItemProps {
  post: Post;
}

const PostItem = ({ post }: PostItemProps) => {
  const queryClient = useQueryClient();
  const { data: loggedInUserData } = useLoggedInUser({ enabled: false });
  const pathname = usePathname();
  const webSocket = useAtomValue(webSocketAtom);
  const { toast } = useToast();
  const postCommentToReplyTo = useAtomValue(postCommentToReplyToAtom);

  const [isCommentInputVisible, setIsCommentInputVisible] = useState(false);
  const [currentMedia, setCurrentMedia] = useState(0);
  const { ref: mediaWrapperRef, width } = useElementSize();
  const { likePost } = useLikePost({ postId: post.id });
  const { unlikePost } = useUnLikePost({ postId: post.id });
  const [isPostCommentBottomSheetVisible, setIsPostCommentBottomSheetVisible] =
    useState(false);

  const showCommentInput = () => {
    setIsCommentInputVisible(true);
  };
  const stopPostVideoPlayer = () => {
    let postVideoPlayer =
      document.querySelector<HTMLVideoElement>(".postVideoPlayer");
    postVideoPlayer?.pause();
  };

  const goToNextMedia = () => {
    setCurrentMedia((prevState) =>
      prevState < post.medias.length - 1 ? prevState + 1 : prevState
    );
    stopPostVideoPlayer();
  };

  const goToPreviousMedia = () => {
    setCurrentMedia((prevState) => (prevState > 0 ? prevState - 1 : 0));
    stopPostVideoPlayer();
  };

  const network = useNetwork();

  const openPostLikesModal = () => {
    NiceModal.show(PostLikesModal, { post });
  };

  const openDeletePostModal = () => {
    NiceModal.show(DeletePostModal, { post });
  };

  const mdMinMediaQuery = useMediaQuery("(min-width: 768px)");
  const xlMaxMediaQuery = useMediaQuery("(max-width: 1280px)");

  const isCommentVisibleInSheet = pathname === "/home" || xlMaxMediaQuery;

  const openReportPostModal = () => {
    NiceModal.show(ReportModal, { post });
  };

  const openBlockUserModal = () => {
    NiceModal.show(BlockUserModal, { user: post.publisher });
  };

  const unfollowUser = () => {
    if (!network.online) {
      return;
    }
    webSocket?.emit("unfollow", {
      followedId: post.publisherId,
    });
    if (pathname === "/home") {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            posts: pageData.posts.filter(
              (postInData: Post) => postInData.publisherId !== post.publisherId
            ),
          })),
        };
      });
      toast({ description: "Unfollow completed", colorScheme: "default" });
    }
  };

  const copyPostLink = async () => {
    try {
      let link = window.location.href;
      if (link.endsWith("home")) {
        link = link.replace("home", `posts/${post.id}`);
      }
      await navigator.clipboard.writeText(link);
    } catch (error) {}
  };

  useDidUpdate(() => {
    setIsCommentInputVisible(true);
  }, [postCommentToReplyTo]);

  return (
    <div className="border-b border-gray-300 pb-4">
      <div className="flex items-center px-4 sm:px-0 justify-between">
        <div className="flex">
          <UserProfileHoverCard user={post.publisher}>
            <Avatar className="mr-2.5 w-11 h-11" asChild>
              <Link href={`/users/${post.publisher.userName}`}>
                <AvatarImage
                  src={
                    post.publisher.profilePicture
                      ? baseFileUrl +
                        post.publisher.profilePicture.lowQualityFileName
                      : ""
                  }
                />
                <AvatarFallback>
                  {getNameInitials(post.publisher.displayName)}
                </AvatarFallback>
              </Link>
            </Avatar>
          </UserProfileHoverCard>

          <div className="">
            <div className="w-full flex items-center">
              <Link
                href={`/users/${post.publisher.userName}`}
                className="font-medium"
              >
                {post.publisher.displayName}
              </Link>
              <div className="mx-3">-</div>
              <div className="text-gray-500 text-sm">
                {durationFromNow(post.createdAt)}
              </div>
            </div>
            <Link
              href={`/users/${post.publisher.userName}`}
              className="block w-max text-gray-500 leading-none"
            >
              <span className="text-xs">@</span>
              <span className="text-sm">{post.publisher.userName}</span>
            </Link>
          </div>
        </div>

        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton variant="ghost" size="lg">
                <PiDotsThreeOutlineLight />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={copyPostLink}>
                <div className="text-lg">
                  <PiLinkSimple />
                </div>
                <span className="ml-2">Copy post link</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={unfollowUser}>
                <PiUserMinus />
                <span className="ml-2">Unfollow</span>
              </DropdownMenuItem>
              {post.publisher.id !== loggedInUserData?.user.id && (
                <DropdownMenuItem onClick={openBlockUserModal}>
                  <PiProhibit />
                  <span className="ml-2">Block user</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={openReportPostModal}>
                <PiFlag />
                <span className="ml-2">Report</span>
              </DropdownMenuItem>
              {post.publisher.id === loggedInUserData?.user.id && (
                <DropdownMenuItem onClick={openDeletePostModal}>
                  <PiTrash />
                  <span className="ml-2">Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="text-gray-700 mt-3 px-4 sm:px-0 break-words">
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
          {post.text}
        </Linkify>
      </div>

      <div ref={mediaWrapperRef} className="relative mt-2 overflow-hidden">
        {currentMedia > 0 && (
          <button
            onClick={goToPreviousMedia}
            className="absolute z-30 opacity-60 top-1/2 left-6 transform -translate-y-1/2 p-1 rounded-full bg-[#ffffff] text-[#1d2424] cursor-pointer text-lg"
          >
            <LuChevronLeft />
          </button>
        )}
        {
          <div
            className={`flex transition-transform`}
            style={{
              transform: `translateX(-${width * currentMedia}px)`,
            }}
          >
            {post.medias.map((media) => (
              <MediaItem key={media.bestQualityFileName} media={media} />
            ))}
          </div>
        }
        {currentMedia < post.medias.length - 1 && (
          <button
            onClick={goToNextMedia}
            className="absolute z-30 opacity-60 top-1/2 right-6 transform -translate-y-1/2 p-1 rounded-full bg-[#ffffff] text-[#1d2424] cursor-pointer text-lg"
          >
            <LuChevronRight />
          </button>
        )}
      </div>

      <div className="px-4 sm:px-0">
        <div className="relative flex gap-x-4 mt-3 text-2xl">
          {post.likedByLoggedInUser ? (
            <div onClick={unlikePost} className={`cursor-pointer text-red-600`}>
              <RiHeart3Fill />
            </div>
          ) : (
            <div
              onClick={likePost}
              className={`cursor-pointer text-gray-700 hover:text-red-600 transition-colors`}
            >
              <RiHeart3Line />
            </div>
          )}
          {(pathname !== `/posts/${post.id}` || xlMaxMediaQuery) && (
            <div
              onClick={showCommentInput}
              className={`cursor-pointer text-gray-700 hover:text-blue-600 transition-colors`}
            >
              <RiChat1Line />
            </div>
          )}
          {post.medias.length > 1 && (
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-x-1.5">
              {post.medias.map((media, index) => (
                <div
                  key={media.bestQualityFileName}
                  className={`bg-gray-800 ${
                    index === currentMedia ? "" : "opacity-30"
                  } w-1.5 aspect-square rounded-full`}
                ></div>
              ))}
            </div>
          )}
        </div>
        {post.likesCount > 0 && (
          <div
            onClick={openPostLikesModal}
            className={`w-max mt-1.5 cursor-pointer`}
          >
            {formatStatNumber(post.likesCount)} Like{post.likesCount > 1 && "s"}
          </div>
        )}

        {(pathname !== `/posts/${post.id}` || xlMaxMediaQuery) &&
          post.someComments.length > 0 && (
            <div className="mt-3">
              {post.someComments.map((comment) => (
                <PostCommentItem key={comment.id} postComment={comment} />
              ))}
            </div>
          )}

        <div>
          {isCommentVisibleInSheet && post.commentsCount > 0 && (
            <Sheet onOpenChange={setIsPostCommentBottomSheetVisible}>
              <SheetTrigger>
                <div className="mt-1 w-max cursor-pointer font-medium text-gray-500 hover:text-gray-600 transition-colors">
                  Show the&nbsp;
                  {post.commentsCount > 1
                    ? formatStatNumber(post.commentsCount) + " "
                    : ""}
                  comment
                  {post.commentsCount > 1 && "s"}
                </div>
              </SheetTrigger>
              <SheetContent
                side={mdMinMediaQuery ? "right" : "bottom"}
                className="pt-4"
              >
                <div className="h-full flex flex-col">
                  <PostCommentsBlock post={post} />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
        {isCommentVisibleInSheet &&
          isCommentInputVisible &&
          !isPostCommentBottomSheetVisible && (
            <div className="mt-2">
              <PostCommentInput
                post={post}
                context="post-item"
                autoFocus={true}
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default PostItem;

//
//
//
//
//
//
//
//
//

const MediaItem = ({ media }: { media: Post["medias"][0] }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: "1000px",
  });

  return acceptedImageMimetypes.includes(media.mimetype) ? (
    <img
      ref={ref}
      src={inView ? baseFileUrl + media.bestQualityFileName : ""}
      className="flex-1 aspect-[1/0.8] object-cover bg-gray-200"
      alt=""
    />
  ) : acceptedVideoMimetypes.includes(media.mimetype) ? (
    <video
      ref={ref}
      className="postVideoPlayer flex-1 aspect-[1/0.8] bg-black"
      controls
      disablePictureInPicture
      src={inView ? baseFileUrl + media.bestQualityFileName : ""}
    >
      {/* <source
        type={media.mimetype}
      /> */}
    </video>
  ) : null;
};

//
//
//
//
//
//
//
//

export const PostItemLoader = () => {
  return (
    <div className="w-full border-b border-gray-300 pb-4">
      <div className="flex px-4 sm:px-0">
        <Skeleton className="w-11 h-11 rounded-full mr-2.5" />

        <div className="">
          <Skeleton className="w-28 h-2.5 mt-2 mb-2.5 rounded-full" />
          <Skeleton className="w-14 h-2.5 rounded-full" />
        </div>
      </div>

      <div className="mt-4 px-4 sm:px-0 space-y-2">
        <Skeleton className="w-2/5 h-2.5" />
        <Skeleton className="w-3/5 h-2.5" />
      </div>

      <div className="mt-3">
        <Skeleton className="w-full rounded-none aspect-[1/0.8] object-cover" />
      </div>

      <div className="px-4 sm:px-0">
        <div className="flex gap-x-4 mt-3 text-2xl">
          <Skeleton className="w-6 aspect-square rounded-full" />
          <Skeleton className="w-6 aspect-square rounded-full" />
        </div>
      </div>
    </div>
  );
};
