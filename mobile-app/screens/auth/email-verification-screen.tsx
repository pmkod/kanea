import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import {
  CommonActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import Space from "@/components/core/space";
import MyText from "@/components/core/my-text";
import {
  emailVerificationPurposes,
  emailVerificationTokenFieldName,
} from "@/constants/email-verification-constants";
import {
  loginVerificationRequest,
  passwordResetRequest,
  passwordResetVerificationRequest,
  sendNewOtpForloginRequest,
  signupEmailVerificationRequest,
  signupRequest,
} from "@/services/auth-service";
import { Alert } from "@/components/core/alert";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/core/button";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import {
  EmailVerificationFormFields,
  emailVerificationFormSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import {
  completeSignupScreenName,
  emailVerificationScreenName,
  newPasswordScreenName,
} from "@/constants/screens-names-constants";
import {
  changeEmailRequest,
  requestNewOtpForEmailChangeRequest,
  verificationForEmailChangeRequest,
} from "@/services/user-service";
import Toast from "react-native-toast-message";
import { bottomTabNavigatorName } from "@/constants/navigators-names-constants";
import { sessionIdFieldName } from "@/constants/session-constants";
import { useTheme } from "@/hooks/use-theme";

const EmailVerificationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { purpose, emailToVerify }: any = route.params;
  const width = Dimensions.get("window").width;
  const { theme } = useTheme();

  const form = useForm<EmailVerificationFormFields>({
    resolver: zodResolver(emailVerificationFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit: SubmitHandler<EmailVerificationFormFields> = async ({
    otp,
  }) => {
    try {
      const emailVerificationToken = SecureStore.getItem(
        emailVerificationTokenFieldName
      );
      if (emailVerificationToken === null) {
        return;
      }
      const verificationData = {
        otp,
        emailVerificationToken,
      };
      if (purpose === emailVerificationPurposes.signup) {
        await signupEmailVerificationRequest(verificationData);
        navigation.navigate(completeSignupScreenName);
      } else if (purpose === emailVerificationPurposes.passwordReset) {
        await passwordResetVerificationRequest(verificationData);
        navigation.navigate(newPasswordScreenName);
      } else if (purpose === emailVerificationPurposes.login) {
        const jsonData = await loginVerificationRequest(verificationData);
        await SecureStore.deleteItemAsync(emailVerificationTokenFieldName);
        SecureStore.setItem(sessionIdFieldName, jsonData[sessionIdFieldName]);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: bottomTabNavigatorName }],
          })
        );
      } else if (purpose === emailVerificationPurposes.changeEmail) {
        await verificationForEmailChangeRequest(verificationData);
        await SecureStore.deleteItemAsync(emailVerificationTokenFieldName);
        Toast.show({
          text2: "Email changed",
          type: "info",
        });
        navigation.goBack();
        navigation.goBack();
      }
    } catch (err: any) {
      if (err.errors) {
        const error = err.errors[0];
        if (error.field) {
          form.setError(error.field, {
            message: error.message,
          });
        } else {
          form.setError("root.serverCatch", {
            message: error.message,
          });
        }
        return;
      }
      form.setError("root.serverCatch", {
        message: "Error",
      });
    }
  };

  const notifyThatOtpWasSent = () => {
    Toast.show({
      text2: "We have sent you a new code",
      type: "success",
    });
  };

  const {
    mutate: passwordReset,
    isPending: isPasswordResetPending,
    error: passwordResetError,
    reset: resetPasswordReset,
  } = useMutation({
    mutationFn: passwordResetRequest,
    onSuccess: notifyThatOtpWasSent,
  });

  const {
    mutate: signup,
    isPending: isSignupPending,
    error: signupError,
    reset: resetSignup,
  } = useMutation({
    mutationFn: signupRequest,
    onSuccess: notifyThatOtpWasSent,
  });

  const {
    mutate: sendNewOtpForlogin,
    isPending: isLoginPending,
    error: loginError,
    reset: resetLogin,
  } = useMutation({
    mutationFn: sendNewOtpForloginRequest,
    onSuccess: (data) => {
      SecureStore.setItem(
        emailVerificationTokenFieldName,
        data.emailVerificationToken
      );
      notifyThatOtpWasSent();
    },
    onError: (err: any) => {
      const error = err.errors[0];
      if (error.reason === "must_login_again") {
        navigation.goBack();
        Toast.show({
          text2: "You must log in you again",
          type: "error",
        });
      }
    },
  });

  const {
    mutate: requestNewOtpForEmailChange,
    isPending: isRequestNewOtpForEmailChangePending,
    error: requestNewOtpForEmailChangeError,
    reset: resetRequestNewOtpForEmailChange,
  } = useMutation({
    mutationFn: requestNewOtpForEmailChangeRequest,
    onSuccess: (data) => {
      notifyThatOtpWasSent();
      SecureStore.setItem(
        emailVerificationTokenFieldName,
        data.emailVerificationToken
      );
    },
    onError: (err: any) => {
      const error = err.errors[0];
      if (error.reason === "must_login_again") {
        navigation.goBack();
        // toast({
        //   colorScheme: "destructive",
        //   description: "You must log in you again",
        //   duration: 2000,
        // });
      }
    },
  });

  const isNewOtpSending =
    isSignupPending ||
    isPasswordResetPending ||
    isLoginPending ||
    isRequestNewOtpForEmailChangePending;

  const requestNewCode = () => {
    const emailVerificationToken = SecureStore.getItem(
      emailVerificationTokenFieldName
    );
    if (emailToVerify) {
      if (purpose === emailVerificationPurposes.passwordReset) {
        passwordReset({
          email: emailToVerify,
        });
      } else if (purpose === emailVerificationPurposes.signup) {
        signup({
          email: emailToVerify,
        });
      } else if (
        purpose === emailVerificationPurposes.login &&
        emailVerificationToken !== null
      ) {
        sendNewOtpForlogin({ emailVerificationToken });
      } else if (
        purpose === emailVerificationPurposes.changeEmail &&
        emailVerificationToken !== null
      ) {
        requestNewOtpForEmailChange({ emailVerificationToken });
      }
    }
  };

  const error =
    signupError ||
    passwordResetError ||
    loginError ||
    requestNewOtpForEmailChangeError;

  const showOtpInput = () => {
    resetSignup();
    resetPasswordReset();
    resetLogin();
    resetRequestNewOtpForEmailChange();
  };

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <Space height={10} />
      <FormProvider {...form}>
        <View
          style={{
            paddingHorizontal: 24,
            maxWidth: 800,
            width,
          }}
        >
          {error !== null ? (
            <View style={{ alignItems: "center" }}>
              <Alert
                variant="outline"
                status="destructive"
                description={(error as any).errors[0].message}
                style={{ marginBottom: 20 }}
              />
              <Button text="Ok" onPress={showOtpInput} />
            </View>
          ) : (
            <>
              {form.formState.errors.root &&
                form.formState.errors.root.serverCatch.message && (
                  <Alert
                    variant="outline"
                    status="destructive"
                    description={form.formState.errors.root.serverCatch.message}
                    style={{ marginBottom: 16 }}
                  />
                )}

              <Space height={14} />
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otp</FormLabel>
                    <Input
                      placeholder="Paste the otp you received by e-mail here"
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
                isLoading={form.formState.isSubmitting}
                text="Send"
                onPress={form.handleSubmit(onSubmit)}
              />

              <View
                style={{
                  alignItems: "flex-end",
                  width: "100%",
                  // backgroundColor: "blue",
                  flexDirection: "column",
                }}
              >
                <Space height={40} />

                <>
                  <MyText
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: "#4b5563",
                      textAlign: "center",
                    }}
                  >
                    The code expires after 10 minutes
                  </MyText>
                  <Space height={4} />

                  {isNewOtpSending ? (
                    <ActivityIndicator size="small" color={theme.gray500} />
                  ) : (
                    <Pressable onPress={requestNewCode}>
                      <MyText style={{ color: theme.blue }}>
                        Send a new code
                      </MyText>
                    </Pressable>
                  )}
                </>
              </View>
            </>
          )}
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

export const emailVerificationScreen = {
  name: emailVerificationScreenName,
  component: EmailVerificationScreen,
  options: {
    animation: "slide_from_right",
    title: "Email verification",
  } as NativeStackNavigationOptions,
};
