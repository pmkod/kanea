"use client";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useClickOutside, useLocalStorage } from "@mantine/hooks";
import { ReactElement, useEffect, useState } from "react";
import {
  autoPlacement,
  autoUpdate,
  shift,
  useFloating,
} from "@floating-ui/react";
import "./emoji-dropdown.css";

interface EmojiDropdownProps {
  handleEmojiSelect: (emojiObject: any) => void;
  children: ReactElement;
  onOpenChange?: (open: boolean) => void;
}

export const EmojiDropdown = ({
  handleEmojiSelect,
  children,
  onOpenChange,
}: EmojiDropdownProps) => {
  const [isEmojiDropdownOpen, setIsEmojiDropdownOpen] = useState(false);

  useEffect(() => {
    if (onOpenChange !== undefined) {
      onOpenChange(isEmojiDropdownOpen);
    }
  }, [isEmojiDropdownOpen]);

  const hideDropdown = () => {
    setIsEmojiDropdownOpen(false);
  };
  const ref = useClickOutside(() => hideDropdown());
  const { refs, floatingStyles } = useFloating({
    open: isEmojiDropdownOpen,
    onOpenChange: setIsEmojiDropdownOpen,
    middleware: [
      autoPlacement({
        autoAlignment: true,
        rootBoundary: "document",
        crossAxis: true,
      }),
      shift(),
    ],
    whileElementsMounted: autoUpdate,
  });

  const [theme, setTheme] = useLocalStorage<string>({
    key: "theme",
  });
  const toggleDropdown = () => {
    setIsEmojiDropdownOpen((prevState) => !prevState);
  };
  // children.props.onClick = showDropdown;
  // children.ref = refs.setReference;
  return (
    <div ref={ref}>
      {isEmojiDropdownOpen && (
        <div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: 80 }}>
          <Picker
            data={data}
            emojiSize={22}
            onEmojiSelect={handleEmojiSelect}
            previewPosition="none"
            theme={theme}
            skinTonePosition="search"
            perLine={8}
          />
        </div>
      )}
      <div ref={refs.setReference} onClick={toggleDropdown}>
        {children}
      </div>
    </div>
  );
};
