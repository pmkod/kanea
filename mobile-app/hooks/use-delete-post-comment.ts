import { useListenWebsocketEvents } from "./use-listen-websocket-events";
import { useState } from "react";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { PostComment } from "@/types/post-comment";
import { useQueryClient } from "@tanstack/react-query";
import {
  followingTimelineQueryKey,
  postCommentRepliesQueryKey,
  postCommentsQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";
import { Post } from "@/types/post";
import "react-native-get-random-values";
import { nanoid } from "nanoid";
import { currentlyOpenPostIdAtom } from "@/atoms/currently-open-post-id-atom";
import { useNavigationState } from "@react-navigation/native";
import {
  homeScreenName,
  postCommentsBottomSheetScreenName,
  postScreenName,
} from "@/constants/screens-names-constants";
import Toast from "react-native-toast-message";
import { useNetInfo } from "@react-native-community/netinfo";

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
  const network = useNetInfo();
  const webSocket = useAtomValue(webSocketAtom);
  const queryClient = useQueryClient();
  const currentlyOpenPostId = useAtomValue(currentlyOpenPostIdAtom);

  // const pathname = usePathname();
  const screenName = useNavigationState(
    (state) => state.routes[state.index].name
  );
  const uid = nanoid();

  const [uidOfPostCommentBeingDeleted, setUidOfPostCommentBeingDeleted] =
    useState<string | undefined>(undefined);

  const deletePostComment = () => {
    if (!network.isConnected) {
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

      if (screenName === homeScreenName) {
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
      } else if (
        [postScreenName, postCommentsBottomSheetScreenName].includes(
          screenName
        ) &&
        currentlyOpenPostId === postComment.postId
      ) {
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
      if (screenName === homeScreenName) {
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
      } else if (
        [postScreenName, postCommentsBottomSheetScreenName].includes(
          screenName
        ) &&
        currentlyOpenPostId === postComment.postId
      ) {
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
    Toast.show({ type: "info", text1: "Comment deleted" });
  };

  const onPostCommentDeleteError = () => {
    setUidOfPostCommentBeingDeleted(undefined);
    Toast.show({ type: "error", text1: "Error" });
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
