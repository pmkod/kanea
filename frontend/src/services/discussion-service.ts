import { BlocksInRelationToThisDiscussion } from "@/types/blocks-in-relation-to-this-discussion";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { httpClient } from "./http-client";

//
//
//
//

export const getDiscussionsRequest = async ({
  page,
}: {
  page: number;
}): Promise<{
  discussions: Discussion[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "15");
  return await httpClient.get("discussions", { searchParams }).json();
};

//
//
//
//

export const searchDiscussionsRequest = async ({
  q,
}: {
  q: string;
}): Promise<{
  discussions: Discussion[];
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", "8");
  searchParams.set("q", q);
  return await httpClient
    .get("discussions/many/search", { searchParams })
    .json();
};

//
//
//
//

export const getDiscussionDetailsRequest = async (
  discussionId: string
): Promise<{
  discussion: Discussion;
  blocksInRelationToThisDiscussion: BlocksInRelationToThisDiscussion[];
}> => await httpClient.get(`discussions/${discussionId}`).json();

//
//
//
//

export const getDiscussionMessagesRequest = async (
  discussionId: string,
  {
    page,
    limit,
  }: {
    page: number;
    limit: number;
  }
): Promise<{
  messages: Message[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  const data: any = await httpClient
    .get(`discussions/${discussionId}/messages`, { searchParams })
    .json();
  return data;
};

//
//
//
//

export const getDiscussionMessagesWithMediasRequest = async (
  discussionId: string,
  {
    page,
    firstPageRequestedAt,
  }: {
    page: number;
    firstPageRequestedAt: Date;
  }
): Promise<{
  messages: Message[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "20");
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  const data: any = await httpClient
    .get(`discussions/${discussionId}/messages-with-medias`, {
      searchParams,
    })
    .json();
  return data;
};

//
//
//
//

export const getDiscussionMessagesWithDocsRequest = async (
  discussionId: string,
  {
    page,
    firstPageRequestedAt,
  }: {
    page: number;
    firstPageRequestedAt: Date;
  }
): Promise<{
  messages: Message[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "20");
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  const data: any = await httpClient
    .get(`discussions/${discussionId}/messages-with-docs`, {
      searchParams,
    })
    .json();
  return data;
};

//
//
//
//

export const getDiscussionMessagesWithMediasAndDocsRequest = async (
  discussionId: string
): Promise<{
  messages: Message[];
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", "10");
  const data: any = await httpClient
    .get(`discussions/${discussionId}/messages-with-medias-and-docs`, {
      searchParams,
    })
    .json();
  return data;
};

//
//
//
//

export const defineGroupDiscussionMemberAsAdminRequest = async (
  discussionId: string,
  userId: string
): Promise<{}> =>
  await httpClient
    .get(`discussions/${discussionId}/members/${userId}/define-as-admin`)
    .json();
//
//
//

export const dismissGroupDiscussionMemberAsAdminRequest = async (
  discussionId: string,
  userId: string
): Promise<{}> =>
  await httpClient
    .get(`discussions/${discussionId}/members/${userId}/dismiss-as-admin`)
    .json();

//
//
//

export const checkIfDiscussionBetweenMeAndAnUserExistRequest = async (
  userId: string
): Promise<{ discussion: Discussion }> =>
  await httpClient
    .post("discussions/one/between-me-and-an-user", {
      json: {
        userId,
      },
    })
    .json();
