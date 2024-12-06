import { Follow } from "@/types/follow";
import { Post } from "@/types/post";
import { User } from "@/types/user";
import { httpClient } from "./http-client";
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
}> => await httpClient.get("user").json();

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
  }: { page: number; limit: number; firstPageRequestedAt: Date }
): Promise<{
  follows: Follow[];
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient.get(`users/${userId}/followers`, { searchParams }).json();
};
export const getUserFollowingRequest = async (
  userId: string,
  {
    page,
    limit,
    firstPageRequestedAt,
  }: { page: number; limit: number; firstPageRequestedAt: Date }
): Promise<{
  follows: Follow[];
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
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
  firstPageRequestedAt: Date;
}): Promise<{
  posts: Post[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "5");
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
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

export const updateUserProfileRequest = async (
  formData: FormData
): Promise<{
  user: User;
}> => await httpClient.put("user/profile", { body: formData }).json();
//
//
//

export const changeEmailRequest = async (data: {
  newEmail: string;
  password: string;
}) => {
  const resBody = (await httpClient
    .put("user/email", { json: data })
    .json()) as {
    [emailVerificationTokenFieldName]: string;
  };
  localStorage.setItem(
    emailVerificationTokenFieldName,
    resBody[emailVerificationTokenFieldName]
  );
};

export const requestNewOtpForEmailChangeRequest = async () => {
  const resBody = (await httpClient
    .put("user/email", {
      json: {
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json()) as {
    [emailVerificationTokenFieldName]: string;
  };

  localStorage.setItem(
    emailVerificationTokenFieldName,
    resBody[emailVerificationTokenFieldName]
  );
};

export const verificationForEmailChangeRequest = async (otp: string) => {
  await httpClient
    .post("user/email/verification", {
      json: {
        otp,
        [emailVerificationTokenFieldName]:
          localStorage.getItem(emailVerificationTokenFieldName) || "",
      },
    })
    .json();
  localStorage.removeItem(emailVerificationTokenFieldName);
};
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
//

export const changePasswordRequest = async (data: {
  currentPassword: string;
  newPassword: string;
}) => (await httpClient.put("user/password", { json: data }).json()) as any;
