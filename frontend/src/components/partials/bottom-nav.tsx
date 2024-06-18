"use client";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import {
  PiBell,
  PiChatCircleDots,
  PiHouse,
  PiMagnifyingGlass,
  PiUser,
} from "react-icons/pi";

interface BottomNavItemProps {
  path: string;
  label: string;
  icon: ReactNode;
  numberInsideBadge?: number;
}

const BottomNavItem = ({
  path,
  label,
  icon,
  numberInsideBadge,
}: BottomNavItemProps) => {
  const pathname = usePathname();
  const isActivePath = pathname.startsWith(path);

  return (
    <Link
      href={path}
      className={`flex-1 relative flex justify-center items-center rounded transition-colors`}
    >
      <div className={`text-2xl ${isActivePath ? "" : "opacity-50"}`}>
        {icon}
      </div>
      {numberInsideBadge && numberInsideBadge > 0 ? (
        <div className="absolute top-2 left-1/2 rounded-full px-1.5 py-1 text-[10px] bg-blue-500 text-white font-bold leading-none">
          {numberInsideBadge > 999 ? "+999" : numberInsideBadge}
        </div>
      ) : null}
    </Link>
  );
};

const BottomNav = () => {
  const { data, isLoading, isSuccess } = useLoggedInUser({
    enabled: true,
    refetchOnWindowFocus: true,
  });
  const bottomNavItems = [
    { path: "/home", label: "Home", icon: <PiHouse /> },
    { path: "/explore", label: "Explore", icon: <PiMagnifyingGlass /> },
    {
      path: "/notifications",
      label: "Notifications",
      icon: <PiBell />,
      numberInsideBadge: data?.user.unseenNotificationsCount,
    },
    {
      path: "/discussions",
      label: "Discussions",
      icon: <PiChatCircleDots />,
      numberInsideBadge: data?.user.unseenDiscussionMessagesCount,
    },
  ];

  return (
    <div className="w-full fixed z-40 bottom-0 left-0 ring-0 h-14 flex md:hidden bg-white border-t">
      {bottomNavItems.map((bottomNavItem) => (
        <BottomNavItem key={bottomNavItem.path} {...bottomNavItem} />
      ))}
      {isSuccess && (
        <BottomNavItem
          path={`/users/${data?.user.userName}`}
          label="Profile"
          icon={<PiUser />}
        />
      )}
    </div>
  );
};

export default BottomNav;
