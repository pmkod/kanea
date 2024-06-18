import { getNameInitials } from "@/utils/user-utils";
import React, { ReactNode } from "react";
import MyText from "./my-text";
import { Image, StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "@/hooks/use-theme";

interface AvatarProps {
  name?: string;
  src?: string;
  style?: StyleProp<ViewStyle>;
  width?: number;
  fallback?: ReactNode;
}

const Avatar = ({ width, src, name, style, fallback }: AvatarProps) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          width: width || 44,
          aspectRatio: "1/1",
          borderRadius: 5000,
          overflow: "hidden",

          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.gray200,
        },
        style,
      ]}
    >
      {src ? (
        <Image
          source={{
            uri: src,
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      ) : fallback ? (
        fallback
      ) : name ? (
        <MyText
          style={{
            color: theme.gray500,
            fontSize: width ? width * 0.38 : 16,
            textTransform: "uppercase",
            fontFamily: "NunitoSans_600SemiBold",
          }}
        >
          {getNameInitials(name)}
        </MyText>
      ) : null}
    </View>
  );
};

export default Avatar;
