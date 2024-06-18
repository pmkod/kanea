import { PropsWithChildren, useEffect } from "react";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { AppState, AppStateStatus, Platform } from "react-native";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
      refetchOnReconnect: true,
    },
  },
});
export default function TanstackQueryProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        setOnline(!!state.isConnected);
      });
    });
  }, [NetInfo, onlineManager]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        if (Platform.OS !== "web") {
          focusManager.setFocused(status === "active");
        }
      }
    );
    return () => subscription.remove();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
