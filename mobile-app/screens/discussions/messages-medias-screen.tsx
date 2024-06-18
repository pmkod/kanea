import Avatar from "@/components/core/avatar";
import { IconButton } from "@/components/core/icon-button";
import MyText from "@/components/core/my-text";
import { acceptedImageMimetypes } from "@/constants/file-constants";
import { messagesMediasScreenName } from "@/constants/screens-names-constants";
import { useDiscussionMessagesWithMedias } from "@/hooks/use-discussion-messages-with-medias";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/styles/themes";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { DownloadSimple, X } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";

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
        <ActivityIndicator size={38} color={theme.gray900} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          position: "absolute",
          width: "100%",
          top: 0,
          zIndex: 100,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 60,
          //   backgroundColor: "blue",
          paddingHorizontal: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <IconButton variant="ghost" size="lg" onPress={navigation.goBack}>
            <X size={24} />
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
          <DownloadSimple size={24} />
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
              <Image
                src={buildMessageFileUrl({
                  fileName: bestQualityFileName,
                  messageId: message.id,
                  discussionId: message.discussionId,
                })}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  backgroundColor: theme.white,
                }}
              />
            ) : null}
          </View>
        ))}
      </PagerView>

      {messageText && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            paddingVertical: 10,
            justifyContent: "center",
            flexDirection: "row",
            width: "100%",
            height: 80,
            backgroundColor: theme.white,
            paddingHorizontal: 14,
          }}
        >
          <MyText style={{ textAlign: "center" }} numberOfLines={3}>
            {messageText}
          </MyText>
        </View>
      )}
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
