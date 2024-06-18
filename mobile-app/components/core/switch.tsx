import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { Pressable, View } from "react-native";

interface SwitchProps {
  value?: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Switch = ({ disabled, value, onValueChange }: SwitchProps) => {
  const { theme } = useTheme();
  const handlePress = () => {
    if (!disabled) {
      onValueChange(value ? !value : false);
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: 44,
        height: 24,
        backgroundColor: disabled
          ? theme.gray200
          : value
          ? theme.gray950
          : theme.gray300,
        borderRadius: 50,
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: 3,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          backgroundColor: disabled ? theme.gray300 : theme.white,
          borderRadius: 50,
          marginLeft: value ? "auto" : 0,
        }}
      ></View>
    </Pressable>
  );
};
