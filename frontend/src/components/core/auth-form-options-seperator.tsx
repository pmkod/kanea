"use client";
import React from "react";

const AuthFormOptionsSeperator = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex items-center gap-4 my-3">
      <div className="h-px flex-1 bg-gray-300" />
      <span className="text-sm text-gray-400">{children}</span>
      <div className="h-px flex-1 bg-gray-300" />
    </div>
  );
};

export default AuthFormOptionsSeperator;
