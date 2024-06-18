"use client";
import { darkTheme, lightTheme, themes } from "@/constants/theme-constants";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { MouseEventHandler, useState } from "react";
import { PiCheckCircleFill, PiCircle } from "react-icons/pi";

export const Themes = () => {
  // const colorScheme = useColorScheme();

  const [theme, setTheme] = useLocalStorage<string>({
    key: "theme",
  });

  // const [selectedThemeId, setSelectedThemeId] = useState(undefined)

  // const selectTheme = () => {

  // }

  return (
    <div className="flex gap-x-4 gap-y-4 flex-wrap">
      {themes.map(({ label, value }) => (
        <ThemeItem
          key={value}
          value={value}
          label={label}
          selected={theme === value}
          onClick={() => setTheme(value)}
        />
      ))}
    </div>
  );
};

interface ThemeItemProps {
  value: string;
  label: string;
  selected: boolean;
  onClick: MouseEventHandler<HTMLDivElement>;
}

export const ThemeItem = ({
  value,
  label,
  selected,
  onClick,
}: ThemeItemProps) => {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-x-4 rounded py-2 pl-3 w-44 max-w-full cursor-pointer border transition-all border-gray-400`}
    >
      <div
        className={`rounded-full text-2xl p-1.5 transition-colors group-hover:bg-gray-200 ${
          selected ? "text-blue-600" : ""
        }`}
      >
        {selected ? <PiCheckCircleFill /> : <PiCircle />}
      </div>
      <div className="text-lg font-semibold">{label}</div>
    </div>
  );
};
