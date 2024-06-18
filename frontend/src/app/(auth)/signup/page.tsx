import { Metadata } from "next";
import SignupForm from "@/components/forms/signup-form";

export const metadata: Metadata = {
  title: "Sign up",
};

const SignupPage = () => {
  return <SignupForm />;
};

export default SignupPage;
