import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import ChangeEmailForm from "@/components/forms/change-email-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change email",
};

const ChangeEmailPage = () => {
  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Change your email</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="pt-5 px-5">
        <ChangeEmailForm />
      </div>
    </>
  );
};

export default ChangeEmailPage;
