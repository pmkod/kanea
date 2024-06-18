import { Notification } from "@/types/notification";
import { httpClient } from "./http-client";

export const getNotificationsRequest = async ({
  page,
  firstPageRequestedAt,
}: {
  page: number;
  firstPageRequestedAt: Date;
}): Promise<{
  notifications: Notification[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "20");
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient.get(`notifications`, { searchParams }).json();
};
