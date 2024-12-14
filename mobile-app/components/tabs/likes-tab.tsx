import { userProfileFlatListParams } from "@/constants/user-profile-constants";
import { User } from "@/types/user";
import { atom, useAtom } from "jotai";
import React, { useEffect } from "react";
import { View } from "react-native";
import { PostBoxItem, PostBoxItemLoader } from "../items/post-box-item";
import { useUserLikes } from "@/hooks/use-user-likes";
import MyText from "../core/my-text";
import { useTheme } from "@/hooks/use-theme";
import { useIsFocused } from "@react-navigation/native";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { Tabs } from "react-native-collapsible-tab-view";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Ionicons } from "@expo/vector-icons";

const firstPageRequestedAtAtom = atom(new Date());

const LikesTab = ({ user }: { user?: User }) => {
  const { theme } = useTheme();
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const { data: loggedInUserData } = useLoggedInUser({ enabled: false });

  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setFirstPageRequestedAt(new Date());
    }
  }, [isFocused]);

  const {
    data,
    isLoading,
    isPending,
    isSuccess,
    isError,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useUserLikes({
    user: user,
    firstPageRequestedAt,
    enabled: user !== undefined,
  });

  useRefreshOnScreenFocus(refetch);

  const likes = data?.pages.map((page) => page.postLikes).flat();

  const loadMoreLikes = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <>
      {user?.id !== loggedInUserData?.user.id ? (
        <Tabs.ScrollView>
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <View style={{ marginBottom: 12 }}>
              <Ionicons
                name="heart-outline"
                weight="light"
                size={40}
                color={theme.gray400}
              />
            </View>
            <MyText style={{ fontSize: 16, color: theme.gray400 }}>
              Likes are private
            </MyText>
          </View>
        </Tabs.ScrollView>
      ) : isLoading || isPending ? (
        <Tabs.FlatList
          initialNumToRender={9}
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
          renderItem={() => <PostBoxItemLoader />}
          keyExtractor={(_, index) => index.toString()}
          {...userProfileFlatListParams}
        />
      ) : isSuccess ? (
        <Tabs.FlatList
          data={likes}
          overScrollMode="never"
          initialNumToRender={18}
          renderItem={({ item, index }) => <PostBoxItem post={item.post} />}
          keyExtractor={(item, index) => index.toString()}
          onEndReached={loadMoreLikes}
          // onRefresh={}
          style={{ flex: 1 }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <View style={{ marginBottom: 12 }}>
                <Ionicons
                  name="heart-outline"
                  weight="light"
                  size={40}
                  color={theme.gray400}
                />
              </View>
              <MyText style={{ fontSize: 16, color: theme.gray400 }}>
                No likes
              </MyText>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <>
                <PostBoxItemLoader />
                <PostBoxItemLoader />
                <PostBoxItemLoader />
                <PostBoxItemLoader />
                <PostBoxItemLoader />
                <PostBoxItemLoader />
              </>
            ) : null
          }
          {...userProfileFlatListParams}
          // tabIndex={0}
        />
      ) : isError ? (
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <MyText style={{ fontSize: 16, color: theme.gray500 }}>
            {(error as any).errors[0].message}
          </MyText>
        </View>
      ) : null}
    </>
  );
};

export default LikesTab;
