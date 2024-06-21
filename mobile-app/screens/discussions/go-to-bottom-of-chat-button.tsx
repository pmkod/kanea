import MyText from "@/components/core/my-text";
import { useTheme } from "@/hooks/use-theme";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

interface GoToBottomOfChatButtonProps {
  onPress: () => void;
  unseenDiscussionMessagesCountOfThisDiscussion?: number;
}

export const GoToBottomOfChatButton = ({
  onPress,
  unseenDiscussionMessagesCountOfThisDiscussion,
}: GoToBottomOfChatButtonProps) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        position: "absolute",
        bottom: 8,
        right: 22,
        padding: 7,
        borderRadius: 50,
        zIndex: 40,
        backgroundColor: theme.white,
        borderWidth: 1,
        borderColor: theme.gray300,
        shadowColor: theme.gray900,
        shadowRadius: 10,
        shadowOpacity: 0.5,
        // shadowOffset: { width: 10, height: 10 },
      }}
    >
      {unseenDiscussionMessagesCountOfThisDiscussion !== undefined &&
        unseenDiscussionMessagesCountOfThisDiscussion > 0 && (
          <View
            style={{
              backgroundColor: theme.green500,
              position: "absolute",
              top: -5,
              right: -6,
              borderRadius: 200,
              width: 22,
              aspectRatio: "1/1",

              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MyText
              style={{
                color: theme.gray950,
                fontSize: 12,
                fontFamily: "NunitoSans_700Bold",
              }}
            >
              {unseenDiscussionMessagesCountOfThisDiscussion}
            </MyText>
          </View>
        )}
      <Feather name="chevron-down" size={24} color={theme.gray900} />
    </Pressable>
  );
};
