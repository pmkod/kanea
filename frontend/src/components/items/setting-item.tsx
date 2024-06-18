"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { HiOutlineChevronRight } from "react-icons/hi";

export interface SettingItemProps {
  id?: number;
  label: string;
  path: string;
  leftIcon?: ReactNode;
  description?: string;
}

const SettingItem = ({
  id,
  label,
  leftIcon,
  path,
  description,
}: SettingItemProps) => {
  const pathname = usePathname();
  return (
    <Link
      href={path}
      className={`py-2 px-3 rounded font-medium text-gray-900 flex items-center w-full ${
        pathname.startsWith(path) ? "bg-gray-100" : ""
      } hover:bg-gray-100 transition-colors`}
    >
      {leftIcon && <div className="text-xl mr-4">{leftIcon}</div>}
      <div className="flex-1">
        <div>{label}</div>
        {description && (
          <div className="text-gray-600 text-sm mt-1">{description}</div>
        )}
      </div>
      <div className="text-sm">
        <HiOutlineChevronRight />
      </div>
    </Link>
  );
};

export default SettingItem;
