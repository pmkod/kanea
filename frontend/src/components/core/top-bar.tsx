"use client";
import { useRouter } from "next/navigation";
import { PropsWithChildren, ReactNode } from "react";
import { PiArrowLeft } from "react-icons/pi";

interface TopBarProps {
  children: ReactNode;
  position?: "sticky" | "static";
}

export const TopBar = ({ position = "static", children }: TopBarProps) => {
  return (
    <div
      className={`flex items-center justify-between h-14 px-6 bg-white ${
        position === "sticky" ? "sticky top-0 z-40" : "z-30"
      }`}
    >
      {children}
    </div>
  );
};

export const TopBarTitle = ({ children }: PropsWithChildren) => {
  return <div className="text-lg font-semibold text-gray-800">{children}</div>;
};

interface TopBarGoBackButtonProps {
  onClick?: () => void;
}

export const TopBarGoBackButton = ({ onClick }: TopBarGoBackButtonProps) => {
  const router = useRouter();
  const goToPreviousPage = () => {
    router.back();
  };
  return (
    <button
      onClick={onClick || goToPreviousPage}
      className="-mx-2.5 p-2 mr-1 flex justify-center items-center rounded hover:bg-gray-100 text-xl transition-colors"
    >
      <PiArrowLeft />
    </button>
  );
};

export const TopBarLeftPart = ({ children }: PropsWithChildren) => {
  return <div className="flex items-center gap-x-2 flex-1">{children}</div>;
};

export const TopBarRightPart = ({ children }: PropsWithChildren) => {
  return <div className="flex gap-x-2">{children}</div>;
};
