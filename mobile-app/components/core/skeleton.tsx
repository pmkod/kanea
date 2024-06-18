import { useTheme } from "@/hooks/use-theme";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

interface SkeletonProps {
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({ style }: SkeletonProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.gray100,
        },
        style,
      ]}
    ></View>
  );
};
