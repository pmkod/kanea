import MyText from "@/components/core/my-text";
import { Skeleton } from "@/components/core/skeleton";
import Space from "@/components/core/space";
import {
  discussionMediasAndDocsScreenName,
  messagesMediasScreenName,
} from "@/constants/screens-names-constants";
import { useDiscussionMessagesWithDocs } from "@/hooks/use-discussion-messages-with-docs";
import { useDiscussionMessagesWithMedias } from "@/hooks/use-discussion-messages-with-medias";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/styles/themes";
import { Message } from "@/types/message";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDidUpdate } from "@mantine/hooks";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { AVPlaybackStatusSuccess, ResizeMode, Video } from "expo-av";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";

const flatListParams = {
  numColumns: 3,
  contentContainerStyle: { gap: 2 },
  columnWrapperStyle: { gap: 2 },
  scrollEnabled: false,
};

export const getMediaItemWidth = () => {
  const screenWidth = Dimensions.get("screen").width;
  return screenWidth / 3;
};

const messagesWithMediasFirstPageRequestedAtAtom = atom<Date | undefined>(
  undefined
);

const MediasTab = () => {
  const route = useRoute();
  const { theme } = useTheme();
  const { discussionId } = route.params as {
    discussionId: string;
  };

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    messagesWithMediasFirstPageRequestedAtAtom
  );

  useEffect(() => {
    if (firstPageRequestedAt === undefined) {
      setFirstPageRequestedAt(new Date());
    }
  }, []);

  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    isRefetching,
    refetch,
    isFetching,
  } = useDiscussionMessagesWithMedias({
    discussionId,
    firstPageRequestedAt,
  });

  const messages = isSuccess
    ? data.pages
        .map((page) =>
          page.messages
            .map((message) => ({ page: page.page, ...message }))
            .flat()
        )
        .flat()
    : [];

  const medias = messages
    ?.map((message) => message.medias.map((media) => ({ ...media, message })))
    .flat();

  const loadMoreMedias = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    setFirstPageRequestedAt(new Date());
  };

  useDidUpdate(() => {
    if (firstPageRequestedAt && !isFetching) {
      refetch();
    }
  }, [firstPageRequestedAt]);

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
          renderItem={() => (
            <Skeleton
              style={{
                width: getMediaItemWidth(),
                aspectRatio: "1/1",
              }}
            />
          )}
          keyExtractor={(_, index) => index.toString()}
          {...flatListParams}
        />
      ) : isSuccess ? (
        <FlatList
          data={medias}
          renderItem={({ item: { message, ...media }, index }) => (
            <MediaItem media={media} message={message} />
          )}
          refreshing={isRefetching && !isFetching}
          onRefresh={handleRefresh}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadMoreMedias}
          onEndReachedThreshold={0.3}
          initialNumToRender={18}
          overScrollMode="never"
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <MyText style={{ fontSize: 16, color: theme.gray500 }}>
                No media
              </MyText>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <FlatList
                data={[1, 2, 3, 4, 5, 6]}
                initialNumToRender={6}
                renderItem={() => (
                  <Skeleton
                    style={{
                      width: getMediaItemWidth(),
                      aspectRatio: "1/1",
                    }}
                  />
                )}
                keyExtractor={(_, index) => index.toString()}
                {...flatListParams}
              />
            ) : null
          }
          {...flatListParams}
        />
      ) : isError ? (
        <View>
          <MyText style={{ textAlign: "center" }}>
            {(error as any).errors[0].message}
          </MyText>
        </View>
      ) : null}
    </View>
  );
};

const MediaItem = ({
  media,
  message,
}: {
  message: Message;
  media: Message["medias"][0];
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const openMediaModal = () => {
    navigation.navigate(messagesMediasScreenName, {
      initialMediaId: media.id,
      discussionId: message.discussionId,
    });
  };

  const [status, setStatus] = useState<AVPlaybackStatusSuccess | undefined>(
    undefined
  );

  return (
    <Pressable
      onPress={openMediaModal}
      key={media.lowQualityFileName}
      style={{
        width: getMediaItemWidth(),
        aspectRatio: "1/1",
        backgroundColor: theme.gray200,
      }}
    >
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
          }}
        >
          {media.mimetype.startsWith("video") ? (
            <View
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
              }}
            >
              <Video
                style={{ flex: 1 }}
                source={{
                  uri: buildMessageFileUrl({
                    discussionId: message.discussionId,
                    fileName: media.bestQualityFileName,
                    messageId: message.id,
                  }),
                }}
                shouldPlay={false}
                videoStyle={{ backgroundColor: theme.gray200 }}
                resizeMode={ResizeMode.COVER}
                onPlaybackStatusUpdate={(status: any) => setStatus(status)}
              />

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
                <View
                  style={{
                    borderRadius: 500,
                    padding: 8,
                    backgroundColor: themes.light.gray900,
                  }}
                >
                  {!status ? (
                    <ActivityIndicator size={16} color={themes.light.white} />
                  ) : (
                    <Ionicons
                      name="play"
                      size={16}
                      weight="fill"
                      color={themes.light.white}
                    />
                  )}
                </View>
              </View>
            </View>
          ) : (
            <Image
              src={buildMessageFileUrl({
                discussionId: message.discussionId,
                fileName: media.lowQualityFileName,
                messageId: message.id,
              })}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </View>
      )}
    </Pressable>
  );
};

//
//
//
//
//

// With Docs

const messagesWithDocsFirstPageRequestedAtAtom = atom<Date | undefined>(
  undefined
);

const DocsTab = () => {
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    messagesWithDocsFirstPageRequestedAtAtom
  );

  const { theme } = useTheme();

  const route = useRoute();
  const { discussionId } = route.params as {
    discussionId: string;
  };

  useEffect(() => {
    if (firstPageRequestedAt === undefined) {
      setFirstPageRequestedAt(new Date());
    }
  }, []);

  const {
    data,
    isSuccess,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    isRefetching,
    refetch,
    isFetching,
  } = useDiscussionMessagesWithDocs({
    discussionId,
    firstPageRequestedAt,
  });

  const messages = data?.pages
    .map((page) => page.messages.map((message) => message).flat())
    .flat();

  const docs = messages
    ?.map((message) => message.docs.map((doc) => ({ ...doc, message })))
    .flat();

  const loadMoreDocs = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    setFirstPageRequestedAt(new Date());
  };

  useDidUpdate(() => {
    if (firstPageRequestedAt && !isFetching) {
      refetch();
    }
  }, [firstPageRequestedAt]);

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <>
          <DocItemLoader />
          <DocItemLoader />
          <DocItemLoader />
          <DocItemLoader />
          <DocItemLoader />
          <DocItemLoader />
        </>
      ) : isSuccess &&
        data.pages.length === 1 &&
        data.pages[0].messages.length === 0 ? (
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <MyText style={{ fontSize: 16, color: theme.gray500 }}>No doc</MyText>
        </View>
      ) : isSuccess ? (
        <FlatList
          refreshing={isRefetching && !isFetching}
          onRefresh={handleRefresh}
          data={docs}
          renderItem={({ item: { message, ...doc } }) => (
            <DocItem doc={doc} message={message} />
          )}
          keyboardShouldPersistTaps="handled"
          onEndReached={loadMoreDocs}
          initialNumToRender={18}
          onEndReachedThreshold={0.3}
          overScrollMode="never"
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <MyText style={{ fontSize: 16, color: theme.gray500 }}>
                No doc
              </MyText>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <>
                <DocItemLoader />
                <DocItemLoader />
                <DocItemLoader />
                <DocItemLoader />
              </>
            ) : null
          }
          {...flatListParams}
        />
      ) : isError ? (
        <View>
          <MyText style={{ textAlign: "center" }}>
            {(error as any).errors[0].message}
          </MyText>
        </View>
      ) : null}
    </View>
  );
};

const DocItemLoader = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        height: 50,
      }}
    >
      <Skeleton style={{ width: 20, height: 12, borderRadius: 200 }} />
      <Space width={20} />
      <Skeleton style={{ flex: 1, height: 12, borderRadius: 200 }} />
    </View>
  );
};

const DocItem = ({
  doc,
  message,
}: {
  message: Message;
  doc: Message["docs"][0];
}) => {
  const { theme } = useTheme();

  const download = async () => {
    // await downloadFile({
    //   url: buildMessageFileUrl({
    //     fileName: doc.fileName,
    //     messageId: message.id,
    //     discussionId: message.discussionId,
    //   }),
    //   name: doc.originalFileName,
    // });
  };

  return (
    <Pressable onPress={download} style={{ flex: 1 }}>
      {({ pressed }) => (
        <View
          key={doc.fileName}
          style={{
            borderBottomWidth: 0.2,
            borderColor: theme.gray200,
            height: 50,
            borderRadius: 4,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            backgroundColor: pressed ? theme.gray300 : theme.transparent,
          }}
        >
          <MaterialCommunityIcons
            name="file-outline"
            size={16}
            color={theme.gray950}
            style={{ marginRight: 20 }}
          />
          <View
            style={{
              paddingBottom: 2,
              overflow: "hidden",
              marginRight: 16,
              flex: 1,
            }}
          >
            <MyText numberOfLines={1} style={{ fontSize: 18 }}>
              {doc.originalFileName}
            </MyText>
          </View>

          <Pressable
            onPress={download}
            // onPress={onRemove}
          >
            <Feather name="download" size={18} color={theme.gray950} />
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

const renderScene = SceneMap({
  medias: MediasTab,
  docs: DocsTab,
});

const DiscussionMediasAndDocsScreen = () => {
  const { theme } = useTheme();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "medias", title: "Medias" },
    { key: "docs", title: "Docs" },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      style={{ backgroundColor: theme.white }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: theme.gray900 }}
          style={{ backgroundColor: theme.white }}
          // android_ripple={{ color: theme.transparent }}
          labelStyle={{
            textTransform: "capitalize",
            fontFamily: "NunitoSans_600SemiBold",
            fontSize: 16,
          }}
        />
      )}
    />
  );
};

export const discussionMediasAndDocsScreen = {
  name: discussionMediasAndDocsScreenName,
  component: DiscussionMediasAndDocsScreen,
  options: {
    animation: "ios",
    title: "",
  } as NativeStackNavigationOptions,
};
