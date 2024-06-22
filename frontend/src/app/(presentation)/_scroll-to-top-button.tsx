"use client";
import { useWindowScroll } from "@mantine/hooks";
import { PiCaretUp } from "react-icons/pi";

const ScrollToTopButton = () => {
  const [scroll, scrollTo] = useWindowScroll();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isScrollToTopButtonVisible = scroll.y > 700;
  return (
    isScrollToTopButtonVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 p-2.5 rounded-full border border-gray-200 shadow bg-white hover:bg-gray-100"
      >
        <PiCaretUp className="text-xl" />
      </button>
    )
  );
};

export default ScrollToTopButton;
