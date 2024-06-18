"use client";
import { Button } from "@/components/core/button";
import {
  PostBoxItem,
  PostBoxItemLoader,
} from "@/components/items/post-box-item";
import PublishPostModal from "@/components/modals/publish-post-modal";
import { postsQueryKey, usersQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { getUserPostsRequest } from "@/services/post-service";
import { getUserByUserNameRequest } from "@/services/user-service";
import NiceModal from "@ebay/nice-modal-react";
import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { PiCameraLight, PiPlus } from "react-icons/pi";
import { useInView } from "react-intersection-observer";
import ImagesGaleryWrapper from "./_image-galery-wrapper";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { Post } from "@/types/post";

const firstPageRequestedAtAtom = atom(new Date());

const UserPosts = () => {
  const params = useParams();
  const webSocket = useAtomValue(webSocketAtom);
  const queryClient = useQueryClient();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const { data: loggedInUserData } = useLoggedInUser({ enabled: false });

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
    isSuccess,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isPending,
    refetch,
    fetchPreviousPage,
  } = useInfiniteQuery({
    initialPageParam: 1,
    queryKey: [usersQueryKey, params.userName, postsQueryKey],
    queryFn: (query) =>
      getUserPostsRequest(userData?.user.id!, {
        page: query.pageParam,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => lastPage.nextPage,

    enabled: isUserDataSuccess && !userData.user.hasBlockedLoggedInUser,
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const openPublishPostModal = () => {
    NiceModal.show(PublishPostModal);
  };

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  const publishPostSuccessEvent = (eventData: { post: Post }) => {
    setFirstPageRequestedAt(new Date());
    queryClient.setQueryData(
      [usersQueryKey, loggedInUserData?.user.userName],
      (qData: any) => ({
        ...qData,
        user: {
          ...qData.user,
          postsCount: qData.user.postsCount + 1,
        },
      })
    );
    queryClient.setQueryData(
      [usersQueryKey, loggedInUserData?.user.userName, postsQueryKey],
      (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any, pageIndex: number) => ({
            ...pageData,
            posts:
              pageIndex === 0
                ? [eventData.post, ...pageData.posts]
                : [...pageData.posts],
          })),
        };
      }
    );
    // refetch()
    // fetchPreviousPage()
  };

  useEffect(() => {
    webSocket?.on("publish-post-success", publishPostSuccessEvent);

    return () => {
      webSocket?.off("publish-post-success", publishPostSuccessEvent);
    };
  }, [webSocket]);

  return (
    <>
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
          data.pages[0].posts.length === 0 ? (
          <div className="flex flex-col justify-center items-center pt-14">
            <div className="text-6xl mb-0.5 text-gray-400">
              <PiCameraLight />
            </div>
            <div className="text-lg text-gray-500">
              {userData?.user.userName === loggedInUserData?.user.userName
                ? "You have not published a post"
                : "No post from this user"}
            </div>
            {userData?.user.userName === loggedInUserData?.user.userName && (
              <div className="mt-7">
                <Button variant="outline" onClick={openPublishPostModal}>
                  <PiPlus />
                  <span className="ml-2">Publish your first post</span>
                </Button>
              </div>
            )}
          </div>
        ) : isSuccess ? (
          <ImagesGaleryWrapper>
            {data?.pages.map((page) =>
              page.posts.map((post) => (
                <PostBoxItem
                  key={post.id}
                  post={post}
                  showTopRightIndicator={true}
                  showStat={true}
                />
              ))
            )}
          </ImagesGaleryWrapper>
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
    </>
  );
};

export default UserPosts;
