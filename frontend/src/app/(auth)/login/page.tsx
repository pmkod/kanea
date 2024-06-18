import { appName } from "@/constants/app-constants";
import { Metadata } from "next";
import LoginForm from "@/components/forms/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your " + appName + " account",
};

const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
