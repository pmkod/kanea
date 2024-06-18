import { Metadata } from "next";
import Notifications from "./_notifications";

export const metadata: Metadata = {
  title: "Notifications",
};

const NotificationsPage = () => {
  return <Notifications />;
};

export default NotificationsPage;
