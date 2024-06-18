import React from "react";
import { Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "../core/skeleton";
import Space from "../core/space";
import { formatStatNumber } from "@/utils/number-utils";

interface UserStatItemProps {
  label: string;
  value?: number;
  onPress?: () => void;
}

const UserStatItem = ({ label, value, onPress }: UserStatItemProps) => {
  const { theme } = useTheme();
  return (
    <Pressable onPress={onPress} style={{ alignItems: "flex-start" }}>
      <MyText
        style={{
          color: theme.gray900,
          fontFamily: "NunitoSans_600SemiBold",
          fontSize: 17,
        }}
      >
        {formatStatNumber(value || 0)}
      </MyText>
      <MyText style={{ color: theme.gray500, fontWeight: "500", fontSize: 13 }}>
        {label}
      </MyText>
    </Pressable>
  );
};

export default UserStatItem;

export const UserStatItemLoader = () => {
  return (
    <View>
      <Skeleton style={{ width: 30, height: 14, borderRadius: 8 }} />
      <Space height={10} />
      <Skeleton style={{ width: 60, height: 10, borderRadius: 30 }} />
    </View>
  );
};
