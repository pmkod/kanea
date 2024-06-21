import { useTheme } from "@/hooks/use-theme";
import { cloneElement, ReactElement, ReactNode } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
} from "react-native";

interface IconButtonProps extends PressableProps {
  variant?: "fill" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl";
  colorScheme?: "primary" | "destructive";
  isLoading?: boolean;
  rounded?: "md" | "full";
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  children?: ReactNode;
}

//
//
//
//
//

export const IconButton = ({
  onPress,
  children,
  variant = "fill",
  colorScheme = "primary",
  disabled = false,
  isLoading = false,
  size = "md",
  rounded = "md",
}: IconButtonProps) => {
  const { theme } = useTheme();

  type VariantAndColorScheme =
    `${IconButtonProps["variant"]}-${IconButtonProps["colorScheme"]}`;
  const variantAndColorScheme = (variant +
    "-" +
    colorScheme) as VariantAndColorScheme;
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={[
            iconButtonStyles.base,
            iconButtonSizeStyle[size],
            iconButtonBorderRadiusStyle[rounded],
            iconButtonColors(variantAndColorScheme, theme),
            {
              opacity: disabled ? 0.7 : pressed || isLoading ? 0.7 : 1,
            },
            isLoading && variant === "fill"
              ? {
                  borderWidth: 0,
                  // padding: 1,
                }
              : {},
          ]}
        >
          {isLoading ? (
            <ActivityIndicator
              size={activityIndicatorSize(size)}
              color={iconColor(variantAndColorScheme, theme)}
            />
          ) : (
            cloneElement(children as ReactElement, {
              color: iconColor(variantAndColorScheme, theme),
            })
          )}
        </View>
      )}
    </Pressable>
  );
};

const iconButtonStyles = StyleSheet.create({
  base: {
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
    overflow: "hidden",
    aspectRatio: "1/1",
  },
});

const iconButtonSizeStyle = StyleSheet.create({
  sm: {
    height: 28,
  },

  md: {
    height: 35,
  },
  lg: {
    height: 42,
  },
  xl: {
    height: 50,
  },
});

export const iconColor = (variantAndColorScheme: string, theme: any) => {
  let color = theme["gray900"];
  if (variantAndColorScheme === "fill-primary") {
    color = theme["white"];
  } else if (variantAndColorScheme === "outline-primary") {
    color = theme["gray900"];
  } else if (variantAndColorScheme === "outline-destructive") {
    color = theme["destructive"];
  } else if (variantAndColorScheme === "ghost-destructive") {
    color = theme["destructive"];
  }
  return color;
};

const iconButtonBorderRadiusStyle = StyleSheet.create({
  md: {
    borderRadius: 4,
  },
  full: {
    borderRadius: 140,
  },
});

export const iconButtonColors = (variantAndColorScheme: string, theme: any) => {
  let colors = {
    backgroundColor: theme["gray950"],
    borderColor: theme["gray950"],
  };

  if (variantAndColorScheme === "fill-destructive") {
    colors.backgroundColor = theme["destructive"];
    colors.borderColor = theme["destructive"];
  } else if (variantAndColorScheme === "outline-primary") {
    colors.backgroundColor = "transparent";
    colors.borderColor = theme["gray400"];
  } else if (variantAndColorScheme === "outline-destructive") {
    colors.backgroundColor = "transparent";
    colors.borderColor = theme["gray400"];
  } else if (variantAndColorScheme === "ghost-primary") {
    colors.backgroundColor = "transparent";
    colors.borderColor = "transparent";
  } else if (variantAndColorScheme === "ghost-destructive") {
    colors.backgroundColor = "transparent";
    colors.borderColor = "transparent";
  }
  return colors;
};

export const activityIndicatorSize = (
  buttonSize: IconButtonProps["size"]
): "small" | "large" => {
  let size: "small" | "large" = "small";
  if (buttonSize === "xl") {
    size = "large";
  }
  return size;
};
