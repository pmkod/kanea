import { User } from "@/types/user";
import { httpClient } from "./http-client";
import { Post } from "@/types/post";
import { Follow } from "@/types/follow";
import { emailVerificationTokenFieldName } from "@/constants/email-verification-constants";

//
//
//
//

interface GetUsersRequestParams {
  q?: string;
  limit?: string;
}
export const getUsersRequest = async ({
  q,
  limit,
}: GetUsersRequestParams): Promise<{
  users: User[];
}> => {
  const searchParams = new URLSearchParams();
  if (q) searchParams.set("q", q);
  if (limit) searchParams.set("limit", limit);
  return await httpClient.get("users", { searchParams }).json();
};

//
//
//
//

interface GetUsersSuggestionToFollowRequestParams {
  firstPageRequestedAt: Date;
  limit: number;
}
export const getUsersSuggestionsToFollowRequest = async ({
  firstPageRequestedAt,
  limit,
}: GetUsersSuggestionToFollowRequestParams): Promise<{
  users: User[];
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("limit", `${limit}`);
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return await httpClient
    .get("users/suggestions/to-follow", { searchParams })
    .json();
};

//
//
//
//

export const getLoggedInUserRequest = async (): Promise<{
  user: User;
}> => {
  return await httpClient.get("user").json();
};

//
//
//
//

export const getUserFollowersRequest = async (
  userId: string,
  {
    page,
    limit,
    firstPageRequestedAt,
  }: { page: number; limit: number; firstPageRequestedAt?: Date }
): Promise<{
  follows: Follow[];
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  searchParams.set(
    "firstPageRequestedAt",
    (firstPageRequestedAt || new Date()).toISOString()
  );

  return httpClient.get(`users/${userId}/followers`, { searchParams }).json();
};
export const getUserFollowingRequest = async (
  userId: string,
  {
    page,
    limit,
    firstPageRequestedAt,
  }: { page: number; limit: number; firstPageRequestedAt?: Date }
): Promise<{
  follows: Follow[];
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  searchParams.set(
    "firstPageRequestedAt",
    (firstPageRequestedAt || new Date()).toISOString()
  );

  return httpClient.get(`users/${userId}/following`, { searchParams }).json();
};

//
//
//
//
//
//
//
//
//
//

export const getLoggedInuserFollowingTimelineRequest = async ({
  page,
  firstPageRequestedAt,
}: {
  page: number;
  firstPageRequestedAt?: Date;
}): Promise<{
  posts: Post[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", page.toString());
  searchParams.set("limit", "3");
  searchParams.set(
    "firstPageRequestedAt",
    (firstPageRequestedAt || new Date()).toISOString()
  );
  return httpClient.get(`user/timeline/following`, { searchParams }).json();
};

export const getUserByUserNameRequest = async (
  userName: string
): Promise<{
  user: User;
}> => await httpClient.get(`users/${userName}`).json();
//
//
//
//

export const seeNotificationsRequest = async () =>
  await httpClient.get("user/see-notifications").json();

//
//
//
//

export const updateUserProfileRequest = async (formData: FormData) =>
  (await httpClient.put("user/profile", { body: formData }).json()) as any;
//
//
//

export const changeEmailRequest = async (data: {
  newEmail: string;
  password: string;
}) =>
  (await httpClient.put("user/email", { json: data }).json()) as {
    [emailVerificationTokenFieldName]: string;
  };

//
//
//

export const requestNewOtpForEmailChangeRequest = async (data: {
  [emailVerificationTokenFieldName]: string;
}) =>
  (await httpClient.put("user/email", { json: data }).json()) as {
    [emailVerificationTokenFieldName]: string;
  };

//
//
//

export const verificationForEmailChangeRequest = async (data: {
  [emailVerificationTokenFieldName]: string;
  otp: string;
}) => await httpClient.post("user/email/verification", { json: data }).json();
//
//
//
//
//
//

export const changeUsernameRequest = async (data: {
  newUsername: string;
  password: string;
}): Promise<{
  user: {
    userName: string;
  };
}> => (await httpClient.put("user/username", { json: data }).json()) as any;

//
//
//
//
//
//

export const changePasswordRequest = async (data: {
  currentPassword: string;
  newPassword: string;
}) => (await httpClient.put("user/password", { json: data }).json()) as any;
