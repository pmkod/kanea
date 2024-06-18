"use client";

import PasswordResetForm from "@/components/forms/password-reset-form";
import { emailVerificationPurposes } from "@/constants/email-verification-constants";
import { useRouter } from "next/navigation";

const PasswordReset = () => {
  const router = useRouter();
  const whenSuccess = () => {
    router.push(
      `/email-verification?purpose=${emailVerificationPurposes.passwordReset}`
    );
  };
  return (
    <PasswordResetForm
      formTitle="Reset your password"
      onSuccess={whenSuccess}
    />
  );
};

export default PasswordReset;
