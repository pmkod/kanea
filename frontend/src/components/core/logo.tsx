"use client";

import { appName } from "@/constants/app-constants";
import {
  darkTheme,
  lightTheme,
  systemTheme,
} from "@/constants/theme-constants";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";

const Logo = () => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useLocalStorage<string>({
    key: "theme",
  });
  const alt = appName + " logo"

  const whiteTextLogoSrc = "/kanea-logo-white-text.png"
  const blackTextLogoSrc = "/kanea-logo-black-text.png"
  return (
    <div className="w-10">
      {theme === darkTheme.value ||
      (theme === systemTheme.value && colorScheme === darkTheme.value) ? (
        <img src={whiteTextLogoSrc} alt={alt} />
      ) : theme === lightTheme.value ||
        (theme === systemTheme.value && colorScheme === lightTheme.value) ? (
        <img src={blackTextLogoSrc} alt={alt} />
      ) : (
        <img src={blackTextLogoSrc} alt={alt} />
      )}
    </div>
  );
};

export default Logo;
