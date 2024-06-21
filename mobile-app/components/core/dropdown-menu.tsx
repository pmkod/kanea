import { useTheme } from "@/hooks/use-theme";
import React, {
  Children,
  cloneElement,
  ReactElement,
  ReactNode,
  useState,
} from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import { Menu } from "react-native-paper";
import MyText from "./my-text";

//
//
//
//
//

export const DropdownMenu = ({
  children,
  anchor,
}: {
  children: ReactNode;
  visible?: boolean;
  anchor: ReactNode;
}) => {
  const { theme } = useTheme();

  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  anchor = cloneElement(anchor as ReactElement, { onPress: openMenu });

  children = Children.map(children, (child) => {
    if (child) {
      return cloneElement(child as any, { closeMenu });
    }
    return null;
  });

  return (
    <Menu
      anchor={anchor}
      visible={visible}
      onDismiss={closeMenu}
      style={{ paddingVertical: 0 }}
      contentStyle={{
        // paddingVertical: 2,
        backgroundColor: theme.gray100,
      }}
      elevation={2}
    >
      {children}
    </Menu>
  );
};

//
//
//
//
//

interface DropdownMenuItemProps {
  onPress?: (event: GestureResponderEvent) => void;
  title: string;
  leftDecorator?: ReactNode;
  rightDecorator?: ReactNode;
  closeMenu?: () => void;
}

export const DropdownMenuItem = ({
  onPress,
  title,
  leftDecorator,
  rightDecorator,
  closeMenu,
}: DropdownMenuItemProps) => {
  const { theme } = useTheme();

  const handlePress = (event: GestureResponderEvent) => {
    if (closeMenu !== undefined) {
      closeMenu();
    }
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <Pressable onPress={handlePress} android_ripple={{ radius: 2000 }}>
      <View
        style={{
          flexDirection: "row",
          paddingVertical: 10,
          paddingHorizontal: 18,
          gap: 16,
        }}
      >
        {leftDecorator &&
          cloneElement(leftDecorator as any, {
            color: theme.gray800,
            size: 19,
            style: {
              marginTop: 1,
            },
          })}
        <MyText style={{ fontSize: 16 }}>{title}</MyText>
        {rightDecorator &&
          cloneElement(rightDecorator as any, {
            color: theme.gray800,
            size: 19,
            style: {
              marginTop: 1,
            },
          })}
      </View>
    </Pressable>
  );
};
