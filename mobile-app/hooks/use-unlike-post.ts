import { webSocketAtom } from "@/atoms/web-socket-atom";
import {
  followingTimelineQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";
import { Post } from "@/types/post";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useListenWebsocketEvent } from "./use-listen-websocket-event";
import { useNavigationState } from "@react-navigation/native";
import {
  homeScreenName,
  postScreenName,
} from "@/constants/screens-names-constants";
import { currentlyOpenPostIdAtom } from "@/atoms/currently-open-post-id-atom";
import { useNetInfo } from "@react-native-community/netinfo";

export const useUnLikePost = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const network = useNetInfo();

  const screenName = useNavigationState(
    (state) => state.routes[state.index].name
  );
  const currentlyOpenPostId = useAtomValue(currentlyOpenPostIdAtom);

  const unlikePost = () => {
    if (!network.isConnected) {
      return;
    }
    webSocket?.emit("unlike-post", {
      postId,
    });

    if (screenName === homeScreenName) {
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
    } else if (
      screenName === postScreenName &&
      currentlyOpenPostId === postId
    ) {
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
    if (screenName === homeScreenName) {
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
    } else if (
      screenName === postScreenName &&
      currentlyOpenPostId === postId
    ) {
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
