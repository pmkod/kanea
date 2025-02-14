import "./globals.css";
import "./my.css";
import { appName } from "@/constants/app-constants";
import { Metadata } from "next";
import BaseLayoutWrapper from "./base-layout-wrapper";
import { headers } from "next/headers";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: "%s - " + appName,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = headers().get("x-nonce") || undefined;
  return (
    <BaseLayoutWrapper>
      {children}
      <Script
        async
        nonce={nonce}
        src="https://analytics.4ml3f81l4vtbdgwuldhdcqwbq7reg4oiffr3xdbi.kodossou.com/script.js"
        data-website-id="16882b32-b23d-4818-8acd-31daf86ec5cd"
      />
    </BaseLayoutWrapper>
  );
}
