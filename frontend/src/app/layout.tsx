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
          src="https://analytics.kanea.net/script.js" data-website-id="db8a1067-555d-476a-ac0f-9809060e1de3" />
  </BaseLayoutWrapper>;
}
