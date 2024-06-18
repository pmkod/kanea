import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import { ChangePasswordForm } from "@/components/forms/change-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change your password",
};

const ChangePasswordPage = () => {
  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Change your password</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="pt-5 px-6">
        <ChangePasswordForm />
      </div>
    </>
  );
};

export default ChangePasswordPage;
