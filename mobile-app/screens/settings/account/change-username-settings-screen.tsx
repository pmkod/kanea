import { ScrollView } from "react-native";
import React from "react";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import { Button } from "@/components/core/button";
import { changeUsernameSchema } from "@/validation-schema/user-schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { loggedInUserQueryKey } from "@/constants/query-keys";
import Toast from "react-native-toast-message";
import { changeUsernameRequest } from "@/services/user-service";
import { Alert } from "@/components/core/alert";
import { useNavigation } from "@react-navigation/native";
import { changeUsernameSettingsScreenName } from "@/constants/screens-names-constants";
import { PasswordInput } from "@/components/core/password-input";

const ChangeUsernameSettingsScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const form = useForm<z.infer<typeof changeUsernameSchema>>({
    resolver: zodResolver(changeUsernameSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {},
  });

  const save: SubmitHandler<z.infer<typeof changeUsernameSchema>> = async ({
    newUsername,
    password,
  }) => {
    try {
      const data = await changeUsernameRequest({ newUsername, password });
      navigation.goBack();
      Toast.show({ type: "info", text2: "Username changed" });
      form.reset({
        password: "",
        newUsername: "",
      });
      queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => ({
        ...qData,
        user: {
          ...qData.user,
          userName: data.user.userName,
        },
      }));
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
          <View style={{ gap: 20 }}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <PasswordInput
                    placeholder="Enter your password"
                    {...field}
                    secureTextEntry
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New username</FormLabel>
                  <Input placeholder="Enter the new username" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </View>
        </ScrollView>

        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
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

export const changeUsernameSettingsScreen = {
  name: changeUsernameSettingsScreenName,
  component: ChangeUsernameSettingsScreen,
  options: {
    title: "Change username",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
