"use client";
import NewPasswordForm from "@/components/forms/new-password-form";
import { useRouter } from "next/navigation";

const NewPassword = () => {
  const router = useRouter();
  const whenSuccess = () => {
    router.replace("/home");
  };
  return (
    <NewPasswordForm
      formTitle="Choose your new password"
      onSuccess={whenSuccess}
    />
  );
};

export default NewPassword;
