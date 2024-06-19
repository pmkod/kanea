import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import {
  postLikesScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import { usePostLikes } from "@/hooks/use-post-likes";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { useTheme } from "@/hooks/use-theme";

import { User } from "@/types/user";
import { useDidUpdate } from "@mantine/hooks";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { FlatList, View } from "react-native";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const PostLikesScreen = () => {
  const { theme } = useTheme();
  const route = useRoute();
  const { post }: any = route.params;

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const navigation = useNavigation();

  const {
    data,
    isLoading,
    isSuccess,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    isFetching,
    isRefetching,
  } = usePostLikes({
    post,
    firstPageRequestedAt,
  });

  useEffect(() => {
    if (firstPageRequestedAt === undefined) {
      setFirstPageRequestedAt(new Date());
    }
    return () => {
      setFirstPageRequestedAt(undefined);
    };
  }, []);

  const postLikes = isSuccess
    ? data.pages.map((page) => page.postLikes).flat()
    : [];

  const loadMoreLikes = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const visitProfile = (user: User) => {
    navigation.navigate(userScreenName, {
      userName: user.userName,
    });
  };

  useDidUpdate(() => {
    if (firstPageRequestedAt && !isFetching) {
      refetch();
    }
  }, [firstPageRequestedAt]);

  const handleRefresh = () => {
    setFirstPageRequestedAt(new Date());
  };

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <>
          <UserRowItemLoader />
          <UserRowItemLoader />
          <UserRowItemLoader />
          <UserRowItemLoader />
          <UserRowItemLoader />
          <UserRowItemLoader />
        </>
      ) : isSuccess ? (
        <FlatList
          refreshing={isRefetching && !isFetching}
          onRefresh={handleRefresh}
          data={postLikes}
          numColumns={1}
          initialNumToRender={18}
          renderItem={({ item }) => {
            return (
              <UserRowItem
                key={item.id}
                user={item.liker}
                onPress={() => visitProfile(item.liker)}
              >
                <UserRowItemAvatar />
                <UserRowItemDisplayNameAndUserName />
              </UserRowItem>
            );
          }}
          keyExtractor={(item, index) => index.toString()}
          style={{
            flex: 1,
            backgroundColor: theme.white,
          }}
          overScrollMode="never"
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 30 }}>
              <MyText
                style={{
                  color: theme.gray400,
                }}
              >
                No like
              </MyText>
            </View>
          }
          onResponderEnd={loadMoreLikes}
          onEndReachedThreshold={0.3}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            isFetchingNextPage ? (
              <>
                <UserRowItemLoader />
                <UserRowItemLoader />
                <UserRowItemLoader />
              </>
            ) : null
          }
        />
      ) : null}
      <Space height={40} />
    </View>
  );
};

export const postLikesScreen = {
  name: postLikesScreenName,
  component: PostLikesScreen,
  options: {
    title: "Likes",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
