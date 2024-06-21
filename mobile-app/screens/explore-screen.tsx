import React, { useEffect } from "react";
import { FlatList, Pressable, View } from "react-native";
import {
  PostBoxItem,
  PostBoxItemLoader,
} from "../components/items/post-box-item";
import { useNavigation } from "@react-navigation/native";
import { atom, useAtom } from "jotai";
import { useExplore } from "@/hooks/use-explore";
import { useTheme } from "@/hooks/use-theme";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { Input } from "@/components/core/input";
import {
  exploreScreenName,
  searchUserScreenName,
} from "@/constants/screens-names-constants";
import { useDidUpdate } from "@mantine/hooks";
import { Feather } from "@expo/vector-icons";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);
const ExploreScreen = () => {
  const numColumns = 3;
  const contentContainerStyle = { gap: 2 };
  const columnWrapperStyle = { gap: 2 };
  const navigation = useNavigation();
  const { theme } = useTheme();

  const goToSearchUserScreen = () => {
    navigation.navigate(searchUserScreenName);
  };
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
    isSuccess,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isRefetching,
    isFetching,
    refetch,
  } = useExplore({ firstPageRequestedAt });

  const posts = isSuccess ? data.pages.map((page) => page.posts).flat() : [];

  const loadMorePosts = () => {
    if (hasNextPage) {
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
      <View
        style={{
          padding: 14,
        }}
      >
        <Pressable
          onPress={goToSearchUserScreen}
          style={{
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Input placeholder="Search user" />
          <View
            style={{
              // flex: 1,
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: 30,
              backgroundColor: theme.transparent,
            }}
          ></View>
        </Pressable>
      </View>

      {isLoading ? (
        <FlatList
          data={Array.from({ length: 18 }, (_, i) => i + 1)}
          initialNumToRender={18}
          numColumns={numColumns}
          contentContainerStyle={contentContainerStyle}
          columnWrapperStyle={columnWrapperStyle}
          renderItem={() => <PostBoxItemLoader />}
          keyExtractor={(_, index) => index.toString()}
        />
      ) : isSuccess ? (
        <FlatList
          data={posts}
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          numColumns={numColumns}
          initialNumToRender={18}
          contentContainerStyle={contentContainerStyle}
          columnWrapperStyle={columnWrapperStyle}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => <PostBoxItem post={item} />}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <FlatList
                data={Array.from({ length: 6 }, (_, i) => i + 1)}
                numColumns={numColumns}
                initialNumToRender={6}
                contentContainerStyle={contentContainerStyle}
                columnWrapperStyle={columnWrapperStyle}
                renderItem={() => <PostBoxItemLoader />}
                keyExtractor={(_, index) => index.toString()}
              />
            ) : null
          }
        />
      ) : null}
    </View>
  );
};

export const exploreScreen = {
  name: exploreScreenName,
  component: ExploreScreen,
  options: {
    tabBarIcon: ({ color, size, focused }) => (
      <Feather name="search" color={color} size={25} />
    ),
    headerShown: false,
  } as BottomTabNavigationOptions,
};
