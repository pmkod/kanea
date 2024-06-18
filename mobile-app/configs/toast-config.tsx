import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/styles/themes";
import Toast, {
  BaseToast,
  ErrorToast,
  ToastConfig,
} from "react-native-toast-message";

export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        backgroundColor: themes.light.success,
        paddingVertical: 0,
        borderLeftWidth: 0,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingVertical: 0,
      }}
      text1Style={{
        fontSize: 15,
        color: themes.light.white,
        fontFamily: "NunitoSans_600SemiBold",
      }}
      text2Style={{
        fontSize: 14,
        color: themes.light.white,
        fontFamily: "NunitoSans_400Regular",
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        backgroundColor: themes.light.destructive,
        borderLeftWidth: 0,
      }}
      text1Style={{
        fontSize: 15,
        fontFamily: "NunitoSans_600SemiBold",
        color: themes.light.white,
      }}
      text2Style={{
        fontSize: 14,
        fontFamily: "NunitoSans_400Regular",
        color: themes.light.white,
      }}
    />
  ),
  info: (props) => {
    const { theme } = useTheme();
    return (
      <BaseToast
        {...props}
        style={{ backgroundColor: theme.gray100, borderLeftWidth: 0 }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 15,
          fontFamily: "NunitoSans_600SemiBold",
          color: theme.gray900,
        }}
        text2Style={{
          fontSize: 14,
          fontFamily: "NunitoSans_400Regular",
          color: theme.gray900,
        }}
      />
    );
  },
  /*
    Or create a completely new type - `tomatoToast`,
    building the layout from scratch.

    I can consume any custom `props` I want.
    They will be passed when calling the `show` method (see below)
  */
};
