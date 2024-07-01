import { Button } from "@/components/core/button";
import MyText from "@/components/core/my-text";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { ActivityIndicator, Dimensions, Image, View } from "react-native";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useTheme } from "@/hooks/use-theme";
import Space from "@/components/core/space";
import {
  firstScreenName,
  loginScreenName,
  signupScreenName,
} from "@/constants/screens-names-constants";
import { bottomTabNavigatorName } from "@/constants/navigators-names-constants";
import * as Notifications from "expo-notifications";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

const FirstScreen = () => {
  const { isSuccess, isLoading, isError, error } = useLoggedInUser({
    enabled: true,
  });

  // useEffect(() => {
  //   Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: "Hello",
  //       body: "How are you",
  //     },
  //     trigger: { seconds: 1 },
  //     identifier: "azerty"
  //   });
  // }, []);
  // Notifications.cancelScheduledNotificationAsync('azerty')

  const navigation = useNavigation();
  const { theme } = useTheme();

  useEffect(() => {
    if (isSuccess) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: bottomTabNavigatorName }],
        })
      );
    }
    return () => {};
  }, [isSuccess]);

  const screenHeight = Dimensions.get("screen").height;

  const goToLoginScreen = () => {
    navigation.navigate(loginScreenName);
  };

  const goToSignupScreen = () => {
    navigation.navigate(signupScreenName);
  };

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
              ? require("../assets/kanea-logo-black-text.png")
              : require("../assets/kanea-logo-white-text.png")
          }
          style={{
            width: 100,
            height: 40,
            marginBottom: 20,
          }}
        />
        <MyText
          style={{ fontSize: 20, color: theme.gray600, textAlign: "center" }}
        >
          Create posts, interact with other users, chat with your friends
        </MyText>

        <Space height={70} />

        <View style={{ width: "100%" }}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.gray900} />
          ) : isError ? (
            <>
              <Button
                variant="outline"
                text="Log in"
                size="lg"
                onPress={goToLoginScreen}
              />

              <Space height={12} />
              <Button text="Sign up" size="lg" onPress={goToSignupScreen} />
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export const firstScreen = {
  name: firstScreenName,
  component: FirstScreen,
  options: {
    animation: "fade",
    headerShown: false,
  } as NativeStackNavigationOptions,
};
