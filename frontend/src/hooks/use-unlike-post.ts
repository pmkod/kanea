import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import {
  followingTimelineQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";
import { Post } from "@/types/post";
import { useNetwork } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { usePathname } from "next/navigation";
import { useListenWebsocketEvent } from "./use-listen-websocket-event";

export const useUnLikePost = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const network = useNetwork();
  const pathname = usePathname();

  const unlikePost = () => {
    if (!network.online) {
      return;
    }
    webSocket?.emit("unlike-post", {
      postId,
    });

    if (pathname === "/home") {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            posts: pageData.posts.map((postInData: Post) => ({
              ...postInData,
              likesCount:
                postInData.id === postId
                  ? postInData.likesCount > 0
                    ? postInData.likesCount - 1
                    : 0
                  : postInData.likesCount,
              likedByLoggedInUser:
                postInData.id === postId
                  ? false
                  : postInData.likedByLoggedInUser,
            })),
          })),
        };
      });
    } else if (pathname === "/posts/" + postId) {
      queryClient.setQueryData([postsQueryKey, postId], (qData: any) => {
        return {
          ...qData,
          post: {
            ...qData.post,
            likesCount:
              qData.post.likesCount > 0 ? qData.post.likesCount - 1 : 0,
            likedByLoggedInUser: false,
          },
        };
      });
    }
  };

  const onUnlikePostError = () => {
    if (pathname === "/home") {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData?.pages.map((pageData: any) => ({
            ...pageData,
            posts: pageData.posts.map((postInData: Post) => ({
              ...postInData,
              likesCount:
                postInData.id === postId
                  ? postInData.likesCount + 1
                  : postInData.likesCount,
              likedByLoggedInUser:
                postInData.id === postId
                  ? true
                  : postInData.likedByLoggedInUser,
            })),
          })),
        };
      });
    } else if (pathname === "/posts/" + postId) {
      queryClient.setQueryData([postsQueryKey, postId], (qData: any) => {
        return {
          ...qData,
          post: {
            ...qData.post,
            likesCount: qData.post.likesCount + 1,
            likedByLoggedInUser: true,
          },
        };
      });
    }
  };

  useListenWebsocketEvent({
    name: "unlike-post-error",
    handler: onUnlikePostError,
  });

  return { unlikePost };
};
