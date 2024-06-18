import { Metadata } from "next";
import PasswordReset from "./_password-reset";

export const metadata: Metadata = {
  title: "Password reset",
  description: "Enter your email. We need it to find your account",
};

const PasswordResetPage = () => {
  return <PasswordReset />;
};

export default PasswordResetPage;
