import { DiscussionsList } from "./discussions-list";
import { View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/use-theme";
import { useNavigation } from "@react-navigation/native";
import {
  discussionsScreenName,
  newDiscussionGroupStepOneScreenName,
  newMessageScreenName,
  searchDiscussionScreenName,
} from "@/constants/screens-names-constants";
import { IconButton } from "@/components/core/icon-button";

const DicussionsScreen = () => {
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
        gap: 8,
      }}
    >
      <IconButton onPress={goToSearchDiscussionScreen} variant="ghost">
        <Feather name="search" color={theme.gray900} size={21} />
      </IconButton>
      <IconButton variant="ghost" onPress={openCreateDiscussionGroupModal}>
        <MaterialCommunityIcons name="account-group-outline" size={28} />
      </IconButton>

      <IconButton variant="ghost" onPress={openNewMessageModal}>
        <MaterialCommunityIcons
          name="email-plus-outline"
          size={23}
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
      <Feather name="message-circle" color={color} size={25} />
    ),
    headerRight: () => <DiscussionScreenHeaderRight />,
  } as BottomTabNavigationOptions,
};
