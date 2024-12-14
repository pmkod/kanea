import * as SecureStore from "expo-secure-store";
import { Alert } from "@/components/core/alert";
import { Button } from "@/components/core/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import Space from "@/components/core/space";
import { bottomTabNavigator } from "@/navigators/bottom-tab-navigator";
import { completeSignupRequest } from "@/services/auth-service";
import {
  CompleteSignupFormFields,
  completeSignupSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Dimensions, ScrollView, View } from "react-native";
import { sessionIdFieldName } from "@/constants/session-constants";
import { emailVerificationTokenFieldName } from "@/constants/email-verification-constants";
import { bottomTabNavigatorName } from "@/constants/navigators-names-constants";
import { completeSignupScreenName } from "@/constants/screens-names-constants";
import { PasswordInput } from "@/components/core/password-input";

//
//
//
//
//

const CompleteSignupScreen = () => {
  const width = Dimensions.get("window").width;
  const navigation = useNavigation();

  const form = useForm<CompleteSignupFormFields>({
    resolver: zodResolver(completeSignupSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {},
  });

  const completeSignup: SubmitHandler<CompleteSignupFormFields> = async (
    data
  ) => {
    try {
      const emailVerificationToken = SecureStore.getItem(
        emailVerificationTokenFieldName
      );
      if (!emailVerificationToken) {
        return;
      }
      const jsonData = await completeSignupRequest({
        ...data,
        [emailVerificationTokenFieldName]: emailVerificationToken,
      });
      await SecureStore.deleteItemAsync(emailVerificationTokenFieldName);
      SecureStore.setItem(sessionIdFieldName, jsonData[sessionIdFieldName]);
      // navigation.navigate(bottomTabNavigatorName);
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: bottomTabNavigatorName }],
        })
      );
    } catch (err: any) {

      if (err.errors) {
        const error = err.errors[0];
        if (error.field === "userName") {
          form.setError("userName", { message: error.message });
        } else {
          form.setError("root.serverCatch", {
            message: error.message,
          });
        }
      }
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Space height={30} />

      <FormProvider {...form}>
        <View
          style={{
            paddingHorizontal: 24,
            maxWidth: 800,
            width,
          }}
        >
          {form.formState.errors.root && (
            <Alert
              variant="outline"
              status="destructive"
              description={form.formState.errors.root.serverCatch.message}
            />
          )}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your name</FormLabel>
                <Input
                  placeholder="Type your name"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e ? e.trim() : "");
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Space height={20} />

          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <Input
                  placeholder="Choose an username"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e ? e.trim() : "");
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <Space height={20} />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <PasswordInput
                  secureTextEntry={true}
                  placeholder="At least 12 characters"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />

                <FormMessage />
              </FormItem>
            )}
          />
          <Space height={30} />
          <Button
            text="Continue"
            onPress={form.handleSubmit(completeSignup)}
            isLoading={form.formState.isSubmitting}
          />
        </View>
      </FormProvider>
      <Space height={30} />
    </ScrollView>
  );
};

export const completeSignupScreen = {
  name: completeSignupScreenName,
  component: CompleteSignupScreen,
  options: {
    animation: "slide_from_right",
    title: "Complete signup",
  } as NativeStackNavigationOptions,
};
