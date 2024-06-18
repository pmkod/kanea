import { useNetwork } from "@mantine/hooks";
import { useListenWebsocketEvents } from "./use-listen-websocket-events";
import { useId, useState } from "react";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { useToast } from "@/components/core/use-toast";
import { PostComment } from "@/types/post-comment";
import { useQueryClient } from "@tanstack/react-query";
import {
  followingTimelineQueryKey,
  postCommentRepliesQueryKey,
  postCommentsQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";
import { Post } from "@/types/post";
import { usePathname } from "next/navigation";
import { nanoid } from "nanoid";

//
//
//
//
//
//
//

export const useDeletePostComment = ({
  postComment,
}: {
  postComment: PostComment;
}) => {
  const network = useNetwork();
  const webSocket = useAtomValue(webSocketAtom);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { toast } = useToast();
  const uid = nanoid();

  const [uidOfPostCommentBeingDeleted, setUidOfPostCommentBeingDeleted] =
    useState<string | undefined>(undefined);

  const deletePostComment = () => {
    if (!network.online) {
      return;
    }
    setUidOfPostCommentBeingDeleted(uid);
    webSocket?.emit("delete-post-comment", {
      postCommentId: postComment.id,
    });
  };

  const onPostCommentDeleteSuccess = (eventData: {
    postComment: PostComment;
  }) => {
    if (
      eventData.postComment.id !== postComment.id &&
      uidOfPostCommentBeingDeleted !== uid
    ) {
      return;
    }
    if (postComment.mostDistantParentPostCommentId !== undefined) {
      queryClient.setQueryData(
        [
          postCommentsQueryKey,
          postComment.mostDistantParentPostCommentId,
          postCommentRepliesQueryKey,
        ],
        (qData: any) => {
          return {
            ...qData,
            pages: qData.pages.map((pageData: any) => ({
              ...pageData,
              postComments: pageData.postComments.filter(
                (poCom: PostComment) => poCom.id !== postComment.id
              ),
            })),
          };
        }
      );

      if (pathname === "/home") {
        queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
          return {
            ...qData,
            pages: qData.pages.map((pageData: any, pageIndex: number) => ({
              ...pageData,
              posts: pageData.posts.map((postData: any, index: number) => ({
                ...postData,
                someComments:
                  postComment.postId === postData.id
                    ? postData.someComments.map((comment: PostComment) => ({
                        ...comment,
                        descendantPostCommentsCount:
                          comment.id ===
                          postComment.mostDistantParentPostCommentId
                            ? comment.descendantPostCommentsCount > 0
                              ? comment.descendantPostCommentsCount - 1
                              : 0
                            : comment.descendantPostCommentsCount,
                      }))
                    : postData.someComments,
              })),
            })),
          };
        });
      } else if (pathname === "/posts/" + postComment.postId) {
        queryClient.setQueryData(
          [postsQueryKey, postComment.postId, postCommentsQueryKey],
          (qData: any) => ({
            ...qData,
            pages: qData.pages.map((pageData: any, pageIndex: number) => ({
              ...pageData,
              postComments: pageData.postComments.map(
                (postCommentData: any, index: number) => ({
                  ...postCommentData,
                  descendantPostCommentsCount:
                    postCommentData.id ===
                    postComment.mostDistantParentPostCommentId
                      ? postCommentData.descendantPostCommentsCount > 0
                        ? postCommentData.descendantPostCommentsCount - 1
                        : 0
                      : postCommentData.descendantPostCommentsCount,
                })
              ),
            })),
          })
        );
      }
    } else {
      if (pathname === "/home") {
        queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => ({
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            posts: pageData.posts.map((postInData: Post) => ({
              ...postInData,
              someComments: postInData.someComments.filter(
                (pCom) => pCom.id !== postComment.id
              ),
            })),
          })),
        }));

        queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => ({
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            posts: pageData.posts.map((postInData: Post) => ({
              ...postInData,
              commentsCount:
                postInData.id === postComment.postId
                  ? postInData.commentsCount > 0
                    ? postInData.commentsCount - 1
                    : 0
                  : postInData.commentsCount,
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
              someComments: qData.post.someComments.filter(
                (comment) => comment.id !== postComment.id
              ),
            },
          })
        );
        queryClient.setQueryData(
          [postsQueryKey, postComment.postId],
          (qData: any) => {
            return {
              ...qData,
              post: {
                ...qData.post,
                commentsCount:
                  qData.post.commentsCount > 0
                    ? qData.post.commentsCount - 1
                    : 0,
              },
            };
          }
        );
      }

      queryClient.setQueryData(
        [postsQueryKey, postComment.postId, postCommentsQueryKey],
        (qData: any) => {
          return {
            ...qData,
            pages: qData.pages.map((pageData: any, pageIndex: number) => ({
              ...pageData,
              postComments: pageData.postComments.filter(
                (postCommentData: PostComment) =>
                  postCommentData.id !== postComment.id
              ),
            })),
          };
        }
      );
    }
    setUidOfPostCommentBeingDeleted(undefined);
  };

  const onPostCommentDeleteError = () => {
    setUidOfPostCommentBeingDeleted(undefined);
    toast({ description: "Error", colorScheme: "destructive" });
  };
  useListenWebsocketEvents([
    {
      name: "post-comment-delete-success",
      handler: onPostCommentDeleteSuccess,
    },
    { name: "post-comment-delete-error", handler: onPostCommentDeleteError },
  ]);

  return {
    deletePostComment,
    isDeleting: uidOfPostCommentBeingDeleted !== undefined,
  };
};
