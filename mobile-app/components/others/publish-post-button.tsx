import { publishPostScreenName } from "@/constants/screens-names-constants";
import { useTheme } from "@/hooks/use-theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, View } from "react-native";

export const PublishPostButton = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const goToPublishPostScreen = () => {
    navigation.navigate(publishPostScreenName);
  };

  return (
    <Pressable
      onPress={goToPublishPostScreen}
      style={{
        position: "absolute",
        bottom: 22,
        right: 18,
        zIndex: 50,
        width: 56,
        height: 56,
        borderRadius: 80,
        shadowColor: "black",
        elevation: 3,
        overflow: "hidden",
      }}
    >
      {({ pressed }) => (
        <View
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            opacity: pressed ? 0.9 : 1,
            backgroundColor: theme.gray950,
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={26}
            color={theme.white}
            weight="bold"
          />
        </View>
      )}
    </Pressable>
  );
};
