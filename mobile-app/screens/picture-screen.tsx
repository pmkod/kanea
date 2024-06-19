import { pictureScreenName } from "@/constants/screens-names-constants";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/styles/themes";
import { useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

const PictureScreen = () => {
  const route = useRoute();
  const { url } = route.params as { url: string };
  // const navigation = useNavigation();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image
        src={url}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          flex: 1,
          backgroundColor: theme.white,
        }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}

        // onLoadEnd={}
      />

      {isLoading && (
        <View
          style={{
            position: "absolute",
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={theme.gray900} />
        </View>
      )}
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
