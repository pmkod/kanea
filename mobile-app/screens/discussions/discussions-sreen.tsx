import React, { useEffect } from "react";
import { DiscussionsList } from "./discussions-list";
import { View } from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/use-theme";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import {
  discussionsScreenName,
  newDiscussionGroupStepOneScreenName,
  newMessageScreenName,
  searchDiscussionScreenName,
} from "@/constants/screens-names-constants";
import { IconButton } from "@/components/core/icon-button";
import { useSetAtom } from "jotai";
import { newGroupDiscussionAtom } from "./new-discussion-group-step-one-screen";

const DicussionsScreen = () => {
  const isFocused = useIsFocused();

  const setNewGroupDiscussion = useSetAtom(newGroupDiscussionAtom);

  useEffect(() => {
    if (!isFocused) {
      setNewGroupDiscussion({
        name: undefined,
        picture: undefined,
        members: [],
      });
    }
  }, [isFocused]);
  return (
    <View style={{ flex: 1 }}>
      <DiscussionsList />
    </View>
  );
};

export const DiscussionScreenHeaderRight = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const goToSearchDiscussionScreen = () => {
    navigation.navigate(searchDiscussionScreenName);
  };
  const openCreateDiscussionGroupModal = () => {
    navigation.navigate(newDiscussionGroupStepOneScreenName);
  };
  const openNewMessageModal = () => {
    navigation.navigate(newMessageScreenName);
  };

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        marginRight: 14,
        gap: 6,
      }}
    >
      <IconButton onPress={goToSearchDiscussionScreen} variant="ghost">
        <Ionicons name="search-outline" size={25} color={theme.gray900} />
      </IconButton>
      <IconButton variant="ghost" onPress={openCreateDiscussionGroupModal}>
        <MaterialIcons name="group-add" size={24} color={theme.gray900} />
      </IconButton>

      <IconButton variant="ghost" onPress={openNewMessageModal}>
        <MaterialCommunityIcons
          name="email-plus-outline"
          size={24}
          color={theme.gray900}
        />
      </IconButton>
    </View>
  );
};

export const discussionsScreen = {
  name: discussionsScreenName,
  component: DicussionsScreen,
  options: {
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons name="chatbubble-outline" color={color} size={28} />
    ),
    headerRight: () => <DiscussionScreenHeaderRight />,
  } as BottomTabNavigationOptions,
};
