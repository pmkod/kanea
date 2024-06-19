import * as SecureStore from "expo-secure-store";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import {
  SignupFormFields,
  signupFormSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { Dimensions, ScrollView, View } from "react-native";
import Space from "@/components/core/space";
import { Button } from "@/components/core/button";
import { signupRequest } from "@/services/auth-service";
import {
  emailVerificationPurposes,
  emailVerificationTokenFieldName,
} from "@/constants/email-verification-constants";
import { Alert } from "@/components/core/alert";
import {
  emailVerificationScreenName,
  signupScreenName,
} from "@/constants/screens-names-constants";

const SignupScreen = () => {
  const width = Dimensions.get("window").width;
  const navigation = useNavigation();

  const form = useForm<SignupFormFields>({
    resolver: zodResolver(signupFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {},
  });

  const signup: SubmitHandler<SignupFormFields> = async (data) => {
    try {
      const jsonData = await signupRequest(data);
      SecureStore.setItem(
        emailVerificationTokenFieldName,
        jsonData[emailVerificationTokenFieldName]
      );
      navigation.navigate(emailVerificationScreenName, {
        purpose: emailVerificationPurposes.signup,
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
                  placeholder="xyz@mail.com"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e ? e.trim() : "");
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <View style={{ height: 30 }}></View>
          <Button
            text="Sign up"
            onPress={form.handleSubmit(signup)}
            isLoading={form.formState.isSubmitting}
          />
        </View>
      </FormProvider>
      <Space height={30} />
    </ScrollView>
  );
};

export const signupScreen = {
  name: signupScreenName,
  component: SignupScreen,
  options: {
    animation: "slide_from_right",
  } as NativeStackNavigationOptions,
};
