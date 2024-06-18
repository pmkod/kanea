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
  return (
    <div className="w-10">
      {theme === darkTheme.value ||
      (theme === systemTheme.value && colorScheme === darkTheme.value) ? (
        <img src="/kanea-logo-white-text.png" alt={appName + " logo"} />
      ) : theme === lightTheme.value ||
        (theme === systemTheme.value && colorScheme === lightTheme.value) ? (
        <img src="/kanea-logo-black-text.png" alt={appName + " logo"} />
      ) : null}
    </div>
  );
};

export default Logo;
