import BottomNav from "@/components/partials/bottom-nav";
import { Metadata } from "next";
import { Buttons } from "./_buttons";

export const metadata: Metadata = {
  title: "Discussions",
};

const DiscussionsPage = () => {
  return (
    <>
      <div className="hidden md:block flex-1 px-4 md:px-10 lg:px-28 h-full">
        <div className="mt-44">
          <div className="mb-1.5 text-2xl lg:text-3xl font-bold">
            Choose a discussion
          </div>
          <div className="mb-9 text-gray-700 leading-tight">
            Select a discussion or <br /> create a new one
          </div>
          <Buttons />
        </div>
      </div>

      <BottomNav />
    </>
  );
};

export default DiscussionsPage;
