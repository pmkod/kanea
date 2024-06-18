import { Post } from "@/types/post";
import { httpClient } from "./http-client";
import { PostLike } from "@/types/post-like";
import { PostComment } from "@/types/post-comment";

//
//
//
//

export const publishPostRequest = async (
  formData: FormData
): Promise<{
  post: Post;
}> => await httpClient.post("posts", { body: formData }).json();

//
//
//
//
export const getPostDetailsRequest = async (
  postId: string
): Promise<{
  post: Post;
}> => {
  return httpClient.get(`posts/${postId}`).json();
};

//
//
//
//
//
//
//
//

export const getUserPostsRequest = async (
  userId: string,
  { page, firstPageRequestedAt }: { page: number; firstPageRequestedAt: Date }
): Promise<{
  posts: Post[];
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "10");
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient.get(`users/${userId}/posts`, { searchParams }).json();
};

//
//
//
//
//
//
//
//

export const getUserLikedPostsRequest = async (
  userId: string,
  { page, firstPageRequestedAt }: { page: number; firstPageRequestedAt: Date }
): Promise<{
  postLikes: PostLike[];
  nextPage?: number;
  page: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", "10");
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient.get(`users/${userId}/liked-posts`, { searchParams }).json();
};

//
//
//
//
//
//
//
//

export const getPostLikesRequest = async (
  postId: string,
  {
    page,
    limit,
    firstPageRequestedAt,
  }: {
    page: number;
    limit: number;
    firstPageRequestedAt: Date;
  }
): Promise<{
  postLikes: PostLike[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient.get(`posts/${postId}/likes`, { searchParams }).json();
};

//
//
//
//
//
//
//
//

export const getPostCommentsRequest = async (
  postId: string,
  {
    page,
    limit,
    firstPageRequestedAt,
  }: {
    page: number;
    limit: number;
    firstPageRequestedAt: Date;
  }
): Promise<{
  postComments: PostComment[];
  page: number;
  nextPage?: number;
}> => {
  const searchParams = new URLSearchParams();
  searchParams.set("page", page.toString());
  searchParams.set("limit", limit.toString());
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient.get(`posts/${postId}/comments`, { searchParams }).json();
};

//
//
//
//
//
//
//
//

export const deletePostRequest = async (
  postId: string
): Promise<{
  post: Post;
}> => await httpClient.delete(`posts/${postId}`).json();

//
//
//
//
//
//
//
//

export const exploreRequest = async ({
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
  searchParams.set("limit", "10");
  searchParams.set("firstPageRequestedAt", firstPageRequestedAt.toISOString());
  return httpClient.get(`posts/many/explore`, { searchParams }).json();
};
