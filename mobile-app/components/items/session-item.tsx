import React from "react";
import { Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { Session } from "@/types/session";
import { useNavigation } from "@react-navigation/native";
import { UAParser } from "ua-parser-js";
import { sessionSettingsScreenName } from "@/constants/screens-names-constants";
import { Skeleton } from "../core/skeleton";
import { useTheme } from "@/hooks/use-theme";
import {
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";

interface SessionItemProps {
  session: Session;
  isCurrentSession: boolean;
}

export const SessionItem = ({
  session,
  isCurrentSession,
}: SessionItemProps) => {
  const uaParserInstance = new UAParser(session.agent);
  const uaResult = uaParserInstance.getResult();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const goToSessionSettingsScreen = () => {
    navigation.navigate(sessionSettingsScreenName, {
      session,
    });
  };

  return (
    <Pressable onPress={goToSessionSettingsScreen}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: pressed ? theme.gray100 : theme.transparent,
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <View
            style={{
              borderRadius: 50,
              width: 46,
              aspectRatio: "1/1",
              borderWidth: 1,
              justifyContent: "center",
              alignItems: "center",
              borderColor: theme.gray400,
              //   marginRight: 20,
            }}
          >
            {uaResult.browser.name !== undefined ? (
              <MaterialIcons
                name="desktop-windows"
                size={24}
                color={theme.gray500}
              />
            ) : uaResult.device.type === "mobile" ? (
              <Feather name="smartphone" size={24} color={theme.gray500} />
            ) : null}
          </View>

          <View style={{ marginLeft: 16, flex: 1 }}>
            <MyText
              style={{
                fontFamily: "NunitoSans_600SemiBold",
                fontSize: 18,
              }}
            >
              {uaResult.browser.name
                ? "Web"
                : uaResult.device.type === "mobile"
                ? "Mobile"
                : null}
            </MyText>
            <MyText
              style={{
                fontFamily: "NunitoSans_400Regular",
                color: "#9ca3af",
              }}
            >
              Created three day ago
            </MyText>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={theme.gray500}
          />
        </View>
      )}
    </Pressable>
  );
};

export const SessionItemLoader = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        height: 72,
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
      }}
    >
      <Skeleton
        style={{
          width: 50,
          aspectRatio: "1/1",
          borderRadius: 300,
        }}
      />
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Skeleton style={{ width: "35%", borderRadius: 8, height: 12 }} />
        <Skeleton style={{ width: "70%", borderRadius: 8, height: 12 }} />
      </View>
    </View>
  );
};
