import { postCommentsBottomSheetScreenName } from "@/constants/screens-names-constants";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";
import MyText from "@/components/core/my-text";
import PostCommentsBlock from "@/components/others/post-comments-block";
import { Input } from "@/components/core/input";
import { useTheme } from "@/hooks/use-theme";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useKeyboard } from "@react-native-community/hooks";
import { useDidUpdate } from "@mantine/hooks";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "@/components/core/avatar";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { useCommentPost } from "@/hooks/use-comment-post";
import { useAtom } from "jotai";
import { postCommentToReplyToAtom } from "@/atoms/post-comment-to-reply-to-atom";

const PostCommentsBottomSheetScreen = () => {
  const { theme } = useTheme();
  const { data } = useLoggedInUser();
  const [postCommentToReplyTo, setPostCommentToReplyToAtom] = useAtom(
    postCommentToReplyToAtom
  );
  const inputRef = useRef<TextInput>(null);

  const route = useRoute();
  const [text, setText] = useState("");
  const { postId, autoFocus } = route.params as {
    postId: string;
    autoFocus?: boolean;
  };
  const [fullHeight, setFullHeight] = useState(autoFocus);
  const navigation = useNavigation();
  const keyboard = useKeyboard();
  const clearText = () => {
    setText("");
  };
  const { commentPost, isPostCommentSending } = useCommentPost({
    postId,
    clearText,
  });

  const [inputHeight, setInputHeight] = useState(56);

  const handleBlur = () => {
    setFullHeight(false);
  };

  const goToPreviousScreen = () => {
    navigation.goBack();
  };

  useDidUpdate(() => {
    if (!keyboard.keyboardShown) {
      setFullHeight(false);
    }
  }, [keyboard.keyboardShown]);

  const sendComment = () => {
    commentPost({ text });
  };

  useEffect(() => {
    return () => {
      setPostCommentToReplyToAtom(undefined);
    };
  }, []);

  useEffect(() => {
    if (postCommentToReplyTo !== undefined) {
      inputRef.current?.focus();
    }
  }, [postCommentToReplyTo]);

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (e.nativeEvent.key == "Enter") {
      sendComment();
    }
  };

  const maxCommentLength = 1000;

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={[
          {
            backgroundColor: "#1d2424",
            opacity: 0.4,
          },
          StyleSheet.absoluteFill,
        ]}
      ></View>
      <Pressable
        onPress={goToPreviousScreen}
        style={{ height: fullHeight || keyboard.keyboardShown ? 0 : "22%" }}
      ></Pressable>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.white,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <MyText
          style={{
            textAlign: "center",
            fontSize: 16,
            paddingTop: 12,
            paddingBottom: 12,
            color: theme.gray950,
            fontFamily: "NunitoSans_600SemiBold",
          }}
        >
          Comments
        </MyText>
        <PostCommentsBlock postId={postId} />

        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 2,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            borderTopWidth: 1.2,
            borderTopColor: theme.gray100,
            backgroundColor: theme.white,
          }}
        >
          <Avatar
            width={30}
            src={
              data && data.user.profilePicture
                ? buildPublicFileUrl({
                    fileName: data?.user.profilePicture?.lowQualityFileName,
                  })
                : ""
            }
            name={data?.user.displayName}
          />
          <Input
            ref={inputRef}
            autoFocus={autoFocus}
            placeholder={
              postCommentToReplyTo !== undefined
                ? `Reply to ${postCommentToReplyTo.commenter.displayName}`
                : "Write your comment here"
            }
            onBlur={handleBlur}
            value={text}
            onChange={setText}
            maxLength={maxCommentLength}
            placeholderTextColor={theme.gray600}
            style={{
              flex: 1,
              borderColor: theme.transparent,
              height: inputHeight,
              paddingLeft: 0,
            }}
            onContentSizeChange={(event) => {
              const h = event.nativeEvent.contentSize.height;
              setInputHeight(h > 100 ? 100 : h > 46 ? h : 46);
            }}
            onKeyPress={handleKeyPress}
          />
          {text.length > 0 && (
            <Pressable
              disabled={isPostCommentSending}
              onPress={sendComment}
              style={{
                borderRadius: 30,
                paddingVertical: 8,
                paddingLeft: 14,
                paddingRight: 10,
                backgroundColor: theme.gray950,

                opacity: isPostCommentSending ? 0.7 : 1,
              }}
            >
              <Ionicons name="send" size={19} color={theme.white} />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

export const postCommentsBottomSheetScreen = {
  name: postCommentsBottomSheetScreenName,
  component: PostCommentsBottomSheetScreen,
  options: {
    animation: "none",
    headerShown: false,
    presentation: "transparentModal",
  } as NativeStackNavigationOptions,
};
