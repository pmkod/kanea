import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import ChangeUsernameForm from "@/components/forms/change-username-form";

const ChangeUsernamePage = () => {
  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Change your username</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="pt-5 px-5">
        <ChangeUsernameForm />
      </div>
    </>
  );
};

export default ChangeUsernamePage;
