import * as SecureStore from "expo-secure-store";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import Space from "@/components/core/space";
import {
  PasswordResetNewPasswordFormFields,
  passwordResetNewPasswordSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Dimensions, ScrollView, View } from "react-native";
import { Button } from "@/components/core/button";
import { newPasswordRequest } from "@/services/auth-service";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { Alert } from "@/components/core/alert";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { emailVerificationTokenFieldName } from "@/constants/email-verification-constants";
import { sessionIdFieldName } from "@/constants/session-constants";
import { bottomTabNavigatorName } from "@/constants/navigators-names-constants";
import { newPasswordScreenName } from "@/constants/screens-names-constants";
import { PasswordInput } from "@/components/core/password-input";

const NewPasswordScreen = () => {
  const width = Dimensions.get("window").width;

  const navigation = useNavigation();

  const form = useForm<PasswordResetNewPasswordFormFields>({
    resolver: zodResolver(passwordResetNewPasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {},
  });

  //
  //
  //
  //
  //

  const onSubmit: SubmitHandler<PasswordResetNewPasswordFormFields> = async ({
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
        message: "Password does not match",
      });
      return;
    }

    try {
      const emailVerificationToken = SecureStore.getItem(
        emailVerificationTokenFieldName
      );
      if (!emailVerificationToken) {
        return;
      }
      const jsonData = await newPasswordRequest({
        newPassword,
        [emailVerificationTokenFieldName]: emailVerificationToken,
      });
      await SecureStore.deleteItemAsync(emailVerificationTokenFieldName);
      SecureStore.setItem(sessionIdFieldName, jsonData[sessionIdFieldName]);

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: bottomTabNavigatorName }],
        })
      );
    } catch (err: any) {
      if (err.errors) {
        form.setError("newPassword", { message: err.errors[0].message });
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
            name="newPassword"
            render={({ field, fieldState, formState }) => (
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
          <Space height={20} />
          <FormField
            control={form.control}
            name="newPasswordConfirmation"
            render={({ field, fieldState, formState }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <PasswordInput
                  secureTextEntry={true}
                  placeholder="Retype your password"
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
            onPress={form.handleSubmit(onSubmit)}
            isLoading={form.formState.isSubmitting}
          />
        </View>
      </FormProvider>
    </ScrollView>
  );
};

export const newPasswordScreen = {
  name: newPasswordScreenName,
  component: NewPasswordScreen,
  options: {
    title: "New password",
    animation: "slide_from_right",
  } as NativeStackNavigationOptions,
};
