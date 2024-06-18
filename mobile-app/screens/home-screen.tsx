import { useEffect } from "react";
import { FlatList, Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { House } from "phosphor-react-native";
import { useNavigationState } from "@react-navigation/native";
import { atom, useAtom, useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { useFollowingTimeline } from "@/hooks/use-following-timeline";
import { PostItem, PostItemLoader } from "@/components/items/post-item";
import { Post } from "@/types/post";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { useKeyboard } from "@react-native-community/hooks";
import { useTheme } from "@/hooks/use-theme";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { homeScreenName } from "@/constants/screens-names-constants";
import { PublishPostButton } from "@/components/others/publish-post-button";

const firstPageRequestedAtAtom = atom<Date>(new Date());

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const keyboard = useKeyboard();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const webSocket = useAtomValue(webSocketAtom);

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFollowingTimeline({
    firstPageRequestedAt,
  });

  const posts = data?.pages.map((page) => page.posts).flat();

  const loadMorePosts = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  // const publishPostSuccessEvent = (eventData: { post: Post }) => {
  //   if (isSuccess) {

  //   }
  // };

  // useEffect(() => {
  //   webSocket?.on("publish-post-success", publishPostSuccessEvent);
  //   return () => {
  //     webSocket?.off("publish-post-success", publishPostSuccessEvent);
  //   };
  // }, [webSocket]);

  return (
    <View style={{ flex: 1, position: "relative" }}>
      {!keyboard.keyboardShown && <PublishPostButton />}
      {isLoading && <LogoOnHome />}

      {isLoading ? (
        <>
          <PostItemLoader />
          <PostItemLoader />
          <PostItemLoader />
        </>
      ) : isSuccess ? (
        <FlatList
          data={posts}
          numColumns={1}
          initialNumToRender={18}
          renderItem={({ item }) => <PostItem post={item} />}
          keyExtractor={(item, index) => index.toString()}
          style={{
            flex: 1,
            backgroundColor: theme.white,
            paddingTop: insets.top,
          }}
          overScrollMode="never"
          onResponderEnd={loadMorePosts}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={<LogoOnHome />}
          ListFooterComponent={
            isFetchingNextPage ? (
              <>
                <PostItemLoader />
                <PostItemLoader />
              </>
            ) : null
          }
        />
      ) : null}
    </View>
  );
};

export const homeScreen = {
  name: homeScreenName,
  component: HomeScreen,
  options: {
    tabBarIcon: ({ color, size, focused }) => <House color={color} size={28} />,
    headerShown: false,
  } as BottomTabNavigationOptions,
};
//
//
//
//
//

//
//
//
//
//

const LogoOnHome = () => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        height: 70,
        paddingLeft: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <Image
        source={
          theme.value === "light"
            ? require("../assets/kanea-logo-black-text.png")
            : require("../assets/kanea-logo-white-text.png")
        }
        style={{
          width: 50,
          height: 20,
        }}
      />
    </View>
  );
};
