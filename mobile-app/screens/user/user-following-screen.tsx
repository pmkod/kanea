import {
  userFollowingScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import { useUserFollowing } from "@/hooks/use-user-following";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { FlatList, View } from "react-native";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import MyText from "@/components/core/my-text";
import { useTheme } from "@/hooks/use-theme";
import Space from "@/components/core/space";
import { User } from "@/types/user";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";

const firstPageRequestedAtAtom = atom(new Date());

const UserFollowingScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const route = useRoute();
  const { user }: any = route.params;

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setFirstPageRequestedAt(new Date());
    }
  }, [isFocused]);

  const {
    data,
    isLoading,
    isSuccess,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
  } = useUserFollowing({
    user,
    firstPageRequestedAt,
  });
  useRefreshOnScreenFocus(refetch);

  const follows = isSuccess
    ? data.pages.map((page) => page.follows).flat()
    : [];

  const loadMoreFollowing = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const visitProfile = (user: User) => {
    navigation.navigate(userScreenName, {
      userName: user.userName,
    });
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
          data={follows}
          numColumns={1}
          initialNumToRender={18}
          renderItem={({ item }) => {
            return (
              <UserRowItem
                key={item.id}
                user={item.followed}
                onPress={() => visitProfile(item.followed)}
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
                No following
              </MyText>
            </View>
          }
          onResponderEnd={loadMoreFollowing}
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

export const userFollowingScreen = {
  name: userFollowingScreenName,
  component: UserFollowingScreen,
  options: {
    title: "Following",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
