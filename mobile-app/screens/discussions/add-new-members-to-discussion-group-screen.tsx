import { webSocketAtom } from "@/atoms/web-socket-atom";
import { Button } from "@/components/core/button";
import MyText from "@/components/core/my-text";
import { SearchUserInput } from "@/components/inputs/search-user-input";
import { SelectedUserBubbleItem } from "@/components/items/selected-user-bubble-item";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import { addNewMembersToDiscussionGroupScreenName } from "@/constants/screens-names-constants";
import { useDiscussion } from "@/hooks/use-discussion";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import { useSearchUser } from "@/hooks/use-search-user";
import { useTheme } from "@/hooks/use-theme";
import { Discussion } from "@/types/discussion";
import { User } from "@/types/user";
import { maxMembersInGroupDiscussion } from "@/validation-schema/discussion-schema";
import { useDebouncedValue } from "@mantine/hooks";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";

export const AddNewMembersToDiscussionGroupScreen = () => {
  const route = useRoute();
  const { discussionId } = route.params as {
    discussionId: string;
  };
  const { theme } = useTheme();
  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);
  const navigation = useNavigation();
  const network = useNetInfo();
  const [isAddingNewMembers, setIsAddingNewMembers] = useState(false);

  const webSocket = useAtomValue(webSocketAtom);

  const { data, isSuccess, isLoading, isPending } = useSearchUser({
    debouncedQ,
  });

  const [selectedUsers, setSelectedUsers] = useState<Map<string, User>>(
    new Map()
  );

  const { data: discussionData } = useDiscussion(discussionId, {
    enabled: true,
  });

  const addUsersToDiscussionGroup = async () => {
    if (!network.isConnected) {
      Toast.show({ type: "error", text2: "You are offline" });
      return;
    }
    setIsAddingNewMembers(true);
    const newMemberIds = Array.from(selectedUsers.values()).map((u) => u.id);
    webSocket?.emit("add-members-to-group-discussion", {
      newMemberIds,
      discussionId,
    });
  };

  const notifyThatUserAlreadySelected = () => {
    Toast.show({ type: "info", text2: "User already selected" });
  };

  const selectUser = (user: User) => {
    if (discussionData === undefined) {
      return;
    }
    const membersValid =
      discussionData.discussion.members.length + selectedUsers.size <
      maxMembersInGroupDiscussion;
    if (!membersValid) {
      Toast.show({
        type: "error",
        text2: `You can't add more members`,
      });
      return;
    }
    if (isUserAlreadyInGroupDiscussion(user)) {
      Toast.show({
        type: "error",
        text2: "User already in group",
      });
      return;
    }
    setSelectedUsers((prevState) => {
      prevState.set(user.id, user);
      return new Map(prevState);
    });
    setQ("");
  };

  const isUserAlreadyInGroupDiscussion = (user: User) => {
    if (isSuccess) {
      if (
        discussionData?.discussion.members.find(
          ({ userId }) => userId === user.id
        ) !== undefined
      ) {
        return true;
      }
    }
    return false;
  };

  const unSelectUser = (user: User) => {
    setSelectedUsers((prevState) => {
      prevState.delete(user.id);
      return new Map(prevState);
    });
  };

  const addMembersToGroupDiscussionSuccess = (eventData: {
    discussion: Discussion;
  }) => {
    Toast.show({ type: "success", text2: "New members added" });
    // modal.hide();
    navigation.goBack();
    setIsAddingNewMembers(false);
  };

  const addMembersToGroupDiscussionError = (eventData: {
    message: string;
    user?: User;
  }) => {
    if (eventData.user) {
      Toast.show({
        type: "error",
        text2: `${eventData.user.displayName} already in group`,
      });
    } else {
      Toast.show({ type: "error", text2: eventData.message });
    }
    setIsAddingNewMembers(false);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            isLoading={isAddingNewMembers}
            size="md"
            text="Save"
            onPress={addUsersToDiscussionGroup}
          />
        );
      },
    });
  }, [isAddingNewMembers, navigation, addUsersToDiscussionGroup]);

  useListenWebsocketEvent({
    name: "add-members-to-group-discussion-success",
    handler: addMembersToGroupDiscussionSuccess,
  });
  useListenWebsocketEvent({
    name: "add-members-to-group-discussion-error",
    handler: addMembersToGroupDiscussionError,
  });

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
            borderBottomWidth: selectedUsers.size > 0 ? 1 : 0,
            borderBottomColor: theme.gray200,

            // flex: 1,
          }}
          contentContainerStyle={{
            gap: 16,

            paddingHorizontal: 20,
            paddingVertical: selectedUsers.size > 0 ? 12 : 0,
          }}
        >
          {Array.from(selectedUsers.values()).map((user) => (
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
            const userSelected = selectedUsers.has(user.id);
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

export const addNewMembersToDiscussionGroupScreen = {
  name: addNewMembersToDiscussionGroupScreenName,
  component: AddNewMembersToDiscussionGroupScreen,
  options: {
    title: "Add new members",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
