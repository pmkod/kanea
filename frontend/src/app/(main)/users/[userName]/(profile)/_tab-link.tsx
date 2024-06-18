"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabLinkProps {
  path: string;
  children: ReactNode;
}

export const TabLink = ({ path, children }: TabLinkProps) => {
  const currentPathname = usePathname();
  return (
    <Link
      href={path}
      className={`inline-flex justify-center items-center gap-x-2 flex-1 sm:flex-none text-lg font-semibold sm:px-7 py-2 border-b-2 ${
        currentPathname === path
          ? "border-b-gray-700 text-gray-900"
          : "border-transparent text-gray-400"
      }`}
    >
      {children}
    </Link>
  );
};
