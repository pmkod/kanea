import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import { Metadata } from "next";
import { Themes } from "./_theme";

export const metadata: Metadata = {
  title: "Theme",
};

const SettingsThemePage = () => {
  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Theme</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="px-6">
        <div className="mt-4 mb-2 text-xl font-semibold">Choose your theme</div>
        <Themes />
      </div>
    </>
  );
};

export default SettingsThemePage;
