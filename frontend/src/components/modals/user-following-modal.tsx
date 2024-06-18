"use client";
import { followingQueryKey, usersQueryKey } from "@/constants/query-keys";
import { getUserFollowingRequest } from "@/services/user-service";
import { User } from "@/types/user";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import UserRowItem, {
  UserRowItemAvatar,
  UserRowItemLoader,
  UserRowItemNameAndUserName,
} from "../items/user-row-item";

const firstPageRequestedAtAtom = atom(new Date());

const UserFollowingModal = NiceModal.create(({ user }: { user: User }) => {
  const modal = useModal();

  const pathname = usePathname();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  useEffect(() => {
    modal.hide();
  }, [pathname]);

  const handleOpenChange = (open: boolean) =>
    open ? modal.show() : modal.hide();

  const {
    data,
    isLoading,
    isSuccess,
    isFetching,
    refetch,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [usersQueryKey, user.id, followingQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getUserFollowingRequest(user.id, {
        page: query.pageParam,
        limit: 20,
        firstPageRequestedAt,
      }),

    getNextPageParam: (lastPage, _) => lastPage.nextPage ?? undefined,
    refetchOnMount: true,
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
          <DialogTitle>Following</DialogTitle>
        </DialogHeader>

        <div className="flex-1 px-2 py-4 overflow-y-auto">
          {isLoading ? (
            <>
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
            </>
          ) : isSuccess ? (
            data?.pages.map((page) =>
              page.follows.map((follow) => (
                <UserRowItem key={follow.id} user={follow.followed}>
                  <UserRowItemAvatar hasHoverCard={false} />
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

export default UserFollowingModal;
