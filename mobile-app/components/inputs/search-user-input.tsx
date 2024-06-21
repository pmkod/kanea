import { useTheme } from "@/hooks/use-theme";
import { TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

interface SearchUserInputProps {
  placeholder: string;
  text: string;
  onChangeText: (value: string) => void;
}

export const SearchUserInput = ({
  placeholder,
  text,
  onChangeText,
}: SearchUserInputProps) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        borderBottomWidth: 0.5,
        borderColor: theme.gray300,
        // flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 18,
        // height: 50,
        // backgroundColor: "blue",
      }}
    >
      <View style={{ marginRight: 18, paddingTop: 1 }}>
        <Feather name="search" size={20} color={theme.gray500} />
      </View>
      <TextInput
        style={{
          flex: 1,
          height: 48,
          fontFamily: "NunitoSans_400Regular",
          fontSize: 16,
          color: theme.gray800,
        }}
        cursorColor={theme.gray800}
        value={text}
        autoFocus={true}
        placeholder={placeholder}
        onChangeText={onChangeText}
        placeholderTextColor={theme.gray400}
      />
    </View>
  );
};
