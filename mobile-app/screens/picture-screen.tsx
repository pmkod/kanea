import { pictureScreenName } from "@/constants/screens-names-constants";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/styles/themes";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Image, View } from "react-native";

const PictureScreen = () => {
  const route = useRoute();
  const { url } = route.params as { url: string };
  // const navigation = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Image
        src={url}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          backgroundColor: theme.white,
        }}
      />
    </View>
  );
};

export const pictureScreen = {
  name: pictureScreenName,
  component: PictureScreen,
  options: {
    title: "",
    animation: "fade",
    headerTransparent: true,
    headerStyle: {
      backgroundColor: themes.light.transparent,
    },
    // headerShown: false,
  } as NativeStackNavigationOptions,
};
