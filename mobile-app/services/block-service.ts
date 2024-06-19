import { User } from "@/types/user";
import { httpClient } from "./http-client";

export const getBlocksRequest = async ({
  page,
  firstPageRequestedAt,
  sort,
}: {
  page: number;
  firstPageRequestedAt?: Date;
  sort: string;
}): Promise<{
  blocks: {
    id: string;
    blockerId: string;
    blockedId: string;
    blocked: User;
    createdAt: Date;
  }[];
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", `${page}`);
  searchParams.set("limit", "18");
  searchParams.set("sort", sort);
  searchParams.set(
    "firstPageRequestedAt",
    (firstPageRequestedAt || new Date()).toISOString()
  );

  return await httpClient.get("blocks", { searchParams }).json();
};
