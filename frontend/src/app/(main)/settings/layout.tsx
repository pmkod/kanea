"use client";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import SettingItem, { SettingItemProps } from "@/components/items/setting-item";
import { useMediaQuery } from "@mantine/hooks";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";
import { LiaUserLockSolid } from "react-icons/lia";
import { PiLockKey, PiSun, PiUser } from "react-icons/pi";
import { TbMessageCog } from "react-icons/tb";



const SettingsLayout = ({ children }: PropsWithChildren) => {
  const settingItems: SettingItemProps[] = [
    {
      id: 1,
      label: "Account",
      path: "/settings/account",
      leftIcon: <PiUser />,
    },
    {
      id: 2,
      label: "Security",
      path: "/settings/security",
      leftIcon: <PiLockKey />,
    },
    {
      id: 3,
      label: "Theme",
      path: "/settings/theme",
      leftIcon: <PiSun />,
    },
  
    {
      id: 4,
      label: "Online status",
      path: "/settings/online-status",
      leftIcon: <TbMessageCog />,
    },
    {
      id: 5,
      label: "Blocked users",
      path: "/settings/blocked-users",
      leftIcon: <LiaUserLockSolid />,
    },
  ];
  const pathname = usePathname();
  const matches = useMediaQuery("(min-width: 768px)", true, {
    getInitialValueInEffect: false,
  });
  //
  //
  const settingListIsVisible = () => {
    if (pathname === "/settings" || matches) {
      return true;
    }
    return false;
  };
  //
  //
  const settingContentIsVisible = () => {
    if (matches || pathname !== "/settings") {
      return true;
    }
    return false;
  };
  //
  //
  return (
    <div className="flex h-screen">
      {settingListIsVisible() && (
        <div className={matches ? "w-80 lg:w-96" : "w-full"}>
          <TopBar>
            <TopBarLeftPart>
              <div className="md:hidden">
                <TopBarGoBackButton />
              </div>
              <TopBarTitle>Settings</TopBarTitle>
            </TopBarLeftPart>
          </TopBar>
          <div className="mt-1.5">
            <div className="px-3">
              {settingItems.map((settingItem) => (
                <SettingItem key={settingItem.id} {...settingItem} />
              ))}
            </div>
          </div>
        </div>
      )}

      {settingContentIsVisible() && (
        <div className="flex-1 flex flex-col">{children}</div>
      )}
    </div>
  );
};

export default SettingsLayout;
