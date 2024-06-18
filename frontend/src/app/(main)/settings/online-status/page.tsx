import { Metadata } from "next";
import OnlineStatus from "./_online-status";

export const metadata: Metadata = {
  title: "Online status",
};

const OnlineStatusPage = () => {
  return <OnlineStatus />;
};

export default OnlineStatusPage;
