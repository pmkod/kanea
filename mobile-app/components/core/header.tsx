import { useTheme } from "@/hooks/use-theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

interface HeaderProps {
  children: ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingRight: 18,
        paddingLeft: 14,
        height: 60,
        backgroundColor: theme.white,
        width: "100%",
      }}
    >
      {children}
    </View>
  );
};

export const HeaderLeftPart = ({ children }: { children: ReactNode }) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {children}
    </View>
  );
};

export const HeaderRightPart = ({ children }: { children: ReactNode }) => {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
      }}
    >
      {children}
    </View>
  );
};

export const HeaderGoBackButton = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const goToPreviousScreen = () => {
    navigation.goBack();
  };
  return (
    <Pressable style={{ marginRight: 8 }} onPress={goToPreviousScreen}>
      {({ pressed }) => (
        <View
          style={{
            borderRadius: 300,
            padding: 8,
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color={theme.gray900}
          />
        </View>
      )}
    </Pressable>
  );
};

export const HeaderCloseButton = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const goToPreviousScreen = () => {
    navigation.goBack();
  };
  return (
    <Pressable style={{ marginRight: 8 }} onPress={goToPreviousScreen}>
      {({ pressed }) => (
        <View
          style={{
            borderRadius: 300,
            padding: 8,
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
          }}
        >
          <Feather name="x" size={26} color={theme.gray900} />
        </View>
      )}
    </Pressable>
  );
};
