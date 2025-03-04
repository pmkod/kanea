import { PostComment } from "@/types/post-comment";
import { useListenWebsocketEvents } from "./use-listen-websocket-events";
import { useState } from "react";
import { useNetwork } from "@mantine/hooks";
import { useAtom, useAtomValue } from "jotai";
import { Post } from "@/types/post";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { postCommentToReplyToAtom } from "@/atoms/post-comment-to-reply-to-atom";
import { useToast } from "@/components/core/use-toast";
import {
  followingTimelineQueryKey,
  postCommentRepliesQueryKey,
  postCommentsQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import {
  adjustTextareaHeight,
  PostCommentInputContext,
} from "@/components/others/post-comment-input";

//
//
//
//
//

export const useCommentPost = ({
  post,
  postCommentTextareaRef,
  context,
}: {
  post: Post;
  postCommentTextareaRef: React.RefObject<HTMLTextAreaElement>;
  context: PostCommentInputContext;
}) => {
  const network = useNetwork();
  const webSocket = useAtomValue(webSocketAtom);
  const pathname = usePathname();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPostCommentSending, setIsPostCommentSending] = useState(false);
  const [postCommentToReplyTo, setPostCommentToReplyTo] = useAtom(
    postCommentToReplyToAtom
  );
  const commentPost = ({ text }: { text: string }) => {
    if (!network.online) {
      return;
    }
    setIsPostCommentSending(true);

    const data: any = {
      text,
      postId: post.id,
    };
    if (postCommentToReplyTo !== undefined) {
      data.parentPostCommentId = postCommentToReplyTo.id;
      if (postCommentToReplyTo.parentPostComment === undefined) {
        data.mostDistantParentPostCommentId = postCommentToReplyTo.id;
      } else {
        data.mostDistantParentPostCommentId =
          postCommentToReplyTo.mostDistantParentPostCommentId;
      }
    }
    webSocket?.emit("comment-post", data);
  };

  //
  //
  //
  //
  //

  const onCommentPostSuccess = (eventData: { postComment: PostComment }) => {
    if (postCommentToReplyTo !== undefined) {
      setPostCommentToReplyTo(undefined);
    }
    if (eventData.postComment.mostDistantParentPostCommentId !== undefined) {
      queryClient.setQueryData(
        [
          postCommentsQueryKey,
          eventData.postComment.mostDistantParentPostCommentId,
          postCommentRepliesQueryKey,
        ],
        (qData: any) => ({
          ...qData,
          pages: [
            ...qData.pages,
            { postComments: [eventData.postComment], page: 0 },
          ],
        })
      );

      if (context === "post-item") {
        if (pathname === "/home") {
          queryClient.setQueryData(
            [followingTimelineQueryKey],
            (qData: any) => {
              return {
                ...qData,
                pages: qData.pages.map((pageData: any) => ({
                  ...pageData,
                  posts: pageData.posts.map((postInData: Post) => ({
                    ...postInData,
                    someComments: postInData.someComments.map((comment) => ({
                      ...comment,
                      descendantPostCommentsCount:
                        comment.id ===
                        eventData.postComment.mostDistantParentPostCommentId
                          ? comment.descendantPostCommentsCount + 1
                          : comment.descendantPostCommentsCount,
                    })),
                  })),
                })),
              };
            }
          );
        } else if (pathname === "/posts/" + post.id) {
          queryClient.setQueryData([postsQueryKey, post.id], (qData: any) => ({
            ...qData,
            post: {
              ...qData.post,
              someComments: qData.post.someComments.map(
                (comment: PostComment) => ({
                  ...comment,
                  descendantPostCommentsCount:
                    comment.id ===
                    eventData.postComment.mostDistantParentPostCommentId
                      ? comment.descendantPostCommentsCount + 1
                      : comment.descendantPostCommentsCount,
                })
              ),
            },
          }));
        }
      } else if (context === "post-block") {
        queryClient.setQueryData(
          [postsQueryKey, post.id, postCommentsQueryKey],
          (qData: any) => ({
            ...qData,
            pages: qData.pages.map((pageData: any, pageIndex: number) => ({
              ...pageData,
              postComments: pageData.postComments.map(
                (postCommentData: any, index: number) => ({
                  ...postCommentData,
                  descendantPostCommentsCount:
                    postCommentData.id ===
                    eventData.postComment.mostDistantParentPostCommentId
                      ? postCommentData.descendantPostCommentsCount + 1
                      : postCommentData.descendantPostCommentsCount,
                })
              ),
            })),
          })
        );
      }
    } else {
      if (
        context === "post-item"
        // ! Si c'est dans le post-item ici
      ) {
        if (pathname === "/home") {
          queryClient.setQueryData(
            [followingTimelineQueryKey],
            (qData: any) => {
              return {
                ...qData,
                pages: qData.pages.map((pageData: any) => ({
                  ...pageData,
                  posts: pageData.posts.map((postInData: Post) => ({
                    ...postInData,
                    someComments:
                      post.id === postInData.id
                        ? [eventData.postComment, ...postInData.someComments]
                        : postInData.someComments,
                  })),
                })),
              };
            }
          );
        } else if (pathname === "/posts/" + post.id) {
          queryClient.setQueryData([postsQueryKey, post.id], (qData: any) => {
            return {
              ...qData,

              post: {
                ...qData.post,

                someComments: [
                  eventData.postComment,
                  ...qData.post.someComments,
                ],
              },
            };
          });
        }
      } else if (
        context === "post-block"
        // ! Si c'est dans le block ici
      ) {
        queryClient.setQueryData(
          [postsQueryKey, post.id, postCommentsQueryKey],
          (qData: any) => ({
            ...qData,
            pages: qData.pages.map((pageData: any, pageIndex: number) => ({
              ...pageData,
              postComments:
                pageIndex === 0
                  ? [eventData.postComment, ...pageData.postComments]
                  : pageData.postComments,
            })),
          })
        );
      }
      //   scrollableRef.current.scrollTo({ top: 0 });
    }

    if (pathname === "/home") {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            posts: pageData.posts.map((postInData: Post) => ({
              ...postInData,
              commentsCount:
                postInData.id === post.id
                  ? postInData.commentsCount + 1
                  : postInData.commentsCount,
            })),
          })),
        };
      });
    } else if (pathname === "/posts/" + post.id) {
      queryClient.setQueryData([postsQueryKey, post.id], (qData: any) => {
        return {
          ...qData,
          post: {
            ...qData.post,
            commentsCount: qData.post.commentsCount + 1,
          },
        };
      });
    }
    adjustTextareaHeight(postCommentTextareaRef);
    postCommentTextareaRef.current!.value = "";
    setIsPostCommentSending(false);
  };

  const onCommentPostError = ({ message }: { message: string }) => {
    toast({ colorScheme: "destructive", description: message });
    setIsPostCommentSending(false);
  };

  //
  //
  useListenWebsocketEvents([
    { name: "comment-post-success", handler: onCommentPostSuccess },
    { name: "comment-post-error", handler: onCommentPostError },
  ]);

  return { commentPost, isPostCommentSending };
};
