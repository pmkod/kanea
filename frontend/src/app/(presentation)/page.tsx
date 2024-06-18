import { appName } from "@/constants/app-constants";
import { Metadata } from "next";
import First from "./_first";

export const metadata: Metadata = {
  description: `Welcome to ${appName}, create posts to share the best moments of your life, look at other users' posts, chat with your friends`,
};

const FirstPage = () => {
  return <First />;
};

export default FirstPage;
