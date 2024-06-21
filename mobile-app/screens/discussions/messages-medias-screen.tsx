import Avatar from "@/components/core/avatar";
import { IconButton } from "@/components/core/icon-button";
import MyText from "@/components/core/my-text";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import * as Linking from "expo-linking";
import { messagesMediasScreenName } from "@/constants/screens-names-constants";
import { useDiscussionMessagesWithMedias } from "@/hooks/use-discussion-messages-with-medias";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/styles/themes";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { truncate } from "@/utils/string-utils";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { AVPlaybackStatusSuccess, ResizeMode, Video } from "expo-av";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import ParsedText from "react-native-parsed-text";

const MessagesMediasScreen = () => {
  const route = useRoute();
  const { initialMediaId, discussionId } = route.params as {
    initialMediaId: string;
    discussionId: string;
  };
  const navigation = useNavigation();

  const { theme } = useTheme();

  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
    hasPreviousPage,
    fetchPreviousPage,
  } = useDiscussionMessagesWithMedias({
    discussionId,
    firstPageRequestedAt: new Date(),
  });

  const messages = isSuccess
    ? data.pages.map((page) => page.messages).flat()
    : [];

  const medias = messages
    .map((message) => message.medias.map((media) => ({ ...media, message })))
    .flat();

  const initialMediaIndex = medias.findIndex(({ id }) => id === initialMediaId);

  const [mediaDeepIndex, setMediaDeepIndex] = useState(initialMediaIndex);

  const downloadMedia = () => {};
  const [isImageLoading, setIsImageLoading] = useState(true);

  const lastMediaIndex = medias.length - 1;

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setMediaDeepIndex(e.nativeEvent.position);
  };

  useEffect(() => {
    if (isSuccess) {
      if (
        mediaDeepIndex + 2 >= lastMediaIndex &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        //   if () {
        fetchNextPage();
        //   }
      } else if (
        mediaDeepIndex - 2 <= 0 &&
        hasPreviousPage &&
        !isFetchingPreviousPage
      ) {
        //   if () {
        fetchPreviousPage();
        //   }
      }
    }
  }, [
    mediaDeepIndex,
    hasNextPage,
    hasPreviousPage,
    lastMediaIndex,
    isFetchingNextPage,
    isFetchingPreviousPage,
    fetchNextPage,
    fetchPreviousPage,
    isSuccess,
  ]);

  const messageText =
    isSuccess && mediaDeepIndex !== -1
      ? medias[mediaDeepIndex].message.text
      : null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={theme.gray900} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          zIndex: 100,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
          paddingHorizontal: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <IconButton variant="ghost" size="lg" onPress={navigation.goBack}>
            <Feather name="x" size={24} />
          </IconButton>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Avatar
              src={
                medias[mediaDeepIndex].message.sender.profilePicture
                  ? buildPublicFileUrl({
                      fileName:
                        medias[mediaDeepIndex].message.sender.profilePicture
                          .lowQualityFileName,
                    })
                  : undefined
              }
              name={medias[mediaDeepIndex].message.sender.displayName}
              width={34}
            />

            <View>
              <MyText style={{ fontSize: 13 }}>
                {medias[mediaDeepIndex].message.sender.displayName}
              </MyText>
              <MyText style={{ fontSize: 13 }}>
                <MyText style={{ fontSize: 11 }}>@</MyText>
                {medias[mediaDeepIndex].message.sender.userName}
              </MyText>
            </View>
          </View>
        </View>

        {/* <View></View> */}
        <IconButton variant="ghost" size="lg" onPress={downloadMedia}>
          <Feather name="download" size={24} />
        </IconButton>
      </View>
      <PagerView
        style={{ flex: 1 }}
        initialPage={mediaDeepIndex}
        onPageSelected={handlePageSelected}
      >
        {medias?.map(({ bestQualityFileName, message, mimetype }, index) => (
          <View key={index.toString()} style={{ flex: 1 }}>
            {acceptedImageMimetypes.includes(mimetype) ? (
              <ImageItem
                src={buildMessageFileUrl({
                  fileName: bestQualityFileName,
                  messageId: message.id,
                  discussionId: message.discussionId,
                })}
              />
            ) : acceptedVideoMimetypes.includes(mimetype) ? (
              <VideoItem
                isActive={index === mediaDeepIndex}
                src={buildMessageFileUrl({
                  fileName: bestQualityFileName,
                  messageId: message.id,
                  discussionId: message.discussionId,
                })}
              />
            ) : null}
          </View>
        ))}
      </PagerView>

      <View
        style={{
          paddingVertical: 10,
          justifyContent: "center",
          flexDirection: "row",
          width: "100%",
          height: 50,
          backgroundColor: theme.white,
          paddingHorizontal: 14,
        }}
      >
        {messageText && (
          <ParsedText
            numberOfLines={1}
            style={{
              color: theme.gray900,
              fontFamily: "NunitoSans_400Regular",
              fontSize: 15,
              textAlign: "center",
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
            {messageText}
          </ParsedText>
        )}
      </View>
    </View>
  );
};

export const messagesMediasScreen = {
  name: messagesMediasScreenName,
  component: MessagesMediasScreen,
  options: {
    title: "",
    animation: "fade",
    // headerShown: false,
    // headerTransparent: true,
    headerShown: false,
    headerStyle: {
      backgroundColor: themes.light.transparent,
    },
  } as NativeStackNavigationOptions,
};

const ImageItem = ({ src }: { src: string }) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Image
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: theme.white,
        }}
        onLoadEnd={() => setIsLoading(false)}
        onLoadStart={() => setIsLoading(true)}
      />
      {isLoading && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",

            width: "100%",
            height: "100%",
          }}
        >
          <ActivityIndicator size="large" color={theme.gray900} />
        </View>
      )}
    </View>
  );
};

const VideoItem = ({ src, isActive }: { src: string; isActive: boolean }) => {
  const { theme } = useTheme();
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | undefined>(
    undefined
  );

  useEffect(() => {
    if (!isActive) {
      videoRef.current?.stopAsync();
    }
  }, [isActive]);

  return (
    <View
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <Video
        ref={videoRef}
        style={{ flex: 1 }}
        source={{
          uri: src,
        }}
        shouldPlay
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls
        onPlaybackStatusUpdate={(status: any) => setStatus(status)}
      />
      {!status && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={theme.gray950} />
        </View>
      )}
    </View>
  );
};
