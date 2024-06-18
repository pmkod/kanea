import { ScrollToTop } from "@/components/others/scroll-to-top";
import { PropsWithChildren } from "react";
import Footer from "./_footer";
import Header from "./_header";
import ScrollToTopButton from "./_scroll-to-top-button";

const PresentationLayout = ({ children }: PropsWithChildren) => {
  return (
    <>
      <Header />
      <ScrollToTop />
      <div className="min-h-screen">{children}</div>

      <ScrollToTopButton />
      <Footer />
    </>
  );
};

export default PresentationLayout;
