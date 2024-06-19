import * as SecureStore from "expo-secure-store";
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
import { changeEmailSchema } from "@/validation-schema/user-schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/core/button";
import { useNavigation } from "@react-navigation/native";
import {
  changeEmailSettingsScreenName,
  emailVerificationScreenName,
} from "@/constants/screens-names-constants";
import {
  emailVerificationPurposes,
  emailVerificationTokenFieldName,
} from "@/constants/email-verification-constants";
import { changeEmailRequest } from "@/services/user-service";
import { Alert } from "@/components/core/alert";
import { PasswordInput } from "@/components/core/password-input";

const ChangeEmailSettingsScreen = () => {
  const form = useForm<z.infer<typeof changeEmailSchema>>({
    resolver: zodResolver(changeEmailSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {},
  });
  const navigation = useNavigation();

  const changeEmail: SubmitHandler<z.infer<typeof changeEmailSchema>> = async (
    data
  ) => {
    try {
      const jsonResponse = await changeEmailRequest(data);
      SecureStore.setItem(
        emailVerificationTokenFieldName,
        jsonResponse[emailVerificationTokenFieldName]
      );
      navigation.navigate(emailVerificationScreenName, {
        purpose: emailVerificationPurposes.changeEmail,
        emailToVerify: data.newEmail,
      });

      form.reset({
        newEmail: "",
        password: "",
      });
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
                    secureTextEntry
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New email</FormLabel>
                  <Input placeholder="Enter the new email" {...field} />
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
            text="Change"
            isLoading={form.formState.isSubmitting}
            onPress={form.handleSubmit(changeEmail)}
          />
        </View>
      </View>
    </FormProvider>
  );
};

export const changeEmailSettingsScreen = {
  name: changeEmailSettingsScreenName,
  component: ChangeEmailSettingsScreen,
  options: {
    title: "Change email",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
