import { Pressable, TextInput, View } from "react-native";
import { Input, InputProps } from "./input";
import { forwardRef, LegacyRef, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/use-theme";

interface PasswordInputProps extends InputProps {}

export const PasswordInput = forwardRef(
  (
    { secureTextEntry, ...props }: PasswordInputProps,
    ref: LegacyRef<TextInput>
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const { theme } = useTheme();

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prevIsPasswordVisible) => !prevIsPasswordVisible);
    };

    return (
      <View style={{ position: "relative" }}>
        <Input
          {...props}
          ref={ref}
          secureTextEntry={!isPasswordVisible}
          // placeholder="Aaa"
        />

        <View
          style={{
            height: "100%",
            position: "absolute",
            aspectRatio: "1/1",
            alignItems: "flex-end",
            justifyContent: "center",
            // backgroundColor: "blue",
            bottom: 0,
            right: 0,
          }}
        >
          <Pressable
            onPress={togglePasswordVisibility}
            style={{
              marginRight: 6,
            }}
          >
            {({ pressed }) => (
              <View
                style={{
                  backgroundColor: pressed ? theme.gray200 : theme.transparent,
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  borderRadius: 4,
                }}
              >
                <MaterialCommunityIcons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={theme.gray700}
                />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  }
);
