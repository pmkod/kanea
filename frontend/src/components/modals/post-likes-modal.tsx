"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import { postLikesQueryKey, postsQueryKey } from "@/constants/query-keys";
import { getPostLikesRequest } from "@/services/post-service";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import React, { useEffect } from "react";
import UserRowItem, {
  UserRowItemAvatar,
  UserRowItemLoader,
  UserRowItemNameAndUserName,
} from "../items/user-row-item";
import { useInView } from "react-intersection-observer";
import { Post } from "@/types/post";

const firstPageRequestedAtAtom = atom(new Date());

const PostLikesModal = NiceModal.create(({ post }: { post: Post }) => {
  const modal = useModal();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const handleOpenChange = (open: boolean) =>
    open ? modal.show() : modal.hide();

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    fetchNextPage,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: [postsQueryKey, post.id, postLikesQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getPostLikesRequest(post.id, {
        page: query.pageParam,
        limit: 20,
        firstPageRequestedAt,
      }),
    getNextPageParam: (lastPage, _) => lastPage.nextPage ?? undefined,
  });

  useEffect(() => {
    if (modal.visible) {
      setFirstPageRequestedAt(new Date());
      if (!isFetching) {
        refetch();
      }
    }
  }, [modal.visible]);

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  return (
    <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
      <DialogContent className="flex flex-col h-screen sm:h-[70vh]">
        <DialogHeader>
          <DialogClose />
          <DialogTitle>Post Likes</DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-2 py-4 overflow-y-auto">
          {isLoading ? (
            <>
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
            </>
          ) : isSuccess ? (
            data?.pages.map((page) =>
              page.postLikes.map((postLike) => (
                <UserRowItem key={postLike.id} user={postLike.liker}>
                  <UserRowItemAvatar />
                  <UserRowItemNameAndUserName />
                </UserRowItem>
              ))
            )
          ) : null}
          {isFetchingNextPage && (
            <>
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
            </>
          )}
          {hasNextPage && <div className="h-4" ref={ref}></div>}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default PostLikesModal;
