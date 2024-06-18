"use client";
import {
  PostBoxItem,
  PostBoxItemLoader,
} from "@/components/items/post-box-item";
import { likedPostsQueryKey, usersQueryKey } from "@/constants/query-keys";
import { getUserLikedPostsRequest } from "@/services/post-service";
import { getUserByUserNameRequest } from "@/services/user-service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { PiHeartLight } from "react-icons/pi";
import { useInView } from "react-intersection-observer";
import ImagesGaleryWrapper from "../_image-galery-wrapper";

const firstPageRequestedAtAtom = atom(new Date());

const UserLikes = () => {
  const params = useParams();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const { data: userData, isSuccess: isUserDataSuccess } = useQuery({
    queryKey: [usersQueryKey, params.userName],
    queryFn: () => getUserByUserNameRequest(params.userName.toString()),
    enabled: false,
  });

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const {
    data,
    isPending,
    isSuccess,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    error,
    isError,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [usersQueryKey, userData?.user.id!, likedPostsQueryKey],
    queryFn: (query) =>
      getUserLikedPostsRequest(userData?.user.id!, {
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    enabled: isUserDataSuccess,
    getNextPageParam: (lastPage, _) => lastPage.nextPage,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);
  return (
    <>
      {isPending ? (
        <ImagesGaleryWrapper>
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
        </ImagesGaleryWrapper>
      ) : isSuccess &&
        data.pages.length === 1 &&
        data.pages[0].postLikes.length === 0 ? (
        <div className="flex flex-col justify-center items-center pt-14">
          <div className="text-6xl mb-0.5 text-gray-400">
            <PiHeartLight />
          </div>
          <div className="text-lg text-gray-500">No likes</div>
        </div>
      ) : isSuccess ? (
        <ImagesGaleryWrapper>
          {data?.pages.map((page) =>
            page.postLikes.map((postLike) => (
              <PostBoxItem
                key={postLike.id}
                post={postLike.post}
                showTopRightIndicator={true}
                showStat={true}
              />
            ))
          )}
        </ImagesGaleryWrapper>
      ) : isError ? (
        <div className="flex flex-col justify-center items-center pt-14">
          <div className="text-lg text-gray-500">
            {(error as any)?.errors[0]?.message || "Error"}
          </div>
        </div>
      ) : null}

      {isFetchingNextPage && (
        <ImagesGaleryWrapper>
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
          <PostBoxItemLoader />
        </ImagesGaleryWrapper>
      )}
      {hasNextPage && <div className="h-4" ref={ref}></div>}
    </>
  );
};

export default UserLikes;
