import React from "react";
import { Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { useTheme } from "@/hooks/use-theme";

interface ThemeItemProps {
  label: string;
  value: "light" | "dark";
  changeTheme: (value: "light" | "dark") => void;
}

const ThemeItem = ({ label, value, changeTheme }: ThemeItemProps) => {
  const { theme } = useTheme();
  const handlePress = () => {
    changeTheme(value);
  };
  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: 18,
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: pressed ? theme.gray100 : theme.white,
          }}
        >
          <MyText
            style={{ fontSize: 18, fontFamily: "NunitoSans_600SemiBold" }}
          >
            {label}
          </MyText>

          <View
            style={{
              width: 20,
              height: 20,
              padding: 2.5,
              borderWidth: 1.5,
              borderColor: theme.gray400,
              borderRadius: 50,
            }}
          >
            {value === theme.value && (
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme.gray700,
                  borderRadius: 50,
                }}
              ></View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default ThemeItem;
