"use client";
import Logo from "@/components/core/logo";
import { Skeleton } from "@/components/core/skeleton";
import PostItem, { PostItemLoader } from "@/components/items/post-item";
import { UserRowItemLoader } from "@/components/items/user-row-item";
import BottomNav from "@/components/partials/bottom-nav";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { getLoggedInuserFollowingTimelineRequest } from "@/services/user-service";
import { useMediaQuery } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import WhoToFollow from "../_who-to-follow";
import WhoToFollowWhenLoggedInUserHasNotFollowing from "./_who-to-follow-when-logged-in-user-has-not-following";
import { UtilLinks } from "../_util-links";
import { PublishPostButton } from "../_publish-post-button";

const firstPageRequestedAtAtom = atom<Date | undefined>(new Date());

const Home = () => {
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const xlMatches = useMediaQuery("(min-width: 1280px)");

  const {
    data,
    isSuccess,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [followingTimelineQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getLoggedInuserFollowingTimelineRequest({
        page: query.pageParam,
        firstPageRequestedAt: firstPageRequestedAt!,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    enabled: firstPageRequestedAt !== undefined,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <div className="flex pb-40">
        <div className="flex-1">
          <div className="px-4 pt-6 md:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-[100vw] sm:w-[540px] pb-16">
            {isSuccess && data.pages[0].posts.length === 0 ? (
              <WhoToFollowWhenLoggedInUserHasNotFollowing />
            ) : (
              <>
                {/* <StoriesSection /> */}
                {/* <PublishPost /> */}
                <div className="pt-8 pb-4 space-y-8">
                  {isPending && (
                    <>
                      <PostItemLoader />
                      <PostItemLoader />
                      <PostItemLoader />
                    </>
                  )}
                  {isSuccess &&
                    data?.pages.map((page) =>
                      page.posts.map((post) => (
                        <PostItem key={post.id} post={post} />
                      ))
                    )}
                </div>
                {isFetchingNextPage && <PostItemLoader />}
                {hasNextPage && (
                  <div className="h-16 bg-rose-200" ref={ref}></div>
                )}
              </>
            )}
          </div>
        </div>
        <div className="hidden xl:block w-[380px] pt-8 pr-8">
          {isPending && (
            <div>
              <div className="pl-3 py-3.5 text-xl font-semibold">
                <Skeleton className="h-3 w-1/2 rounded-full" />
              </div>

              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
            </div>
          )}
          {xlMatches && isSuccess && data.pages[0].posts.length !== 0 && (
            <div className="w-full sticky top-8">
              <WhoToFollow />
              <UtilLinks />
            </div>
          )}
        </div>
        {isSuccess && data.pages[0].posts.length !== 0 && <PublishPostButton />}
      </div>
      <BottomNav />
    </>
  );
};

export default Home;
