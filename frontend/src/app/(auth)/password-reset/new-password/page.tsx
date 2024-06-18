import { Metadata } from "next";
import NewPassword from "./_new-password";

export const metadata: Metadata = {
  title: "New password",
};

const NewPasswordPage = () => {
  return <NewPassword />;
};

export default NewPasswordPage;
