import { Metadata } from "next";
import CompleteSignupForm from "@/components/forms/complete-singup-form";

export const metadata: Metadata = {
  title: "Complete sign up",
};

const CompleteSignupPage = () => {
  return <CompleteSignupForm />;
};

export default CompleteSignupPage;
