import { useTheme } from "@/hooks/use-theme";
import React, { forwardRef, LegacyRef } from "react";
import { Text, TextProps } from "react-native";

interface MyTextProps extends TextProps {}

const MyText = forwardRef(
  (
    { children, style, onPress, ...rest }: MyTextProps,
    ref: LegacyRef<Text>
  ) => {
    const { theme } = useTheme();

    return (
      <Text
        ref={ref}
        onPress={onPress}
        // textBreakStrategy=""
        style={[
          { fontFamily: "NunitoSans_400Regular", color: theme.gray900 },
          style,
        ]}
        // ellipsizeMode="tail"
        {...rest}
      >
        {children}
      </Text>
    );
  }
);

export default MyText;
