import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import SettingItem from "@/components/items/setting-item";

export const metadata = {
  title: "Security",
};

const SettingsSecurityPage = () => {
  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Security</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="px-2.5">
        <SettingItem
          id={10}
          path="/settings/security/sessions"
          label="Sessions"
        />
      </div>
    </>
  );
};

export default SettingsSecurityPage;
