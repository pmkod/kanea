import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import {
  userFollowersScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { useTheme } from "@/hooks/use-theme";
import { useUserFollowers } from "@/hooks/use-user-followers";
import { User } from "@/types/user";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { FlatList, View } from "react-native";

const firstPageRequestedAtAtom = atom(new Date());

const UserFollowersScreen = () => {
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
  } = useUserFollowers({
    user,
    firstPageRequestedAt,
  });
  useRefreshOnScreenFocus(refetch);

  const follows = isSuccess
    ? data.pages.map((page) => page.follows).flat()
    : [];

  const loadMoreFollowers = () => {
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
                user={item.follower}
                onPress={() => visitProfile(item.follower)}
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
                No follower
              </MyText>
            </View>
          }
          onResponderEnd={loadMoreFollowers}
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

export const userFollowersScreen = {
  name: userFollowersScreenName,
  component: UserFollowersScreen,
  options: {
    title: "Followers",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
