"use client";
import { Toaster } from "@/components/core/toaster";
import { Nunito_Sans } from "next/font/google";
import { PropsWithChildren, useEffect } from "react";
import NiceModalProvider from "./nicemodal-provider";
import TanstackQueryProvider from "./tanstack-provider";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import {
  darkTheme,
  lightTheme,
  systemTheme,
} from "@/constants/theme-constants";

const nunitoSans = Nunito_Sans({ subsets: ["latin"] });

const BaseLayoutWrapper = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useLocalStorage<string>({
    key: "theme",
  });
  const colorScheme = useColorScheme();

  useEffect(() => {
    const th = localStorage.getItem("theme");

    if (th === undefined || th === '"undefined"') {
      setTheme("light");
    }
  }, []);

  return (
    <html
      lang="en"
      className={theme === systemTheme.value ? colorScheme : theme}
    >
      <body className={nunitoSans.className + " overflow-x-hidden"}>
        <Toaster />
        <TanstackQueryProvider>
          <NiceModalProvider>{children}</NiceModalProvider>
        </TanstackQueryProvider>
      </body>
    </html>
  );
};

export default BaseLayoutWrapper;
