import { Metadata } from "next";
import Home from "./_home";

export const metadata: Metadata = {
  title: "Home",
};

const HomePage = () => {
  return <Home />;
};

export default HomePage;
