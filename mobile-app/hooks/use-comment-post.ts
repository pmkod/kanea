import { PostComment } from "@/types/post-comment";
import { useListenWebsocketEvents } from "./use-listen-websocket-events";
import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Post } from "@/types/post";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { useNetInfo } from "@react-native-community/netinfo";

import { postCommentToReplyToAtom } from "@/atoms/post-comment-to-reply-to-atom";
import {
  followingTimelineQueryKey,
  postCommentRepliesQueryKey,
  postCommentsQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigationState } from "@react-navigation/native";
import {
  homeScreenName,
  postCommentsBottomSheetScreenName,
  postScreenName,
} from "@/constants/screens-names-constants";
import Toast from "react-native-toast-message";
import { currentlyOpenPostIdAtom } from "@/atoms/currently-open-post-id-atom";

//
//
//
//
//

export const useCommentPost = ({
  postId,
  clearText,
}: {
  postId: string;
  clearText: () => void;
  // postCommentTextareaRef: React.RefObject<HTMLTextAreaElement>;
}) => {
  const network = useNetInfo();
  const webSocket = useAtomValue(webSocketAtom);
  // const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPostCommentSending, setIsPostCommentSending] = useState(false);
  const [postCommentToReplyTo, setPostCommentToReplyTo] = useAtom(
    postCommentToReplyToAtom
  );
  const currentlyOpenPostId = useAtomValue(currentlyOpenPostIdAtom);

  const screenName = useNavigationState(
    (state) => state.routes[state.index].name
  );

  const commentPost = ({ text }: { text: string }) => {
    if (!network.isConnected) {
      return;
    }
    setIsPostCommentSending(true);

    const data: any = {
      text,
      postId: postId,
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

      //   if (context === "post-item") {
      //     if (screenName === homeScreenName) {
      //       queryClient.setQueryData(
      //         [followingTimelineQueryKey],
      //         (qData: any) => {
      //           return {
      //             ...qData,
      //             pages: qData.pages.map((pageData: any) => ({
      //               ...pageData,
      //               posts: pageData.posts.map((postInData: Post) => ({
      //                 ...postInData,
      //                 someComments: postInData.someComments.map((comment) => ({
      //                   ...comment,
      //                   descendantPostCommentsCount:
      //                     comment.id ===
      //                     eventData.postComment.mostDistantParentPostCommentId
      //                       ? comment.descendantPostCommentsCount + 1
      //                       : comment.descendantPostCommentsCount,
      //                 })),
      //               })),
      //             })),
      //           };
      //         }
      //       );
      //     } else if (

      //     [postScreenName, postCommentsBottomSheetScreenName].includes(
      //         screenName
      //       ) &&
      //       currentlyOpenPostId === postId
      //     ) {
      //       queryClient.setQueryData([postsQueryKey, postId], (qData: any) => ({
      //         ...qData,
      //         post: {
      //           ...qData.post,
      //           someComments: qData.post.someComments.map(
      //             (comment: PostComment) => ({
      //               ...comment,
      //               descendantPostCommentsCount:
      //                 comment.id ===
      //                 eventData.postComment.mostDistantParentPostCommentId
      //                   ? comment.descendantPostCommentsCount + 1
      //                   : comment.descendantPostCommentsCount,
      //             })
      //           ),
      //         },
      //       }));
      //     }
      //   } else if (context === "post-block") {
      queryClient.setQueryData(
        [postsQueryKey, postId, postCommentsQueryKey],
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
      //   }
    } else {
      //   if (
      //     context === "post-item"
      //     // ! Si c'est dans le post-item ici
      //   ) {
      //     if (screenName === homeScreenName) {
      //       queryClient.setQueryData(
      //         [followingTimelineQueryKey],
      //         (qData: any) => {
      //           return {
      //             ...qData,
      //             pages: qData.pages.map((pageData: any) => ({
      //               ...pageData,
      //               posts: pageData.posts.map((postInData: Post) => ({
      //                 ...postInData,
      //                 someComments:
      //                   postId === postInData.id
      //                     ? [eventData.postComment, ...postInData.someComments]
      //                     : postInData.someComments,
      //               })),
      //             })),
      //           };
      //         }
      //       );
      //     } else if (
      //         [postScreenName, postCommentsBottomSheetScreenName].includes(
      //           screenName
      //         ) &&
      //         currentlyOpenPostId === postId) {
      //       queryClient.setQueryData([postsQueryKey, postId], (qData: any) => {
      //         return {
      //           ...qData,

      //           post: {
      //             ...qData.post,

      //             someComments: [
      //               eventData.postComment,
      //               ...qData.post.someComments,
      //             ],
      //           },
      //         };
      //       });
      //     }
      //   } else if (
      //     context === "post-block"
      //     // ! Si c'est dans le block ici
      //   ) {
      queryClient.setQueryData(
        [postsQueryKey, postId, postCommentsQueryKey],
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
    // }

    if (screenName === homeScreenName) {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            posts: pageData.posts.map((postInData: Post) => ({
              ...postInData,
              commentsCount:
                postInData.id === postId
                  ? postInData.commentsCount + 1
                  : postInData.commentsCount,
            })),
          })),
        };
      });
    } else if (
      [postScreenName, postCommentsBottomSheetScreenName].includes(
        screenName
      ) &&
      currentlyOpenPostId === postId
    ) {
      queryClient.setQueryData([postsQueryKey, postId], (qData: any) => {
        return {
          ...qData,
          post: {
            ...qData.post,
            commentsCount: qData.post.commentsCount + 1,
          },
        };
      });
    }
    // adjustTextareaHeight(postCommentTextareaRef);
    clearText();
    setIsPostCommentSending(false);
  };

  const onCommentPostError = ({ message }: { message: string }) => {
    Toast.show({ type: "error", text1: message });
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
