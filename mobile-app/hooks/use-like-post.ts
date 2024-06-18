import { webSocketAtom } from "@/atoms/web-socket-atom";
import {
  followingTimelineQueryKey,
  postsQueryKey,
} from "@/constants/query-keys";
import { Post } from "@/types/post";
// import { useNetwork } from "@mantine/hooks";
import { useNetInfo } from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useListenWebsocketEvent } from "./use-listen-websocket-event";
import { useNavigationState } from "@react-navigation/native";
import {
  homeScreenName,
  postScreenName,
} from "@/constants/screens-names-constants";
import { currentlyOpenPostIdAtom } from "@/atoms/currently-open-post-id-atom";

export const useLikePost = ({ postId }: { postId: string }) => {
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const network = useNetInfo();
  const currentlyOpenPostId = useAtomValue(currentlyOpenPostIdAtom);

  // const pathname = usePathname();
  const screenName = useNavigationState(
    (state) => state.routes[state.index].name
  );

  const likePost = () => {
    if (!network.isConnected) {
      return;
    }
    webSocket?.emit("like-post", {
      postId,
    });

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

  const onLikePostError = () => {
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

  useListenWebsocketEvent({
    name: "like-post-error",
    handler: onLikePostError,
  });

  return { likePost };
};
