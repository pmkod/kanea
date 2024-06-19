import { currentlyOpenPostIdAtom } from "@/atoms/currently-open-post-id-atom";
import { Button } from "@/components/core/button";
import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import { PostItem, PostItemLoader } from "@/components/items/post-item";
import { postScreenName } from "@/constants/screens-names-constants";
import { usePost } from "@/hooks/use-post";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { Ionicons } from "@expo/vector-icons";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useSetAtom } from "jotai";
import React, { useEffect } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

const PostScreen = () => {
  const route = useRoute();
  const { postId } = route.params as { postId: string };
  const setCurrentlyOpenPostId = useSetAtom(currentlyOpenPostIdAtom);
  const {
    data,
    isLoading,
    isSuccess,
    isError,
    isFetching,
    isRefetching,
    refetch,
  } = usePost(postId);
  const network = useNetInfo();
  const navigation = useNavigation();

  useRefreshOnScreenFocus(refetch);

  const goBack = () => {
    navigation.goBack();
  };

  useEffect(() => {
    setCurrentlyOpenPostId(postId);
    return () => {
      setCurrentlyOpenPostId(undefined);
    };
  }, []);

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isFetching}
          onRefresh={refetch}
        />
      }
      keyboardShouldPersistTaps="handled"
      style={{ paddingTop: 12 }}
    >
      {isLoading ? (
        <PostItemLoader />
      ) : isSuccess ? (
        <PostItem post={data.post} />
      ) : null}
      {isError && (
        <View
          style={{
            width: "100%",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 50,
          }}
        >
          {network.isConnected ? (
            <>
              <MyText style={{ fontSize: 20, marginBottom: 30 }}>
                Post not found
              </MyText>
              <Button
                size="lg"
                variant="outline"
                onPress={goBack}
                text="Go back"
              />
            </>
          ) : (
            <>
              <MyText
                style={{
                  marginBottom: 10,
                }}
              >
                <Ionicons name="cloud-offline-outline" size={60} />
              </MyText>

              <MyText style={{ fontSize: 20 }}>You are offline</MyText>
            </>
          )}
        </View>
      )}
      <Space height={10} />
    </ScrollView>
  );
};

export const postScreen = {
  name: postScreenName,
  component: PostScreen,
  options: {
    animation: "ios",
  } as NativeStackNavigationOptions,
};
