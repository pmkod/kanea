import SettingItem from "@/components/items/setting-item";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView } from "react-native";
import { changePasswordSettingsScreen } from "./change-password-settings-screen";
import {
  accountSettingsScreenName,
  changeEmailSettingsScreenName,
  changePasswordSettingsScreenName,
  changeUsernameSettingsScreenName,
} from "@/constants/screens-names-constants";

const AccountSettingsScreen = () => {
  return (
    <ScrollView
      style={{ flex: 1, paddingTop: 10 }}
      keyboardShouldPersistTaps="handled"
    >
      <SettingItem
        screenName={changeEmailSettingsScreenName}
        label="Change email"
      />
      <SettingItem
        screenName={changeUsernameSettingsScreenName}
        label="Change your username"
      />
      <SettingItem
        screenName={changePasswordSettingsScreenName}
        label="Change your password"
      />
    </ScrollView>
  );
};

export const accountSettingsScreen = {
  name: accountSettingsScreenName,
  component: AccountSettingsScreen,
  options: {
    title: "Account",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
