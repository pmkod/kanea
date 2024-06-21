import { useTheme } from "@/hooks/use-theme";
import { Doc } from "@/types/doc";
import { Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { Feather } from "@expo/vector-icons";

interface SelectedDocItemProps {
  doc: Doc;
  remove: () => void;
}

export const SelectedDocItem = ({ doc, remove }: SelectedDocItemProps) => {
  const { theme } = useTheme();

  const mimeType = doc.mimeType?.split("/").pop();

  const onRemove = () => {
    remove();
  };

  return (
    <View
      style={{
        borderWidth: 0.5,
        borderColor: theme.gray200,
        padding: 5,
        borderRadius: 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          paddingHorizontal: 4,
          paddingTop: 1,
          paddingBottom: 2,
          //   paddingVertical: 2,
          borderRadius: 2,
          backgroundColor: theme.gray200,
        }}
      >
        <MyText style={{ fontSize: 13 }}>{mimeType}</MyText>
      </View>

      <View style={{ maxWidth: 140, paddingBottom: 2, overflow: "hidden" }}>
        <MyText numberOfLines={1}>{doc.name}</MyText>
      </View>

      <Pressable
        style={{
          //   backgroundColor: themes.light.gray900,
          borderWidth: 0.8,
          borderColor: theme.gray100,
          borderRadius: 2,
          padding: 4,
        }}
        onPress={onRemove}
      >
        <Feather name="x" size={14} color={theme.gray950} />
      </Pressable>
    </View>
  );
};
