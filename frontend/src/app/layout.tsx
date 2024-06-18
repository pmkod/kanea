import { appName } from "@/constants/app-constants";
import { Metadata } from "next";
import BaseLayoutWrapper from "./base-layout-wrapper";
import "./globals.css";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: "%s - " + appName,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get("x-nonce");
  return <BaseLayoutWrapper>{children}</BaseLayoutWrapper>;
}
