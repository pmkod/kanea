import { useTheme } from "@/hooks/use-theme";
import { User } from "@/types/user";
import { Pressable, View } from "react-native";
import Avatar from "../core/avatar";
import { buildPublicFileUrl } from "@/utils/url-utils";
import MyText from "../core/my-text";
import { Feather } from "@expo/vector-icons";

interface SelectedUserBubbleItemProps {
  user: User;
  onRemove: () => void;
}

export const SelectedUserBubbleItem = ({
  user,
  onRemove,
}: SelectedUserBubbleItemProps) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onRemove}
      style={{
        alignItems: "center",
        overflow: "visible",
        // alignContent
      }}
    >
      <View
        style={{
          position: "relative",
          alignItems: "center",
          // backgroundColor: "blue",
        }}
      >
        <Avatar
          src={
            user.profilePicture
              ? buildPublicFileUrl({
                  fileName: user.profilePicture.lowQualityFileName,
                })
              : undefined
          }
          name={user.displayName}
          width={50}
        />

        <View
          style={{
            padding: 2.5,
            borderRadius: 200,
            backgroundColor: theme.white,
            position: "absolute",
            right: -2,
            bottom: -1,
            zIndex: 200,
          }}
        >
          <View
            style={{
              backgroundColor: theme.gray200,
              borderRadius: 300,
              padding: 2,
            }}
          >
            <Feather name="x" size={12} color={theme.gray900} />
          </View>
        </View>
      </View>

      <MyText
        // ellipsizeMode="tail"
        numberOfLines={1}
        style={{
          fontSize: 14,
          width: 50,

          overflow: "hidden",
          textAlign: "center",
        }}
      >
        {user.displayName}
      </MyText>
    </Pressable>
  );
};
