import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import SettingItem from "@/components/items/setting-item";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discussions",
};

const SettingDiscussionsPage = () => {
  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Discussions</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="px-2.5">
        <SettingItem
          id={1}
          path="/settings/discussions/online-status-visibility"
          label="Online status visibility"
        />
      </div>
    </>
  );
};

export default SettingDiscussionsPage;
