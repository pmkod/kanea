import { Search } from "@/types/search";
import { httpClient } from "./http-client";

//
//
//
//
//

export const getSearchsRequest = (): Promise<{
  searchs: Search[];
}> => httpClient.get("searchs").json();

//
//
//
//
//

export const saveSearchRequest = ({
  searchedUserId,
}: {
  searchedUserId: string;
}): Promise<{
  search: Search;
}> => httpClient.post("searchs", { json: { searchedUserId } }).json();

//
//
//
//
//

export const deleteSearchRequest = (
  searchId: string
): Promise<{
  message: string;
}> => httpClient.delete(`searchs/${searchId}`).json();

//
//
//
//
//

export const deleteSearchsRequest = (): Promise<{
  message: string;
}> => httpClient.delete(`searchs`).json();
