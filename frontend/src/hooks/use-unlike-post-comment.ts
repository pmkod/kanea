import { useNetwork } from "@mantine/hooks";
import { useListenWebsocketEvents } from "./use-listen-websocket-events";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { PostComment } from "@/types/post-comment";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Post } from "@/types/post";
import {
  followingTimelineQueryKey,
  postCommentRepliesQueryKey,
  postCommentsQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";

export const useUnlikePostComment = ({
  postComment,
}: {
  postComment: PostComment;
}) => {
  const network = useNetwork();
  const webSocket = useAtomValue(webSocketAtom);
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const onUnlikePostComment = () => {
    if (pathname === "/home") {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => ({
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          posts: pageData.posts.map((post: Post) => ({
            ...post,
            someComments: post.someComments.map((comment) => ({
              ...comment,
              likedByLoggedInUser:
                comment.id === postComment.id
                  ? false
                  : comment.likedByLoggedInUser,
              likesCount:
                comment.id === postComment.id
                  ? comment.likesCount > 0
                    ? comment.likesCount - 1
                    : 0
                  : comment.likesCount,
            })),
          })),
        })),
      }));
    } else if (pathname === "/posts/" + postComment.postId) {
      queryClient.setQueryData(
        [postsQueryKey, postComment.postId],
        (qData: { post: Post }) => ({
          ...qData,
          post: {
            ...qData.post,
            someComments: qData.post.someComments.map((comment) => ({
              ...comment,
              likedByLoggedInUser:
                comment.id === postComment.id
                  ? false
                  : comment.likedByLoggedInUser,
              likesCount:
                comment.id === postComment.id
                  ? comment.likesCount > 0
                    ? comment.likesCount - 1
                    : 0
                  : comment.likesCount,
            })),
          },
        })
      );
    }

    if (postComment.mostDistantParentPostCommentId !== undefined) {
      const queryData = queryClient.getQueryData([
        postCommentsQueryKey,
        postComment.mostDistantParentPostCommentId,
        postCommentRepliesQueryKey,
      ]);
      if (queryData !== undefined) {
        queryClient.setQueryData(
          [
            postCommentsQueryKey,
            postComment.mostDistantParentPostCommentId,
            postCommentRepliesQueryKey,
          ],
          (qData: any) => {
            return {
              ...qData,
              pages: qData.pages.map((page: any) => ({
                ...page,
                postComments: page.postComments.map(
                  (postCommentInData: PostComment) => ({
                    ...postCommentInData,
                    likedByLoggedInUser:
                      postCommentInData.id === postComment.id
                        ? false
                        : postCommentInData.likedByLoggedInUser,

                    likesCount:
                      postCommentInData.id === postComment.id
                        ? postCommentInData.likesCount > 0
                          ? postCommentInData.likesCount - 1
                          : 0
                        : postCommentInData.likesCount,
                  })
                ),
              })),
            };
          }
        );
      }
    } else {
      const queryData = queryClient.getQueryData([
        postsQueryKey,
        postComment.postId,
        postCommentsQueryKey,
      ]);
      if (queryData !== undefined) {
        queryClient.setQueryData(
          [postsQueryKey, postComment.postId, postCommentsQueryKey],
          (qData: any) => {
            return {
              ...qData,
              pages: qData.pages.map((page: any) => ({
                ...page,
                postComments: page.postComments.map(
                  (postCommentInData: PostComment) => ({
                    ...postCommentInData,
                    likedByLoggedInUser:
                      postCommentInData.id === postComment.id
                        ? false
                        : postCommentInData.likedByLoggedInUser,

                    likesCount:
                      postCommentInData.id === postComment.id
                        ? postCommentInData.likesCount > 0
                          ? postCommentInData.likesCount - 1
                          : 0
                        : postCommentInData.likesCount,
                  })
                ),
              })),
            };
          }
        );
      }
    }
  };
  const unlikePostComment = () => {
    if (!network.online) {
      return;
    }
    webSocket?.emit("unlike-post-comment", {
      postCommentId: postComment.id,
    });
    onUnlikePostComment();
  };

  const onUnlikePostCommentError = ({
    postCommentId,
  }: {
    postCommentId: string;
  }) => {
    if (pathname === "/home") {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => ({
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          posts: pageData.posts.map((post: Post) => ({
            ...post,
            someComments: post.someComments.map((comment) => ({
              ...comment,
              likedByLoggedInUser:
                comment.id === postComment.id
                  ? true
                  : comment.likedByLoggedInUser,
              likesCount:
                comment.id === postComment.id
                  ? comment.likesCount + 1
                  : comment.likesCount,
            })),
          })),
        })),
      }));
    } else if (pathname === "/posts/" + postComment.postId) {
      queryClient.setQueryData(
        [postsQueryKey, postComment.postId],
        (qData: { post: Post }) => ({
          ...qData,
          post: {
            ...qData.post,
            someComments: qData.post.someComments.map((comment) => ({
              ...comment,
              likedByLoggedInUser:
                comment.id === postComment.id
                  ? true
                  : comment.likedByLoggedInUser,
              likesCount:
                comment.id === postComment.id
                  ? comment.likesCount + 1
                  : comment.likesCount,
            })),
          },
        })
      );
    }

    if (postComment.mostDistantParentPostCommentId !== undefined) {
      const queryData = queryClient.getQueryData([
        postCommentsQueryKey,
        postComment.mostDistantParentPostCommentId,
        postCommentRepliesQueryKey,
      ]);
      if (queryData !== undefined) {
        queryClient.setQueryData(
          [
            postCommentsQueryKey,
            postComment.mostDistantParentPostCommentId,
            postCommentRepliesQueryKey,
          ],
          (qData: any) => ({
            ...qData,
            pages: qData.pages.map((page: any) => ({
              ...page,
              postComments: page.postComments.map(
                (postCommentInData: PostComment) => ({
                  ...postCommentInData,
                  likedByLoggedInUser:
                    postCommentInData.id === postComment.id
                      ? true
                      : postCommentInData.likedByLoggedInUser,
                  likesCount:
                    postCommentInData.id === postComment.id
                      ? postCommentInData.likesCount + 1
                      : postCommentInData.likesCount,
                })
              ),
            })),
          })
        );
      }
    } else {
      const queryData = queryClient.getQueryData([
        postsQueryKey,
        postComment.postId,
        postCommentsQueryKey,
      ]);
      if (queryData !== undefined) {
        queryClient.setQueryData(
          [postsQueryKey, postComment.postId, postCommentsQueryKey],
          (qData: any) => {
            return {
              ...qData,
              pages: qData.pages.map((page: any) => ({
                ...page,
                postComments: page.postComments.map(
                  (postCommentInData: PostComment) => ({
                    ...postCommentInData,
                    likedByLoggedInUser:
                      postCommentInData.id === postComment.id
                        ? true
                        : postCommentInData.likedByLoggedInUser,
                    likesCount:
                      postCommentInData.id === postComment.id
                        ? postCommentInData.likesCount + 1
                        : postCommentInData.likesCount,
                  })
                ),
              })),
            };
          }
        );
      }
    }
  };

  useListenWebsocketEvents([
    {
      name: "unlike-post-comment-error",
      handler: onUnlikePostCommentError,
    },
  ]);

  return {
    unlikePostComment,
  };
};
