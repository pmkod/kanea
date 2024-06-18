import { useTheme } from "@/hooks/use-theme";
import { Dimensions, Image, View } from "react-native";

export const FullScreenLoader = () => {
  const screenHeight = Dimensions.get("screen").height;
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: theme.white,
        paddingTop: screenHeight * 0.25,
      }}
    >
      <View
        style={{
          flex: 1,
          width: 300,
          alignItems: "center",
        }}
      >
        <Image
          source={
            theme.value === "light"
              ? require("../../assets/kanea-logo-black-text.png")
              : require("../../assets/kanea-logo-white-text.png")
          }
          style={{
            width: 100,
            height: 40,
            marginBottom: 20,
          }}
        />
      </View>
    </View>
  );
};
