import { View } from "react-native";
import { PostBoxItem, PostBoxItemLoader } from "../items/post-box-item";
import { useUserPosts } from "@/hooks/use-user-posts";
import { useEffect } from "react";
import { User } from "@/types/user";
import { atom, useAtom } from "jotai";
import { userProfileFlatListParams } from "@/constants/user-profile-constants";
import MyText from "../core/my-text";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "../core/button";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { publishPostScreenName } from "@/constants/screens-names-constants";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { Tabs } from "react-native-collapsible-tab-view";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

export const PostsTab = ({ user }: { user?: User }) => {
  const { data: loggedInUserData } = useLoggedInUser();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      setFirstPageRequestedAt(new Date());
    } else {
      setFirstPageRequestedAt(undefined);
    }
  }, [isFocused]);

  const {
    data,
    isLoading,
    isPending,
    isSuccess,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
    error,
  } = useUserPosts({
    user: user,
    firstPageRequestedAt,
    enabled: user !== undefined && firstPageRequestedAt !== undefined,
  });
  useRefreshOnScreenFocus(refetch);

  const posts = data?.pages.map((page) => page.posts).flat();

  const goToPublishPostScreen = () => {
    navigation.navigate(publishPostScreenName);
  };

  const loadMoreUserPosts = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const refresh = () => {
  };

  return (
    <>
      {isLoading || isPending || user === undefined ? (
        <Tabs.FlatList
          initialNumToRender={9}
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
          renderItem={() => <PostBoxItemLoader />}
          keyExtractor={(_, index) => index.toString()}
          {...userProfileFlatListParams}
        />
      ) : isSuccess ? (
        <Tabs.FlatList
          data={posts}
          onEndReached={loadMoreUserPosts}
          onEndReachedThreshold={0.3}
          // refreshControl={
          // <View
          //   style={{
          //     backgroundColor: "blue",
          //     position: "absolute",
          //     top: 0,
          //     zIndex: 500,
          //   }}
          // >
          // <RefreshControl
          //   refreshing={true}
          //   onRefresh={refresh}
          //   style={{ position: "absolute", top: 0, left: 0 }}
          // />
          // </View>
          // }
          // onRefresh={}
          overScrollMode="never"
          initialNumToRender={18}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <View style={{ marginBottom: 6 }}>
                <Feather
                  name="camera"
                  weight="light"
                  size={40}
                  color={theme.gray400}
                />
              </View>
              <MyText style={{ fontSize: 16, color: theme.gray500 }}>
                {user.userName === loggedInUserData?.user.userName
                  ? "You have not published a post"
                  : "No post from this user"}
              </MyText>
              {user.userName === loggedInUserData?.user.userName && (
                <View style={{ marginTop: 38 }}>
                  <Button
                    variant="outline"
                    onPress={goToPublishPostScreen}
                    text="Publish your first post"
                    leftDecorator={
                      <MaterialCommunityIcons name="plus" size={16} />
                    }
                  ></Button>
                </View>
              )}
            </View>
          }
          renderItem={({ item, index }) => <PostBoxItem post={item} />}
          keyExtractor={(item, index) => index.toString()}
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
