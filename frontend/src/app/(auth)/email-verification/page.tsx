import { Metadata } from "next";
import EmailVerification from "./_email-verification";

export const metadata: Metadata = {
  title: "Email verification",
};

const EmailVerificationPage = () => {
  return <EmailVerification />;
};

export default EmailVerificationPage;
