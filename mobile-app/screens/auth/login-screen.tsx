import * as SecureStore from "expo-secure-store";
import { Button } from "@/components/core/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import { loginRequest } from "@/services/auth-service";
import {
  LoginFormFields,
  loginFormSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Dimensions, Pressable, ScrollView, View } from "react-native";
import { Alert } from "@/components/core/alert";
import {
  emailVerificationPurposes,
  emailVerificationTokenFieldName,
} from "@/constants/email-verification-constants";
import {
  emailVerificationScreenName,
  loginScreenName,
  passwordResetScreenName,
} from "@/constants/screens-names-constants";
import { PasswordInput } from "@/components/core/password-input";

//
//
//
//

const LoginScreen = () => {
  const navigation = useNavigation();

  const width = Dimensions.get("window").width;

  const form = useForm<LoginFormFields>({
    resolver: zodResolver(loginFormSchema),
    mode: "onSubmit",
    defaultValues: {},
    reValidateMode: "onSubmit",
  });

  const login: SubmitHandler<LoginFormFields> = async (data) => {
    try {
      const jsonResponse = await loginRequest(data);
      SecureStore.setItem(
        emailVerificationTokenFieldName,
        jsonResponse[emailVerificationTokenFieldName]
      );
      navigation.navigate(emailVerificationScreenName, {
        purpose: emailVerificationPurposes.login,
        emailToVerify: data.email,
      });
    } catch (err: any) {
      if (err.errors) {
        form.setError("root.serverCatch", {
          message: err.errors[0].message,
        });
        return;
      }
      form.setError("root.serverCatch", {
        message: "Error",
      });
    }
  };

  const goToPasswordResetPage = () => {
    navigation.navigate(passwordResetScreenName);
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
          {form.formState.errors.root &&
            form.formState.errors.root.serverCatch.message && (
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
              <FormItem style={{ marginBottom: 20 }}>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="Your email"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e ? e.trim() : "");
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <Pressable
              onPress={goToPasswordResetPage}
              style={{ paddingTop: 8, paddingBottom: 14 }}
            >
              <MyText>Forgot your password ?</MyText>
            </Pressable>
          </View>
          <Button
            onPress={form.handleSubmit(login)}
            text="Log in"
            size="lg"
            isLoading={form.formState.isSubmitting}
          />
        </View>
      </FormProvider>
      <Space height={30} />
    </ScrollView>
  );
};

//
//
//
//
//

export const loginScreen = {
  name: loginScreenName,
  component: LoginScreen,
  options: {
    title: "Login",
    animation: "slide_from_right",
  } as NativeStackNavigationOptions,
};
