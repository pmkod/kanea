import SettingItem from "@/components/items/setting-item";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";
import { ScrollView } from "react-native";
import {
  securitySettingsScreenName,
  sessionsSettingsScreenName,
} from "@/constants/screens-names-constants";

const SecuritySettingsScreen = () => {
  return (
    <ScrollView
      style={{ flex: 1, paddingTop: 10 }}
      keyboardShouldPersistTaps="handled"
    >
      <SettingItem screenName={sessionsSettingsScreenName} label="Sessions" />
    </ScrollView>
  );
};

export const securitySettingsScreen = {
  name: securitySettingsScreenName,
  component: SecuritySettingsScreen,
  options: {
    title: "Security",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
