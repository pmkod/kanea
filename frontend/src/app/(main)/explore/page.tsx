import { Metadata } from "next";
import Explore from "./_explore";

export const metadata: Metadata = {
  title: "Explore",
};

const ExplorePage = () => {
  return <Explore />;
};

export default ExplorePage;
