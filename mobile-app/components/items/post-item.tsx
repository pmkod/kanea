import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Dimensions, Image, Pressable, View } from "react-native";
import * as Linking from "expo-linking";
import MyText from "../core/my-text";
import { Post } from "@/types/post";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { durationFromNow } from "@/utils/datetime-utils";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import PostCommentItem from "./post-comment-item";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { useNetInfo } from "@react-native-community/netinfo";
import Space from "../core/space";
import { Skeleton } from "../core/skeleton";
import { useTheme } from "@/hooks/use-theme";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import {
  homeScreenName,
  makeReportScreenName,
  postCommentsBottomSheetScreenName,
  postLikesScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import Avatar from "../core/avatar";
import { DropdownMenu, DropdownMenuItem } from "../core/dropdown-menu";
import { IconButton } from "../core/icon-button";
import {
  DotsThree,
  Flag,
  LinkSimple,
  Prohibit,
  Trash,
  UserMinus,
} from "phosphor-react-native";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import Toast from "react-native-toast-message";
import { webAppUrl } from "@/constants/app-constants";
import * as Clipboard from "expo-clipboard";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import NiceModal from "@ebay/nice-modal-react";
import { DeletePostConfirmModal } from "@/components/modals/delete-post-confirm-modal";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { formatStatNumber } from "@/utils/number-utils";
import { ResizeMode, Video } from "expo-av";
import { useLikePost } from "@/hooks/use-like-post";
import { useUnLikePost } from "@/hooks/use-unlike-post";
import { BlockUserConfirmModal } from "../modals/block-user-confirm-modal";
import ParsedText from "react-native-parsed-text";
import { truncate } from "@/utils/string-utils";

interface PostItemProps {
  post: Post;
}

export const PostItem = ({ post }: PostItemProps) => {
  // const isCommentVisibleInSheet = pathname === "/home" || xlMaxMediaQuery;

  const { data: loggedInUserData } = useLoggedInUser();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  const { theme } = useTheme();
  const webSocket = useAtomValue(webSocketAtom);
  const network = useNetInfo();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const screenName = useNavigationState(
    (state) => state.routes[state.index].name
  );
  const { likePost } = useLikePost({ postId: post.id });
  const { unlikePost } = useUnLikePost({ postId: post.id });

  const copyPostLink = async () => {
    await Clipboard.setStringAsync(`${webAppUrl}/posts/${post.id}`);
    Toast.show({
      type: "info",
      text2: "Copied",
    });
  };

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setCurrentMediaIndex(e.nativeEvent.position);
  };

  const goToMakeReportScreen = () => {
    navigation.navigate(makeReportScreenName, {
      post,
    });
  };

  const unfollowUser = () => {
    if (!network.isConnected) {
      return;
    }
    webSocket?.emit("unfollow", {
      followedId: post.publisherId,
    });
    if (screenName === homeScreenName) {
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
      Toast.show({ type: "success", text1: "Unfollow completed" });
    }
  };

  const openBlockUserModal = () => {
    NiceModal.show(BlockUserConfirmModal, {
      user: post.publisher,
      currentScreenName: homeScreenName,
    });
  };

  const openDeletePostModal = () => {
    NiceModal.show(DeletePostConfirmModal, {
      post,
    });
  };

  const goToUserScreen = () => {
    navigation.navigate(userScreenName, {
      userName: post.publisher.userName,
    });
  };

  const goToPostLikesScreen = () => {
    navigation.navigate(postLikesScreenName, {
      post: post,
    });
  };

  const goToPostCommentsBottomSheetScreen = () => {
    navigation.navigate(postCommentsBottomSheetScreenName, {
      postId: post.id,
    });
  };

  const goToPostCommentsBottomSheetAndFocusInput = () => {
    navigation.navigate(postCommentsBottomSheetScreenName, {
      postId: post.id,
      autoFocus: true,
    });
  };

  return (
    <View>
      <View
        style={{
          paddingLeft: 20,
          paddingRight: 12,
          marginBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: 8,
          }}
        >
          <Pressable
            onPress={goToUserScreen}
            style={{
              marginRight: 12,
            }}
          >
            <Avatar
              width={40}
              src={
                post.publisher.profilePicture
                  ? buildPublicFileUrl({
                      fileName:
                        post.publisher.profilePicture.lowQualityFileName,
                    })
                  : undefined
              }
              name={post.publisher.displayName}
            />
          </Pressable>

          <Pressable
            onPress={goToUserScreen}
            style={{ flex: 1, marginRight: 10 }}
          >
            <View style={{ flexDirection: "row" }}>
              <MyText style={{}}>{post.publisher.displayName} - </MyText>
              <MyText style={{}}>@{post.publisher.userName} </MyText>
            </View>
            <MyText style={{}}>{durationFromNow(post.createdAt)}</MyText>
          </Pressable>

          <DropdownMenu
            anchor={
              <IconButton size="md" variant="ghost" colorScheme="primary">
                <DotsThree size={26} color={theme.gray500} />
              </IconButton>
            }
          >
            <DropdownMenuItem
              title="Copy post link"
              onPress={copyPostLink}
              leftDecorator={<LinkSimple />}
            />
            <DropdownMenuItem
              title="Unfollow"
              onPress={unfollowUser}
              leftDecorator={<UserMinus />}
            />
            {post.publisher.id !== loggedInUserData?.user.id && (
              <DropdownMenuItem
                onPress={openBlockUserModal}
                title="Block user"
                leftDecorator={<Prohibit />}
              />
            )}
            <DropdownMenuItem
              onPress={goToMakeReportScreen}
              leftDecorator={<Flag />}
              title="Report"
            />
            {post.publisher.id === loggedInUserData?.user.id && (
              <DropdownMenuItem
                onPress={openDeletePostModal}
                leftDecorator={<Trash />}
                title="Delete"
              />
            )}
          </DropdownMenu>
        </View>
        {post.text ? (
          <ParsedText
            style={{
              color: theme.gray900,
              fontFamily: "NunitoSans_400Regular",
            }}
            parse={[
              {
                type: "url",
                style: { color: theme.blue },
                onPress: Linking.openURL,
                // ellipsizeMode: "",
                renderText: (matchingString) =>
                  "\n" + truncate(matchingString, 50),
              },
            ]}
          >
            {post.text}
          </ParsedText>
        ) : null}
      </View>

      <PagerView
        collapsable={false}
        style={{
          aspectRatio: "1/1",
        }}
        initialPage={0}
        overScrollMode="never"
        onPageSelected={handlePageSelected}
      >
        {post.medias.map((media, index) => (
          <MediaItem key={media.bestQualityFileName} media={media} />
        ))}
      </PagerView>

      <View
        style={{
          position: "relative",
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {post.likedByLoggedInUser ? (
            <Pressable onPress={unlikePost}>
              <Ionicons name="heart" size={30} color={theme.heart} />
            </Pressable>
          ) : (
            <Pressable onPress={likePost}>
              <Ionicons name="heart-outline" size={30} color={theme.gray500} />
            </Pressable>
          )}
          <View style={{ width: 14 }} />
          <Pressable onPress={goToPostCommentsBottomSheetAndFocusInput}>
            {({ pressed }) => (
              <Ionicons
                name="chatbubble-outline"
                size={26}
                color={theme.gray500}
                style={{ opacity: pressed ? 0.5 : 1 }}
              />
            )}
          </Pressable>

          {post.medias.length > 1 && (
            <View
              style={{
                position: "absolute",
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                gap: 6,
              }}
            >
              {post.medias.map((media, index) => (
                <View
                  key={media.bestQualityFileName}
                  style={{
                    backgroundColor: theme.gray800,
                    width: 6,
                    aspectRatio: "1/1",
                    borderRadius: 300,
                    opacity: index === currentMediaIndex ? 1 : 0.3,
                  }}
                ></View>
              ))}
            </View>
          )}
        </View>

        {post.likesCount > 0 && (
          <Pressable
            onPress={goToPostLikesScreen}
            style={{
              width: "auto",
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            <MyText style={{ fontSize: 17 }}>
              {formatStatNumber(post.likesCount)} Like
              {post.likesCount > 1 && "s"}
            </MyText>
          </Pressable>
        )}
      </View>
      {
        // (pathname !== `/posts/${post.id}` || xlMaxMediaQuery) &&
        post.someComments.length > 0 && (
          <View style={{ marginTop: 8 }}>
            {post.someComments.map((comment) => (
              <PostCommentItem key={comment.id} postComment={comment} />
            ))}
          </View>
        )
      }
      <View style={{ paddingHorizontal: 20 }}>
        {post.commentsCount > 1 && (
          <Pressable
            onPress={goToPostCommentsBottomSheetScreen}
            style={{ paddingVertical: 10, marginTop: 5 }}
          >
            {({ pressed }) => (
              <>
                <MyText
                  style={{
                    color: "#9ca3af",
                    fontSize: 16,
                    fontFamily: "NunitoSans_600SemiBold",
                    opacity: pressed ? 0.5 : 1,
                  }}
                >
                  Show the&nbsp;
                  {post.commentsCount > 1
                    ? formatStatNumber(post.commentsCount) + " "
                    : " "}
                  comment{post.commentsCount > 1 && "s"}
                </MyText>
              </>
            )}
          </Pressable>
        )}
      </View>
      <Space height={40} />
    </View>
  );
};

//
//
//
//
//
//
//

const MediaItem = ({ media }: { media: Post["medias"][0] }) => {
  const ref = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  // const player = acceptedVideoMimetypes.includes(media.mimetype)
  //   ? useVideoPlayer(
  //       buildPublicFileUrl({ fileName: media.bestQualityFileName }),
  //       (player) => {
  //         player.loop = true;
  //         player.play();
  //       }
  //     )
  //   : null;
  // useEffect(() => {
  //   const subscription = player !== null ? player.('playingChange', (isPlaying) => {
  //     setIsPlaying(isPlaying);
  //   }) : undefined;

  //   return () => {
  //     subscription.remove();
  //   };
  // }, [player]);

  const [status, setStatus] = React.useState({});

  return (
    <View style={{ flex: 1 }}>
      {acceptedImageMimetypes.includes(media.mimetype) ? (
        <Image
          source={{
            uri: buildPublicFileUrl({
              fileName: media.bestQualityFileName,
            }),
          }}
          style={{
            aspectRatio: "1/1",
          }}
        />
      ) : (
        acceptedVideoMimetypes.includes(media.mimetype) && (
          // player ? null : // <VideoView
          //   ref={ref}
          //   style={{
          //     aspectRatio: "1/1",
          //     width: "100%",
          //     height: "100%",
          //   }}
          //   player={player}
          //   allowsFullscreen
          // />
          <Video
            style={{
              aspectRatio: "1/1",
            }}
            useNativeControls
            source={{
              uri: buildPublicFileUrl({
                fileName: media.bestQualityFileName,
              }),
            }}
            // source={{
            //   uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
            // }}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
          />
        )
      )}
    </View>
  );
};

//
//
//
//
//

export const PostItemLoader = () => {
  const screenWidth = Dimensions.get("screen").width;
  return (
    <View>
      <View
        style={{
          paddingLeft: 20,
          paddingRight: 12,
          marginBottom: 8,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingBottom: 8,
          }}
        >
          <Skeleton
            style={{
              width: 40,
              height: 40,
              borderRadius: 300,
              marginRight: 12,
            }}
          />

          <View style={{ paddingRight: 30 }}>
            <Skeleton
              style={{
                width: 160,
                height: 9,
                borderRadius: 10,
                marginBottom: 10,
                maxWidth: screenWidth * 0.5,
              }}
            />
            <Skeleton
              style={{
                width: 70,
                height: 9,
                maxWidth: screenWidth * 0.3,
                borderRadius: 10,
              }}
            />
          </View>
        </View>

        {/* <Skeleton
          style={{
            height: 8,
            width: 300,
            maxWidth: screenWidth * 0.4,
            borderRadius: 10,
            marginVertical: 6,
          }}
        /> */}
      </View>
      <Skeleton style={{ width: "100%", aspectRatio: "1/1" }} />

      <View
        style={{ flexDirection: "row", paddingTop: 12, paddingHorizontal: 18 }}
      >
        <Skeleton style={{ width: 26, height: 26, borderRadius: 300 }} />
        <Space width={14} />
        <Skeleton style={{ width: 26, height: 26, borderRadius: 300 }} />
      </View>
      <Space height={40} />
    </View>
  );
};
