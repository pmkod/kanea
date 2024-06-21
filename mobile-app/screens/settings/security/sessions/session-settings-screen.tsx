import { Button } from "@/components/core/button";
import MyText from "@/components/core/my-text";
import { Skeleton } from "@/components/core/skeleton";
import Space from "@/components/core/space";
import { sessionSettingsScreenName } from "@/constants/screens-names-constants";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { useSession } from "@/hooks/use-session";
import { useTheme } from "@/hooks/use-theme";
import { logoutOfSessionRequest } from "@/services/session-service";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { RefreshControl, ScrollView, View } from "react-native";
import Toast from "react-native-toast-message";
import { UAParser } from "ua-parser-js";

const SessionSettingsScreen = () => {
  const route = useRoute();
  const { session }: any = route.params;
  const { theme } = useTheme();

  const navigation = useNavigation();

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    isRefetching,
    isFetching,
    refetch,
  } = useSession({ session });
  useRefreshOnScreenFocus(refetch);

  const uaParserInstance = new UAParser(data ? data?.session.agent : undefined);
  const uaResult = uaParserInstance.getResult();

  const { mutate, isPending } = useMutation({
    mutationFn: () => logoutOfSessionRequest(data!.session.id),
    onSuccess: () => {
      Toast.show({ type: "info", text1: "Success" });
      navigation.goBack();
    },
    onError: () => {
      Toast.show({ type: "error", text1: "Error" });
    },
  });

  const logoutOfSession = () => {
    if (!isPending) {
      mutate();
    }
  };

  if (isError) {
    navigation.goBack();
    return null;
  }
  return (
    <ScrollView
      style={{ paddingTop: 16, paddingHorizontal: 20 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching && !isFetching}
          onRefresh={refetch}
        />
      }
    >
      <View
        style={{
          marginBottom: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
        }}
      >
        {isLoading ? (
          <>
            <Skeleton style={{ width: 56, height: 56, borderRadius: 300 }} />
            <Skeleton style={{ width: 80, height: 16, borderRadius: 6 }} />
          </>
        ) : isSuccess ? (
          <>
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.gray400,
                borderRadius: 300,
                width: 56,
                aspectRatio: "1/1",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {uaResult.browser.name !== undefined ? (
                <MaterialIcons
                  name="desktop-windows"
                  size={24}
                  color={theme.gray400}
                />
              ) : uaResult.device.type === "mobile" ? (
                <Feather name="smartphone" size={24} color={theme.gray400} />
              ) : null}
            </View>
            <MyText
              style={{ fontSize: 20, fontFamily: "NunitoSans_600SemiBold" }}
            >
              {uaResult.browser.name
                ? "Web"
                : uaResult.device.type === "mobile"
                ? "Mobile"
                : null}
            </MyText>
          </>
        ) : null}
      </View>

      {isLoading && (
        <Skeleton style={{ height: 96, borderRadius: 4, marginBottom: 32 }} />
      )}

      {isSuccess && !data.session.isCurrentSession && (
        <View style={{ marginBottom: 32 }}>
          <Button
            variant="outline"
            colorScheme="destructive"
            onPress={logoutOfSession}
            text="Desactivate this session"
          />
        </View>
      )}

      {isLoading ? (
        <>
          <SessionInfoItemLoader />
          <SessionInfoItemLoader />
          <SessionInfoItemLoader />
          <SessionInfoItemLoader />
        </>
      ) : (
        <>
          <SessionInfoItem
            label="Created"
            value={
              data !== undefined
                ? dayjs(data.session.createdAt).format("MMM DD, YYYY, hh:mm A")
                : undefined
            }
          />
          <SessionInfoItem label="Device" value={uaResult.device.type} />
          <SessionInfoItem label="Os" value={uaResult.os.name} />
          {uaResult.browser.name && uaResult.browser.version && (
            <SessionInfoItem
              label="Browser"
              value={uaResult.browser.name + " " + uaResult.browser.version}
            />
          )}
        </>
      )}

      <Space height={40} />
    </ScrollView>
  );
};

export const sessionSettingsScreen = {
  name: sessionSettingsScreenName,
  component: SessionSettingsScreen,
  options: {
    title: "Session",
    animation: "ios",
  } as NativeStackNavigationOptions,
};

const SessionInfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  const { theme } = useTheme();
  return value ? (
    <View style={{ marginBottom: 16 }}>
      <MyText
        style={{
          color: theme.gray900,
          fontFamily: "NunitoSans_600SemiBold",
          marginBottom: 4,
        }}
      >
        {label}
      </MyText>
      <MyText
        style={{
          color: theme.gray400,
          fontFamily: "NunitoSans_400Regular",
          fontSize: 14,
        }}
      >
        {value}
      </MyText>
    </View>
  ) : null;
};

const SessionInfoItemLoader = () => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Skeleton
        style={{ marginBottom: 8, height: 10, borderRadius: 6, width: "70%" }}
      />
      <Skeleton
        style={{ marginBottom: 8, height: 10, borderRadius: 6, width: "35%" }}
      />
    </View>
  );
};
