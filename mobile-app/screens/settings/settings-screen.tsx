import SettingItem, { SettingItemProps } from "@/components/items/setting-item";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Pressable, ScrollView } from "react-native";
import Space from "@/components/core/space";
import MyText from "@/components/core/my-text";
import { useTheme } from "@/hooks/use-theme";
import NiceModal from "@ebay/nice-modal-react";
import { LogoutConfirmModal } from "@/components/modals/logout-confirm-modal";
import {
  accountSettingsScreenName,
  blockedUsersSettingsScreenName,
  onlineStatusSettingsScreenName,
  securitySettingsScreenName,
  settingsScreenName,
  themeSettingsScreenName,
} from "@/constants/screens-names-constants";

const SettingsScreen = () => {
  const { theme } = useTheme();

  const settingItems: SettingItemProps[] = [
    {
      id: 1,
      label: "Account",
      screenName: accountSettingsScreenName,
      leftIcon: <Feather size={24} name="user" color={theme.gray900} />,
    },
    {
      id: 2,
      label: "Security",
      screenName: securitySettingsScreenName,
      leftIcon: <Feather name="lock" size={24} color={theme.gray900} />,
    },
    {
      id: 3,
      label: "Theme",
      screenName: themeSettingsScreenName,
      leftIcon: <Feather name="sun" size={24} color={theme.gray950} />,
    },
    {
      id: 4,
      label: "Online status",
      screenName: onlineStatusSettingsScreenName,
      leftIcon: (
        <MaterialCommunityIcons
          name="message-badge-outline"
          size={24}
          color={theme.gray700}
        />
      ),
    },
    {
      id: 5,
      label: "Blocked users",
      screenName: blockedUsersSettingsScreenName,
      leftIcon: <Feather name="user-x" size={24} color={theme.gray900} />,
    },
  ];

  const openLogoutConfirmModal = () => {
    NiceModal.show(LogoutConfirmModal);
  };

  return (
    <ScrollView
      style={{
        flex: 1,
        paddingTop: 10,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {settingItems.map((settingItem) => (
        <SettingItem key={settingItem.id} {...settingItem} />
      ))}
      <Space height={20} />

      <Pressable
        onPress={openLogoutConfirmModal}
        style={{
          paddingHorizontal: 18,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Octicons
          name="sign-out"
          size={24}
          style={{ marginRight: 25 }}
          color={theme.destructive}
        />

        <MyText
          style={{
            fontSize: 18,
            color: theme.destructive,
            fontFamily: "NunitoSans_600SemiBold",
          }}
        >
          Logout
        </MyText>
      </Pressable>
    </ScrollView>
  );
};

export const settingsScreen = {
  name: settingsScreenName,
  component: SettingsScreen,
  options: {
    animation: "ios",
  } as NativeStackNavigationOptions,
};
