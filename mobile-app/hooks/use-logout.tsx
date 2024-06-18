import { webSocketAtom } from "@/atoms/web-socket-atom";
import { firstScreenName } from "@/constants/screens-names-constants";
import { logoutRequest } from "@/services/auth-service";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";
import Toast from "react-native-toast-message";
import * as SecureStore from "expo-secure-store";
import { sessionIdFieldName } from "@/constants/session-constants";
import { emailVerificationTokenFieldName } from "@/constants/email-verification-constants";
import { RootStackParamList } from "@/types/routes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [webSocket, setWebSocket] = useAtom(webSocketAtom);
  const queryClient = useQueryClient();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, any>>();
  const logout = async () => {
    setIsLoading(true);

    try {
      await logoutRequest();
      webSocket?.disconnect();
      setWebSocket(undefined);
      await SecureStore.deleteItemAsync(sessionIdFieldName);
      await SecureStore.deleteItemAsync(emailVerificationTokenFieldName);

      queryClient.clear();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: firstScreenName }],
        })
      );
    } catch (error) {
      Toast.show({ type: "error", text1: "Error" });
    }
    setIsLoading(false);
  };
  return {
    logout,
    isLoading,
  };
};
