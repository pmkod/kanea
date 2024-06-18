"use client";
import { useToast } from "@/components/core/use-toast";
import EmailVerificationForm, {
  emailToVerifyAtom,
} from "@/components/forms/email-verification-form";
import { emailVerificationPurposes } from "@/constants/email-verification-constants";
import {
  loginVerificationRequest,
  passwordResetRequest,
  passwordResetVerificationRequest,
  sendNewOtpForloginRequest,
  signupEmailVerificationRequest,
  signupRequest,
} from "@/services/auth-service";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
const EmailVerification = () => {
  const searchParams = useSearchParams();
  const purpose = searchParams.get("purpose");
  const router = useRouter();
  const [emailToVerify, setEmailToVerify] = useAtom(emailToVerifyAtom);
  const { toast } = useToast();

  // useEffect(() => {
  //   if (emailToVerify === undefined) {
  //     router.push("/");
  //   }
  // }, []);

  const sendOtp = async (otp: string) => {
    if (purpose === emailVerificationPurposes.signup) {
      await signupEmailVerificationRequest(otp);
      router.push("/signup/complete");
    } else if (purpose === emailVerificationPurposes.passwordReset) {
      await passwordResetVerificationRequest(otp);
      router.push("/password-reset/new-password");
    } else if (purpose === emailVerificationPurposes.login) {
      await loginVerificationRequest(otp);
      router.replace("/home");
    }
    setEmailToVerify(undefined);
  };

  const notifyThatOtpWasSent = () => {
    toast({
      colorScheme: "success",
      description: "We have sent you a new otp",
      duration: 1500,
    });
  };

  const {
    mutate: passwordReset,
    isPending: isPasswordResetPending,
    error: passwordResetError,
    reset: resetPasswordReset,
  } = useMutation({
    mutationFn: passwordResetRequest,
    onSuccess: () => {
      notifyThatOtpWasSent();
    },
  });

  const {
    mutate: signup,
    isPending: isSignupPending,
    error: signupError,
    reset: resetSignup,
  } = useMutation({
    mutationFn: signupRequest,
    onSuccess: () => {
      notifyThatOtpWasSent();
    },
  });

  const {
    mutate: sendNewOtpForlogin,
    isPending: isLoginPending,
    error: loginError,
    reset: resetLogin,
  } = useMutation({
    mutationFn: sendNewOtpForloginRequest,
    onSuccess: (data) => {
      notifyThatOtpWasSent();
    },
    onError: (err: any) => {
      const error = err.errors[0];
      if (error.reason === "must_login_again") {
        toast({
          colorScheme: "destructive",
          description: "You must log in you again",
          duration: 2000,
        });
        router.push("/login");
      }
    },
  });

  const requestNewOtp = () => {
    if (emailToVerify) {
      if (purpose === emailVerificationPurposes.passwordReset) {
        passwordReset({
          email: emailToVerify,
        });
      } else if (purpose === emailVerificationPurposes.signup) {
        signup({
          email: emailToVerify,
        });
      } else if (purpose === emailVerificationPurposes.login) {
        sendNewOtpForlogin();
      }
    }
  };

  const resetError = () => {
    if (purpose === emailVerificationPurposes.signup) {
      resetSignup();
    } else if (purpose === emailVerificationPurposes.passwordReset) {
      resetPasswordReset();
    } else if (purpose === emailVerificationPurposes.login) {
      resetLogin();
    }
  };
  return (
    <EmailVerificationForm
      formTitle="Email verification"
      onSendOtp={sendOtp}
      onRequestNewOtp={requestNewOtp}
      isNewOtpSending={
        isSignupPending || isPasswordResetPending || isLoginPending
      }
      error={signupError || passwordResetError || loginError}
      resetError={resetError}
    />
  );
};

export default EmailVerification;
