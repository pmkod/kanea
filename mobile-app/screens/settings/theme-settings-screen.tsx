import ThemeItem from "@/components/items/theme-item";
import { themes } from "@/styles/themes";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@/hooks/use-theme";
import { themeSettingsScreenName } from "@/constants/screens-names-constants";

const ThemeSettingsScreen = () => {
  const { setTheme } = useTheme();

  const changeTheme = async (value: "light" | "dark") => {
    setTheme(themes[value]);
    await AsyncStorage.setItem("theme", value);
  };
  return (
    <View style={{ paddingTop: 10 }}>
      <ThemeItem label="Light" value="light" changeTheme={changeTheme} />
      <ThemeItem label="Dark" value="dark" changeTheme={changeTheme} />
    </View>
  );
};

export const themeSettingsScreen = {
  name: themeSettingsScreenName,
  component: ThemeSettingsScreen,
  options: {
    title: "Theme",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
