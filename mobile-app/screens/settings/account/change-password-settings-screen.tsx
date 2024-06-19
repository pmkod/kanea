import { ScrollView, View } from "react-native";
import React, { useEffect } from "react";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { changePasswordSchema } from "@/validation-schema/user-schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import MyText from "@/components/core/my-text";
import { Button } from "@/components/core/button";
import { changePasswordRequest } from "@/services/user-service";
import Toast from "react-native-toast-message";
import { Alert } from "@/components/core/alert";
import { useNavigation } from "@react-navigation/native";
import Space from "@/components/core/space";
import { changePasswordSettingsScreenName } from "@/constants/screens-names-constants";
import { PasswordInput } from "@/components/core/password-input";

const ChangePasswordSettingsScreen = () => {
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    // delayError: ,
  });

  const navigation = useNavigation();

  const save: SubmitHandler<z.infer<typeof changePasswordSchema>> = async ({
    currentPassword,
    newPassword,
    newPasswordConfirmation,
  }) => {
    if (!newPasswordConfirmation) {
      form.setError("newPasswordConfirmation", {
        message: "Confirm password",
      });
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      form.setError("newPasswordConfirmation", {
        message: "Password don't match",
      });
      return;
    }

    try {
      await changePasswordRequest({ currentPassword, newPassword });

      Toast.show({
        text2: "Password changed",
        type: "info",
      });

      form.reset({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirmation: "",
      });

      navigation.goBack();
    } catch (err: any) {
      if (err.errors) {
        for (const error of err.errors) {
          if (error.field) {
            form.setError(error.field, { message: error.message });
          }
        }
        return;
      }
      form.setError("root.serverCatch", {
        message: "Error",
      });
    }
  };
  return (
    <FormProvider {...form}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            paddingHorizontal: 24,
            paddingTop: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {form.formState.errors.root &&
            form.formState.errors.root.serverCatch.message && (
              <Alert
                status="destructive"
                style={{ marginBottom: 20 }}
                description={form.formState.errors.root.serverCatch.message}
              />
            )}
          <View
            style={{
              gap: 20,
              justifyContent: "flex-start",
            }}
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current password</FormLabel>
                  <PasswordInput
                    placeholder="Enter your current password"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <PasswordInput
                    placeholder="Enter the new password"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPasswordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New password</FormLabel>
                  <PasswordInput
                    placeholder="Confirm the new password"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </View>
          <Space height={20} />
          <MyText style={{ fontSize: 13, color: "#9ca3af" }}>
            Changing your password will log you out of all your active sessions
            except the current session.
          </MyText>
          <Space height={60} />
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 14,
            paddingBottom: 24,
          }}
        >
          <Button
            text="Save"
            isLoading={form.formState.isSubmitting}
            onPress={form.handleSubmit(save)}
          />
        </View>
      </View>
    </FormProvider>
  );
};

export const changePasswordSettingsScreen = {
  name: changePasswordSettingsScreenName,
  component: ChangePasswordSettingsScreen,
  options: {
    title: "Change password",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
