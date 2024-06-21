import { IconButton } from "@/components/core/icon-button";
import { Input } from "@/components/core/input";
import MyText from "@/components/core/my-text";
import {
  DiscussionItem,
  DiscussionItemLoader,
} from "@/components/items/discussion-item";
import {
  discussionScreenName,
  searchDiscussionScreenName,
} from "@/constants/screens-names-constants";
import { useSearchDiscussion } from "@/hooks/use-search-discussions";
import { useTheme } from "@/hooks/use-theme";
import { Discussion } from "@/types/discussion";
import { RootStackParamList } from "@/types/routes";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useDebouncedValue } from "@mantine/hooks";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SearchDiscussionScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, any>>();

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);

  const clearQ = () => {
    setQ("");
  };

  const { data, isSuccess, isLoading } = useSearchDiscussion(debouncedQ, {
    enabled: debouncedQ.length > 0,
  });

  //   const { mutate: deleteSearchs } = useMutation({
  //     mutationFn: deleteSearchsRequest,
  //     onMutate: () => {
  //       queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
  //         ...qData,
  //         searchs: [],
  //       }));
  //     },
  //   });

  const goToDiscussion = (discussion: Discussion) => {
    // navigation.dispatch(
    //   StackActions.replace(, {
    // })
    // );
    navigation.replace(discussionScreenName, {
      discussionId: discussion.id,
    });
  };

  const goToPreviousScreen = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingRight: 22,
          paddingLeft: 10,
        }}
      >
        <IconButton onPress={goToPreviousScreen} variant="ghost">
          <Feather name="chevron-left" color={theme.gray800} size={24} />
        </IconButton>
        <View style={{ flex: 1, paddingVertical: 14, flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              position: "relative",
            }}
          >
            <Input autoFocus placeholder="Search" onChange={setQ} value={q} />
            {q.length > 0 && (
              <View
                style={{
                  justifyContent: "center",
                  position: "absolute",
                  right: 6,
                  top: 0,
                  height: "100%",
                }}
              >
                <IconButton onPress={clearQ} variant="ghost">
                  <MaterialIcons name="cancel" size={18} />
                </IconButton>
              </View>
            )}
          </View>
        </View>
      </View>
      <ScrollView
        style={{
          flex: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {debouncedQ.length === 0 ? (
          <View
            style={{
              justifyContent: "center",
              height: 120,
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Ionicons
              name="search-outline"
              size={30}
              style={{ marginBottom: 8 }}
              color={theme.gray400}
            />

            <MyText
              style={{
                marginBottom: 4,
                fontSize: 16,
                color: theme.gray400,
                textAlign: "center",
              }}
            >
              Search discussion
            </MyText>
          </View>
        ) : isLoading ? (
          <>
            <DiscussionItemLoader />
            <DiscussionItemLoader />
            <DiscussionItemLoader />
            <DiscussionItemLoader />
            <DiscussionItemLoader />
            <DiscussionItemLoader />
          </>
        ) : isSuccess && data.discussions.length === 0 ? (
          <View
            style={{
              justifyContent: "center",
              height: 120,
              alignItems: "center",
              paddingHorizontal: 20,
            }}
          >
            <Ionicons
              name="search-outline"
              size={30}
              style={{ marginBottom: 8 }}
              color={theme.gray400}
            />

            <MyText
              style={{
                marginBottom: 4,
                fontSize: 16,
                color: theme.gray400,
                textAlign: "center",
              }}
            >
              No discussion for this search
            </MyText>
          </View>
        ) : isSuccess ? (
          data.discussions.map((discussion) => (
            <DiscussionItem
              key={discussion.id}
              discussion={discussion}
              onPress={() => goToDiscussion(discussion)}
            />
          ))
        ) : null}
      </ScrollView>
    </View>
  );
};

export const searchDiscussionScreen = {
  name: searchDiscussionScreenName,
  component: SearchDiscussionScreen,
  options: {
    headerShown: false,
    animation: "none",
  } as NativeStackNavigationOptions,
};
