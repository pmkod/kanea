import MyText from "@/components/core/my-text";
import { SearchUserInput } from "@/components/inputs/search-user-input";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import {
  discussionScreenName,
  newMessageScreenName,
} from "@/constants/screens-names-constants";
import { useSearchUser } from "@/hooks/use-search-user";
import { useTheme } from "@/hooks/use-theme";
import { checkIfDiscussionBetweenMeAndAnUserExistRequest } from "@/services/discussion-service";
import { RootStackParamList } from "@/types/routes";
import { User } from "@/types/user";
import { useDebouncedValue } from "@mantine/hooks";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const NewMessageScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, any>>();

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);
  const { theme } = useTheme();

  const [isCheckingIfDiscussionExist, setIsCheckingIfDiscussionExist] =
    useState(false);

  const { data, isSuccess, isLoading, isPending } = useSearchUser({
    debouncedQ,
  });

  const openDiscussion = async (user: User) => {
    setIsCheckingIfDiscussionExist(true);

    try {
      const data = await checkIfDiscussionBetweenMeAndAnUserExistRequest(
        user.id
      );
      navigation.replace(discussionScreenName, {
        discussionId: data.discussion.id,
      });
    } catch (error) {

      navigation.replace(discussionScreenName, {
        newInterlocutor: user,
      });
    }
    setIsCheckingIfDiscussionExist(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        isCheckingIfDiscussionExist && (
          <ActivityIndicator
            color={theme.gray900}
            size={17}
            style={{ paddingTop: 10 }}
          />
        ),
    });
  }, [isCheckingIfDiscussionExist, theme]);

  return (
    <View style={{ flex: 1 }}>
      <SearchUserInput placeholder="Search user" text={q} onChangeText={setQ} />

      <View>
        {isLoading ? (
          <>
            <UserRowItemLoader />
            <UserRowItemLoader />
            <UserRowItemLoader />
            <UserRowItemLoader />
          </>
        ) : isPending ? (
          <MyText
            style={{
              paddingTop: 30,
              textAlign: "center",
              color: theme.gray500,
            }}
          >
            Start to search user
          </MyText>
        ) : isSuccess && data.users.length === 0 ? (
          <MyText
            style={{
              paddingTop: 30,
              textAlign: "center",
              color: theme.gray500,
            }}
          >
            No user found for this search
          </MyText>
        ) : isSuccess ? (
          data.users.map((user) => (
            <UserRowItem
              key={user.id}
              user={user}
              onPress={() => openDiscussion(user)}
            >
              <UserRowItemAvatar />
              <UserRowItemDisplayNameAndUserName />
            </UserRowItem>
          ))
        ) : null}
      </View>
    </View>
  );
};

export const newMessageScreen = {
  name: newMessageScreenName,
  component: NewMessageScreen,
  options: {
    title: "New message",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
