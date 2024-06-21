import * as SecureStore from "expo-secure-store";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import {
  PasswordResetFormFields,
  passwordResetFormSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import React from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Dimensions, ScrollView, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Space from "@/components/core/space";
import { Button } from "@/components/core/button";
import { passwordResetRequest } from "@/services/auth-service";
import {
  emailVerificationPurposes,
  emailVerificationTokenFieldName,
} from "@/constants/email-verification-constants";
import { Alert } from "@/components/core/alert";
import {
  emailVerificationScreenName,
  passwordResetScreenName,
} from "@/constants/screens-names-constants";

const PasswordResetScreen = () => {
  const navigation = useNavigation();
  const width = Dimensions.get("window").width;
  const form = useForm<PasswordResetFormFields>({
    resolver: zodResolver(passwordResetFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {},
  });

  const passwordReset: SubmitHandler<PasswordResetFormFields> = async (
    data
  ) => {
    try {
      const jsonResponse = await passwordResetRequest(data);
      SecureStore.setItem(
        emailVerificationTokenFieldName,
        jsonResponse[emailVerificationTokenFieldName]
      );
      navigation.navigate(emailVerificationScreenName, {
        purpose: emailVerificationPurposes.passwordReset,
        emailToVerify: data.email,
      });
    } catch (err: any) {
      if (err.errors) {
        form.setError("root.serverCatch", {
          message: err.errors[0].message,
        });
      }
    }
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Space height={20} />
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
              style={{ marginBottom: 12 }}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="Enter your email"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e ? e.trim() : "");
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <Space height={24} />
          <Button
            text="Continue"
            onPress={form.handleSubmit(passwordReset)}
            isLoading={form.formState.isSubmitting}
          />
        </View>
      </FormProvider>
      <Space height={20} />
    </ScrollView>
  );
};

//
//
//
//
//

export const passwordResetScreen = {
  name: passwordResetScreenName,
  component: PasswordResetScreen,
  options: {
    animation: "slide_from_right",
    title: "Reset password",
  } as NativeStackNavigationOptions,
};
