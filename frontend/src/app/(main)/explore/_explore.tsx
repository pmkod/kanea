"use client";
import {
  PostBoxItem,
  PostBoxItemLoader,
} from "@/components/items/post-box-item";
import BottomNav from "@/components/partials/bottom-nav";
import { exploreQueryKey } from "@/constants/query-keys";
import { exploreRequest } from "@/services/post-service";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import ExploreImagesGaleryWrapper from "./_explore-image-galery-wrapper";
import SearchUserAutocomplete from "./_search-user-autocomplete";
import { PublishPostButton } from "../_publish-post-button";

const firstPageRequestedAtAtom = atom<Date>(new Date());
const Explore = () => {
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const {
    data,
    isSuccess,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [exploreQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      exploreRequest({
        page: query.pageParam,
        firstPageRequestedAt: firstPageRequestedAt!,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

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
      <div>
        <SearchUserAutocomplete />

        <div className="pb-40">
          <ExploreImagesGaleryWrapper>
            {isLoading && (
              <>
                {new Array(9).fill(1).map((_, index) => (
                  <PostBoxItemLoader key={index} />
                ))}
              </>
            )}
            {isSuccess &&
              data?.pages.map((page) =>
                page.posts.map((post) => (
                  <PostBoxItem
                    key={post.id}
                    post={post}
                    showTopRightIndicator={true}
                    showStat={true}
                  />
                ))
              )}
            {isFetchingNextPage && (
              <>
                {new Array(8).fill(1).map((_, index) => (
                  <PostBoxItemLoader key={index} />
                ))}
              </>
            )}
          </ExploreImagesGaleryWrapper>
          {hasNextPage && <div className="h-4" ref={ref}></div>}
        </div>
      </div>

      <BottomNav />
    </>
  );
};

export default Explore;
