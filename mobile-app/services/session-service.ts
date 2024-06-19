import { Session } from "@/types/session";
import { httpClient } from "./http-client";

//
//
//
//
//

export const getActiveSessionsRequest = async ({
  page,
  firstPageRequestedAt,
}: {
  page: number;
  firstPageRequestedAt?: Date;
}): Promise<{
  otherSessions: Session[];
  currentSession: Session;
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "30");
  searchParams.set(
    "firstPageRequestedAt",
    (firstPageRequestedAt || new Date()).toISOString()
  );

  return await httpClient.get("sessions", { searchParams }).json();
};

//
//
//
//
//
//

export const getActiveSessionRequest = async (
  id: string
): Promise<{
  session: Session;
}> => await httpClient.get(`sessions/${id}`).json();

//
//
//
//
//
//

export const logoutOfSessionRequest = async (id: string) =>
  (await httpClient.delete(`sessions/${id}`).json()) as any;

//
//
//
//
//
//

export const logoutOfOthersSessionRequest = async () =>
  (await httpClient.delete("sessions/others").json()) as any;
