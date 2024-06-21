import { webSocketAtom } from "@/atoms/web-socket-atom";
import { SearchUserInput } from "@/components/inputs/search-user-input";
import {
  discussionsScreenName,
  newDiscussionGroupStepTwoScreenName,
} from "@/constants/screens-names-constants";
import { useSearchUser } from "@/hooks/use-search-user";
import { User } from "@/types/user";
import { maxMembersInGroupDiscussionOnCreation } from "@/validation-schema/discussion-schema";
import { useDebouncedValue } from "@mantine/hooks";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { useQueryClient } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { Discussion } from "@/types/discussion";
import { discussionsQueryKey } from "@/constants/query-keys";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import MyText from "@/components/core/my-text";
import { useTheme } from "@/hooks/use-theme";
import { RootStackParamList } from "@/types/routes";
import { Button } from "@/components/core/button";
import { newGroupDiscussionAtom } from "./new-discussion-group-step-one-screen";
import { bottomTabNavigatorName } from "@/constants/navigators-names-constants";
import { SelectedUserBubbleItem } from "@/components/items/selected-user-bubble-item";

export const isGroupCreationgAtom = atom(false);

const NewDiscussionGroupStepTwoScreen = () => {
  const { theme } = useTheme();
  const network = useNetInfo();

  const [newGroupDiscussion, setNewGroupDiscussion] = useAtom(
    newGroupDiscussionAtom
  );

  const [isGroupCreationg, setIsGroupCreating] = useAtom(isGroupCreationgAtom);

  const webSocket = useAtomValue(webSocketAtom);

  const queryClient = useQueryClient();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, any>>();

  const createGroupDiscussion = () => {
    if (!network.isConnected) {
      Toast.show({
        type: "error",
        text2: "You are offline",
      });
      return;
    }
    setIsGroupCreating(true);
    const data: any = {
      name: newGroupDiscussion.name,
      memberIds: newGroupDiscussion.members.map((u) => u.id),
    };
    if (newGroupDiscussion.picture) {
      data.picture = {
        file: newGroupDiscussion.picture.file,
      };
    }
    webSocket?.emit("create-group-discussion", data);
  };

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);

  const { data, isSuccess, isLoading, isPending } = useSearchUser({
    debouncedQ,
  });

  const selectUser = async (user: User) => {
    const membersValid =
      newGroupDiscussion.members.length < maxMembersInGroupDiscussionOnCreation;
    if (!membersValid) {
      Toast.show({
        type: "error",
        text2: `You can choose a maximum of ${maxMembersInGroupDiscussionOnCreation} members`,
      });
      return;
    }
    setNewGroupDiscussion((prevNewGroupDiscussion) => ({
      ...newGroupDiscussion,
      members: [...prevNewGroupDiscussion.members, user],
    }));
    setQ("");
  };

  const unSelectUser = (user: User) => {
    setNewGroupDiscussion((prevNewGroupDiscussion) => ({
      ...newGroupDiscussion,
      members: prevNewGroupDiscussion.members.filter((u) => u.id !== user.id),
    }));
  };

  const isUserSelected = (user: User) => {
    return (
      newGroupDiscussion.members.find((u) => u.id === user.id) !== undefined
    );
  };

  const createGroupDiscussionSuccessEvent = (eventData: {
    discussion: Discussion;
  }) => {
    const discussionQueryState = queryClient.getQueryState([
      discussionsQueryKey,
    ]);
    if (
      // screenName === discussionScreenName &&
      discussionQueryState?.status === "success"
    ) {
      queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any, pageIndex: number) => ({
            ...pageData,
            discussions:
              pageIndex === 0
                ? [eventData.discussion, ...pageData.discussions]
                : pageData.discussions,
          })),
        };
      });
    }
    Toast.show({ type: "info", text2: "Group created" });
    setNewGroupDiscussion({ name: undefined, picture: undefined, members: [] });
    navigation.replace(bottomTabNavigatorName);
    navigation.replace(discussionsScreenName);
    setIsGroupCreating(false);
  };

  const createGroupDiscussionError = (eventData: { message: string }) => {
    Toast.show({ type: "error", text2: eventData.message });
    setIsGroupCreating(false);
  };

  useEffect(() => {
    webSocket?.on(
      "create-group-discussion-success",
      createGroupDiscussionSuccessEvent
    );
    webSocket?.on("create-group-discussion-error", createGroupDiscussionError);

    return () => {
      webSocket?.off(
        "create-group-discussion-success",
        createGroupDiscussionSuccessEvent
      );
      webSocket?.on(
        "create-group-discussion-error",
        createGroupDiscussionError
      );
    };
  }, [webSocket]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            size="md"
            text="Create"
            onPress={createGroupDiscussion}
            isLoading={isGroupCreationg}
          />
        );
      },
    });
  }, [navigation, createGroupDiscussion]);

  const notifyThatUserAlreadySelected = () => {
    Toast.show({ type: "info", text2: "User already selected" });
  };
  return (
    <View style={{ flex: 1 }}>
      <SearchUserInput
        placeholder="Search for a user to add"
        text={q}
        onChangeText={setQ}
      />
      <View
        style={{
          // height: 100,
          width: "100%",
        }}
      >
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="never"
          style={{
            borderBottomWidth: newGroupDiscussion.members.length > 0 ? 1 : 0,
            borderBottomColor: theme.gray200,

            // flex: 1,
          }}
          contentContainerStyle={{
            gap: 16,

            paddingHorizontal: 20,
            paddingVertical: newGroupDiscussion.members.length > 0 ? 12 : 0,
          }}
        >
          {newGroupDiscussion.members.map((user) => (
            <SelectedUserBubbleItem
              key={user.id}
              user={user}
              onRemove={() => unSelectUser(user)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: 8, flex: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <>
            <UserRowItemLoader />
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
            Search user
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
          data.users.map((user) => {
            const userSelected = isUserSelected(user);
            return (
              <View key={user.id} style={{ opacity: userSelected ? 0.5 : 1 }}>
                <UserRowItem
                  user={user}
                  onPress={() =>
                    userSelected
                      ? notifyThatUserAlreadySelected()
                      : selectUser(user)
                  }
                >
                  <UserRowItemAvatar />
                  <UserRowItemDisplayNameAndUserName />
                </UserRowItem>
              </View>
            );
          })
        ) : null}
      </ScrollView>
    </View>
  );
};

export const newDiscussionGroupStepTwoScreen = {
  name: newDiscussionGroupStepTwoScreenName,
  component: NewDiscussionGroupStepTwoScreen,
  options: {
    title: "New group",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
