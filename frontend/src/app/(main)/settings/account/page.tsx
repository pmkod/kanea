import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import SettingItem from "@/components/items/setting-item";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
};

const SettingsAccountPage = () => {
  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Account</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="px-2.5">
        <SettingItem
          id={10}
          path="/settings/account/change-email"
          label="Change email"
        />
        <SettingItem
          id={11}
          path="/settings/account/change-username"
          label="Change your username"
        />
        <SettingItem
          id={12}
          path="/settings/account/change-password"
          label="Change your password"
        />
      </div>
    </>
  );
};

export default SettingsAccountPage;
