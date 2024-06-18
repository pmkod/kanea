import { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import MyText from "./my-text";
import { useTheme } from "@/hooks/use-theme";

interface AlertProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  status?: "destructive" | "success";
  variant?: "outline" | "fill";
  style?: StyleProp<ViewStyle>;
}

export const Alert = ({
  icon,
  title,
  description,
  status = "success",
  variant = "fill",
  style,
}: AlertProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 14,
          paddingTop: 7,
          paddingBottom: 10,
          borderRadius: 4,
          backgroundColor: alertBackgroundColor({
            status,
            variant,
            theme,
          }),
          borderWidth: 1,
          borderColor: alertBorderColor({
            status,
            variant,
            theme,
          }),
        },
        style,
      ]}
    >
      {icon && <View>{icon}</View>}

      <View>
        {title && (
          <MyText
            style={{
              color: alertTextColor({
                status,
                variant,
                theme,
              }),
              fontFamily: "NunitoSans_600SemiBold",
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            {title}
          </MyText>
        )}
        {description && (
          <MyText
            style={{
              color: alertTextColor({
                status,
                variant,
                theme,
              }),
            }}
          >
            {description}
          </MyText>
        )}
      </View>
    </View>
  );
};

//
//
//
//
//

const alertBackgroundColor = ({
  variant,
  status,
  theme,
}: {
  variant: AlertProps["variant"];
  status: AlertProps["status"];
  theme: any;
}) => {
  let backgroundColor = "green";
  if (variant === "outline") {
    backgroundColor = "transparent";
  } else if (variant === "fill" && status === "destructive") {
    backgroundColor = theme.destructive;
  }
  return backgroundColor;
};

//
//
//
//
//

const alertTextColor = ({
  variant,
  status,
  theme,
}: {
  variant: AlertProps["variant"];
  status: AlertProps["status"];
  theme: any;
}) => {
  let color = theme.white;
  if (variant === "outline" && status === "destructive") {
    color = theme.destructive;
  } else if (variant === "outline" && status === "success") {
    color = "green";
  }
  return color;
};

//
//
//
//
//

const alertBorderColor = ({
  variant,
  status,
  theme,
}: {
  variant: AlertProps["variant"];
  status: AlertProps["status"];
  theme: any;
}) => {
  let borderColor = "transparent";
  if (variant === "fill") {
    borderColor = alertBackgroundColor({
      variant,
      status,
      theme,
    });
  } else if (variant === "outline") {
    borderColor = alertTextColor({
      variant,
      status,
      theme,
    });
  }
  return borderColor;
};
