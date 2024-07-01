import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import TanstackQueryProvider from "./providers/tanstack-provider";
import { useFonts } from "expo-font";
import {
  NunitoSans_200ExtraLight,
  NunitoSans_300Light,
  NunitoSans_400Regular,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import Main from "./main";
import { RootStackParamList } from "./types/routes";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes } from "./styles/themes";
import { useTheme } from "@/hooks/use-theme";
import { SafeAreaView, StatusBar, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import NiceModal from "@ebay/nice-modal-react";
import * as NavigationBar from "expo-navigation-bar";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { toastConfig } from "./configs/toast-config";
import * as Notifications from "expo-notifications";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default function App() {
  let [fontsLoaded, fontError] = useFonts({
    NunitoSans_200ExtraLight,
    NunitoSans_300Light,
    NunitoSans_400Regular,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <TanstackQueryProvider>
      <NavContainer />
    </TanstackQueryProvider>
  );
}

const NavContainer = () => {
  const { theme, setTheme } = useTheme();

  Notifications.scheduleNotificationAsync({
    content: {
      title: "Test",
    },
    trigger: {},
  });

  useEffect(() => {
    AsyncStorage.getItem("theme")
      .then((selectedThemeValue) => {
        setTheme(themes[(selectedThemeValue || "light") as "light" | "dark"]);
      })
      .catch(async () => {
        await AsyncStorage.setItem("theme", "light");
        setTheme(themes["light"]);
      });
  }, []);

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(theme.white);
  }, [theme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.white }}>
          <StatusBar
            backgroundColor={theme.white}
            barStyle={theme.statusBarStyle}
            showHideTransition="fade"
          />
          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: { ...DefaultTheme.colors, background: theme.white },
            }}
          >
            <BottomSheetModalProvider>
              <NiceModal.Provider>
                <Toast
                  config={toastConfig}
                  autoHide={true}
                  visibilityTime={1400}
                  position="top"
                  topOffset={0}
                />
                <Main />
              </NiceModal.Provider>
            </BottomSheetModalProvider>
          </NavigationContainer>
        </SafeAreaView>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};
