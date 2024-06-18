import { Metadata } from "next";
import BlockedUsers from "./_blocked-users";

export const metadata: Metadata = {
  title: "Blocked users",
};

const BlockedUsersPage = () => {
  return <BlockedUsers />;
};

export default BlockedUsersPage;
