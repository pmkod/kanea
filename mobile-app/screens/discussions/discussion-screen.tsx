import React, { useEffect } from "react";
import { View } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatHeader from "./chat-header";
import ChatBody from "./chat-body";
import ChatFooter from "./chat-footer";
import { discussionScreenName } from "@/constants/screens-names-constants";
import { useDiscussion } from "@/hooks/use-discussion";
import { useRoute } from "@react-navigation/native";
import { useSetAtom } from "jotai";
import { currentlyOpenDiscussionIdAtom } from "@/atoms/currently-open-discussion-id-atom";
import { useTheme } from "@/hooks/use-theme";

const DiscussionScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { discussionId } = route.params as {
    discussionId?: string;
  };
  const { theme } = useTheme();

  const setCurrentlyOpenDiscussionId = useSetAtom(
    currentlyOpenDiscussionIdAtom
  );

  useDiscussion(discussionId || "", {
    enabled: discussionId !== undefined,
  });

  useEffect(() => {
    setCurrentlyOpenDiscussionId(discussionId);
    return () => {
      setCurrentlyOpenDiscussionId(undefined);
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        backgroundColor: theme.white,
      }}
    >
      <View style={{ flex: 1 }}>
        <ChatHeader />
        <ChatBody />
        <ChatFooter />
      </View>
    </View>
  );
};

//
//
//
//
//
//
//
//
//
//
export const discussionScreen = {
  name: discussionScreenName,
  component: DiscussionScreen,
  options: {
    animation: "ios",
    headerShown: false,
  } as NativeStackNavigationOptions,
};
