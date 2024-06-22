import * as Linking from "expo-linking";
import { PostComment } from "@/types/post-comment";
import { buildPublicFileUrl } from "@/utils/url-utils";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { durationFromNow } from "@/utils/datetime-utils";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { usePostCommentReplies } from "@/hooks/use-post-comment-replies";
import { atom, useAtom } from "jotai";
import Avatar from "../core/avatar";
import { useTheme } from "@/hooks/use-theme";
import { DropdownMenuItem } from "../core/dropdown-menu";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import {
  makeReportScreenName,
  postCommentsBottomSheetScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import { Skeleton } from "../core/skeleton";
import Space from "../core/space";
import { formatStatNumber } from "@/utils/number-utils";
import { Menu } from "react-native-paper";
import { useLikePostComment } from "@/hooks/use-like-post-comment";
import { useUnlikePostComment } from "@/hooks/use-unlike-post-comment";
import { useDeletePostComment } from "@/hooks/use-delete-post-comment";
import { postCommentToReplyToAtom } from "@/atoms/post-comment-to-reply-to-atom";
import { useDidUpdate } from "@mantine/hooks";
import ParsedText from "react-native-parsed-text";
import { truncate } from "@/utils/string-utils";

interface PostCommentItemProps {
  postComment: PostComment;
  level?: number;
}

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const PostCommentItem = ({ postComment, level = 1 }: PostCommentItemProps) => {
  const [isRepliesVisible, setIsRepliesVisible] = useState(true);
  const { theme } = useTheme();
  const [canLoadReplies, setCanLoadReplies] = useState(false);
  const navigation = useNavigation();
  const [
    loadedDescendantPostCommentsCount,
    setLoadedDescendantPostCommentsCount,
  ] = useState(0);

  const screenName = useNavigationState(
    (state) => state.routes[state.index].name
  );

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const [postCommentToReplyTo, setPostCommentToReplyTo] = useAtom(
    postCommentToReplyToAtom
  );

  const { likePostComment } = useLikePostComment({ postComment });
  const { unlikePostComment } = useUnlikePostComment({ postComment });

  const { deletePostComment, isDeleting } = useDeletePostComment({
    postComment,
  });

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const showDropdown = () => setIsDropdownVisible(true);

  const hideDropdown = () => setIsDropdownVisible(false);

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isSuccess,
    isLoading,
  } = usePostCommentReplies({
    level,
    canLoadReplies,
    postComment,
    firstPageRequestedAt: firstPageRequestedAt!,
  });

  const loadReplies = () => {
    if (!isRepliesVisible) {
      setIsRepliesVisible(true);
    }
    if (!canLoadReplies) {
      setCanLoadReplies(true);
    }
    if (!isFetchingNextPage && hasNextPage && level === 1) {
      fetchNextPage();
    }
  };

  //
  //
  //

  const hideReplies = () => {
    setIsRepliesVisible(false);
  };

  useEffect(() => {
    if (isSuccess) {
      setLoadedDescendantPostCommentsCount(
        data?.pages.reduce((acc, page) => page.postComments.length + acc, 0)
      );
    }
  }, [isSuccess, data, isRepliesVisible]);

  //
  //
  //
  //
  //

  useEffect(() => {
    if (!isRepliesVisible) {
      setIsRepliesVisible(true);
    }
  }, [data]);

  const goToReportPostCommentScreen = () => {
    navigation.navigate(makeReportScreenName, {
      postComment,
    });
  };

  const goToUserScreen = () => {
    navigation.navigate(userScreenName, {
      userName: postComment.commenter.userName,
    });
  };

  const goToParentCommenterProfile = () => {
    navigation.navigate(userScreenName, {
      userName: postComment.parentPostComment?.commenter.userName,
    });
  };

  const selectPostCommentToReplyTo = () => {
    setPostCommentToReplyTo(postComment);
  };

  useDidUpdate(() => {
    if (
      postCommentToReplyTo !== undefined &&
      screenName !== postCommentsBottomSheetScreenName
    ) {
      navigation.navigate(postCommentsBottomSheetScreenName, {
        postId: postComment.postId,
        autoFocus: true,
      });
    }
  }, [postCommentToReplyTo]);

  return (
    <Pressable onLongPress={showDropdown} delayLongPress={200}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: "row",
            gap: 14,
            paddingVertical: 8,
            opacity: isDeleting ? 0.5 : 1,
            pointerEvents: isDeleting ? "none" : "auto",
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
            paddingHorizontal: 20,
          }}
        >
          <Pressable onPress={goToUserScreen}>
            <Avatar
              src={
                postComment.commenter.profilePicture
                  ? buildPublicFileUrl({
                      fileName:
                        postComment.commenter.profilePicture.lowQualityFileName,
                    })
                  : undefined
              }
              name={postComment.commenter.displayName}
              width={30}
            />
          </Pressable>
          <View style={{ flex: 1, gap: 2 }}>
            <Pressable
              onPress={goToUserScreen}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <MyText style={{ color: "#6b7280", fontSize: 14 }}>
                {postComment.commenter.displayName +
                  " @" +
                  postComment.commenter.userName}
              </MyText>
            </Pressable>
            <View>
              <></>
              <MyText style={{ fontSize: 14, marginTop: 2 }}>
                {level === 2 && (
                  // <Pressable onPress={goToParentCommenterProfile}>
                  <MyText
                    style={{ color: theme.blue }}
                    onPress={goToParentCommenterProfile}
                  >
                    @{postComment.parentPostComment?.commenter.userName}
                    &nbsp;
                  </MyText>
                  // </Pressable>
                )}
                <ParsedText
                  style={{
                    color: theme.gray900,
                    fontFamily: "NunitoSans_400Regular",
                    fontSize: 14,
                  }}
                  parse={[
                    {
                      type: "url",
                      style: { color: theme.blue },
                      onPress: Linking.openURL,
                      renderText: (matchingString) =>
                        "\n" + truncate(matchingString, 50),
                    },
                  ]}
                >
                  {postComment.text}
                </ParsedText>
              </MyText>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 34,
                paddingRight: 10,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <MyText style={{ color: "#6b7280", fontSize: 12 }}>
                  {durationFromNow(postComment.createdAt)}
                </MyText>
                <MyText>-</MyText>
                <Pressable
                  onPress={selectPostCommentToReplyTo}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    // backgroundColor: "blue",
                  }}
                >
                  {({ pressed }) => (
                    <MyText
                      style={{
                        fontSize: 13,
                        color: theme.gray500,
                        fontFamily: "NunitoSans_600SemiBold",
                        paddingVertical: 4,
                        opacity: pressed ? 0.5 : 1,
                        // textTransform: "uppercase",
                      }}
                    >
                      Reply
                    </MyText>
                  )}
                </Pressable>

                <Menu
                  visible={isDropdownVisible}
                  onDismiss={hideDropdown}
                  style={{ paddingVertical: 0, zIndex: 800 }}
                  contentStyle={{
                    backgroundColor: theme.gray100,
                  }}
                  elevation={2}
                  anchor={
                    <Pressable
                      style={{
                        flexDirection: "row",
                        // backgroundColor: theme.transparent,
                        opacity: 0,
                      }}
                    >
                      <Ionicons name="ellipsis-horizontal-outline" size={26} />
                    </Pressable>
                  }
                >
                  <DropdownMenuItem
                    onPress={goToReportPostCommentScreen}
                    title="Report"
                    leftDecorator={<Feather name="flag" size={24} />}
                    closeMenu={hideDropdown}
                  />
                  {postComment.commenterId === loggedInUserData?.user.id && (
                    <DropdownMenuItem
                      onPress={deletePostComment}
                      title="Delete"
                      leftDecorator={<Feather name="trash-2" />}
                      closeMenu={hideDropdown}
                    />
                  )}
                </Menu>
              </View>

              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  paddingHorizontal: 4,
                  paddingVertical: 2,
                }}
                onPress={
                  postComment.likedByLoggedInUser
                    ? unlikePostComment
                    : likePostComment
                }
              >
                <Ionicons
                  name={
                    postComment.likedByLoggedInUser ? "heart" : "heart-outline"
                  }
                  size={18}
                  color={
                    postComment.likedByLoggedInUser
                      ? theme.heart
                      : theme.gray500
                  }
                />
                <MyText
                  style={{
                    fontSize: 12,
                    opacity: postComment.likesCount > 0 ? 1 : 0,
                  }}
                >
                  {formatStatNumber(postComment.likesCount)}
                </MyText>
              </Pressable>
            </View>

            <View>
              {isRepliesVisible &&
                data?.pages.map((page) =>
                  page.postComments.map((postCommentReply) => (
                    <PostCommentItem
                      key={postCommentReply.id}
                      postComment={postCommentReply}
                      level={2}
                    />
                  ))
                )}
            </View>
            {level === 1 && postComment.descendantPostCommentsCount > 0 && (
              <Pressable
                style={{
                  paddingBottom: 5,
                  // backgroundColor: "blue",
                }}
                onPress={
                  postComment.descendantPostCommentsCount -
                    loadedDescendantPostCommentsCount >
                    0 || !isRepliesVisible
                    ? loadReplies
                    : hideReplies
                }
              >
                <MyText
                  style={{
                    fontFamily: "NunitoSans_600SemiBold",
                    color: "#9ca3af",
                  }}
                >
                  {postComment.descendantPostCommentsCount -
                    loadedDescendantPostCommentsCount >
                    0 || !isRepliesVisible ? (
                    <>
                      {isLoading || isFetchingNextPage
                        ? "Loading ..."
                        : `show ${
                            loadedDescendantPostCommentsCount > 0 &&
                            isRepliesVisible
                              ? "more "
                              : ""
                          }replies ` +
                          "(" +
                          formatStatNumber(
                            isRepliesVisible
                              ? postComment.descendantPostCommentsCount -
                                  loadedDescendantPostCommentsCount!
                              : postComment.descendantPostCommentsCount
                          ) +
                          ")"}
                    </>
                  ) : (
                    <>Hide replies</>
                  )}
                </MyText>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default PostCommentItem;

export const PostCommentItemLoader = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 14,
        paddingVertical: 8,
        paddingHorizontal: 20,
        alignItems: "flex-start",
      }}
    >
      <Skeleton style={{ width: 30, height: 30, borderRadius: 300 }} />

      <View style={{ flex: 1, paddingTop: 4 }}>
        <Skeleton style={{ width: "50%", height: 9, borderRadius: 10 }} />
        <Space height={18} />
        <Skeleton style={{ width: "70%", height: 9, borderRadius: 10 }} />
        {/* <Space height={14} />
        <Skeleton style={{ width: "30%", height: 10, borderRadius: 10 }} /> */}
      </View>
    </View>
  );
};
