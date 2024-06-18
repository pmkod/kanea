"use client";
import React, { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import DiscussionsList from "./_discussions-list";

const DiscussionsLayout = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  return (
    <div className="flex h-screen">
      <div
        className={
          pathname.startsWith("/discussions/") ? "hidden md:block" : ""
        }
      >
        <DiscussionsList />
      </div>

      {children}
    </div>
  );
};

export default DiscussionsLayout;
