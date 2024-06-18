import { Metadata } from "next";
import Session from "./_session";

export const metadata: Metadata = {
  title: "Session",
};

const SessionPage = () => {
  return <Session />;
};

export default SessionPage;
