import { CaretRight } from "phosphor-react-native";
import React, { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import MyText from "../core/my-text";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/use-theme";

export interface SettingItemProps {
  id?: number;
  label: string;
  screenName: string;
  leftIcon?: ReactNode;
  description?: string;
}

const SettingItem = ({
  id,
  label,
  leftIcon,
  screenName,
  description,
}: SettingItemProps) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const handlePress = () => {
    navigation.navigate(screenName);
  };
  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: 18,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: pressed ? theme.gray100 : theme.white,
          }}
        >
          {leftIcon && <View style={{ marginRight: 20 }}>{leftIcon}</View>}
          <View style={{ flex: 1, paddingBottom: 4 }}>
            <MyText
              style={{ fontSize: 18, fontFamily: "NunitoSans_600SemiBold" }}
            >
              {label}
            </MyText>
            {description && <Text>{description}</Text>}
          </View>

          <CaretRight size={16} color={theme.gray500} />
        </View>
      )}
    </Pressable>
  );
};

export default SettingItem;
