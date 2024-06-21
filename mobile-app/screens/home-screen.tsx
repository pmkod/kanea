import { FlatList, Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { atom, useAtom } from "jotai";
import { useFollowingTimeline } from "@/hooks/use-following-timeline";
import { PostItem, PostItemLoader } from "@/components/items/post-item";
import { useKeyboard } from "@react-native-community/hooks";
import { useTheme } from "@/hooks/use-theme";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { homeScreenName } from "@/constants/screens-names-constants";
import { PublishPostButton } from "@/components/others/publish-post-button";
import WhoToFollowWhenLoggedInUserHasNotFollowing from "@/components/others/who-to-follow-when-logged-in-user-has-not-following";
import { useDidUpdate } from "@mantine/hooks";
import { useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const keyboard = useKeyboard();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  useEffect(() => {
    if (firstPageRequestedAt === undefined) {
      setFirstPageRequestedAt(new Date());
    }
  }, []);

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isFetching,
  } = useFollowingTimeline({
    firstPageRequestedAt,
  });

  useDidUpdate(() => {
    if (firstPageRequestedAt && !isFetching) {
      refetch();
    }
  }, [firstPageRequestedAt]);

  const posts = data?.pages.map((page) => page.posts).flat();

  const loadMorePosts = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const refresh = () => {
    setFirstPageRequestedAt(new Date());
  };

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
      ) : isSuccess && data.pages[0].posts.length === 0 ? (
        <WhoToFollowWhenLoggedInUserHasNotFollowing />
      ) : isSuccess ? (
        <FlatList
          data={posts}
          numColumns={1}
          refreshing={isRefetching}
          onRefresh={refresh}
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
    tabBarIcon: ({ color, size, focused }) => (
      <MaterialCommunityIcons
        name="home-minus-outline"
        color={color}
        size={27}
      />
    ),
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
