import { Metadata } from "next";
import Sessions from "./_sessions";

export const metadata: Metadata = {
  title: "Sessions",
};

const SessionsPage = () => {
  return <Sessions />;
};

export default SessionsPage;
