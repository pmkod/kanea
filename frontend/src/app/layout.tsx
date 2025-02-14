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
	const nonce = (await headers()).get("x-nonce") || undefined;
  return <BaseLayoutWrapper>{children}
        <Script async
					nonce={nonce}
          src="https://analytics.4ml3f81l4vtbdgwuldhdcqwbq7reg4oiffr3xdbi.kodossou.com/script.js" data-website-id="36bf7c83-2410-4ee3-a2fe-ec6000b19fba" />
  </BaseLayoutWrapper>;
}
