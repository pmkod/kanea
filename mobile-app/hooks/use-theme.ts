import { themeAtom } from "@/atoms/theme-atom";
import { useAtom } from "jotai";

export const useTheme = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  return { theme, setTheme };
};
