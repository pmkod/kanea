"use client";
import Logo from "@/components/core/logo";
import PublishPostModal from "@/components/modals/publish-post-modal";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import NiceModal from "@ebay/nice-modal-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import {
  PiBell,
  PiChatCircleDots,
  PiGear,
  PiHouse,
  PiMagnifyingGlass,
  PiPlus,
  PiUser,
} from "react-icons/pi";
import UserDropdown from "./_user-dropdown";

interface SidebarLinkProps {
  path: string;
  label: string;
  icon: ReactNode;
  numberInsideBadge?: number;
}

const SidebarLink = ({
  path,
  label,
  icon,
  numberInsideBadge,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActivePath = pathname.startsWith(path);
  return (
    <Link
      href={path}
      className={`w-max relative lg:w-full flex items-center text-gray-800 rounded transition-colors ${
        isActivePath ? "bg-gray-100" : "hover:bg-gray-100"
      }`}
    >
      <div className="text-xl px-3 py-2">{icon}</div>
      <span className="hidden lg:block font-semibold text-gray-700">
        {label}
      </span>
      {numberInsideBadge !== undefined && numberInsideBadge > 0 && (
        <div className="absolute top-2 lg:top-1/2 left-5 lg:left-40 w-max lg:right-4 rounded-full px-1.5 py-1 text-[10px] leading-none transform -translate-y-1/2 bg-blue-600 text-white font-bold">
          {numberInsideBadge > 999 ? "+999" : numberInsideBadge}
        </div>
      )}
    </Link>
  );
};

const Sidebar = () => {
  const router = useRouter();
  const { data, isSuccess } = useLoggedInUser({
    enabled: true,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    router.prefetch("/settings/account");
  }, []);

  const openPublishPostModal = () => {
    NiceModal.show(PublishPostModal);
  };
  return (
    <div className="sticky top-0 h-screen hidden md:w-[72px] lg:w-60 md:flex flex-col items-center lg:items-stretch">
      <div className="lg:pl-8 h-14 flex items-center">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 flex flex-col items-center lg:items-stretch justify-between">
        <div className="w-max lg:w-full px-0 lg:px-4 h-full mt-2">
          <SidebarLink path="/home" label="Home" icon={<PiHouse />} />
          <SidebarLink
            path="/explore"
            label="Explore"
            icon={<PiMagnifyingGlass />}
          />
          <SidebarLink
            path="/discussions"
            label="Discussions"
            icon={<PiChatCircleDots />}
            numberInsideBadge={data?.user.unseenDiscussionMessagesCount}
          />
          <SidebarLink
            path="/notifications"
            label="Notifications"
            icon={<PiBell />}
            numberInsideBadge={data?.user.unseenNotificationsCount}
          />

          {isSuccess && (
            <SidebarLink
              path={`/users/${data?.user.userName}`}
              label="Profile"
              icon={<PiUser />}
            />
          )}
          <SidebarLink path="/settings" label="Settings" icon={<PiGear />} />
        </div>
        <div className="px-0 lg:px-4 mb-4 flex flex-col items-center">
          <button
            onClick={openPublishPostModal}
            className="mb-3 w-max mx-auto lg:w-full px-3.5 py-3.5 lg:py-2.5 rounded flex items-center justify-center text-lg bg-gray-900 hover:bg-gray-800 transition-colors text-white"
          >
            <PiPlus />
            <span className="ml-2 hidden lg:inline font-medium text-sm">
              Publish a post
            </span>
          </button>
          <UserDropdown />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
