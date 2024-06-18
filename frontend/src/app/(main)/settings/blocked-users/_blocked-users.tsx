"use client";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import { useToast } from "@/components/core/use-toast";
import UserRowItem, {
  UserRowItemAvatar,
  UserRowItemLoader,
  UserRowItemNameAndUserName,
} from "@/components/items/user-row-item";
import { blocksQueryKey } from "@/constants/query-keys";
import { recentlyBlocked } from "@/constants/sort-option-constants";
import { getBlocksRequest } from "@/services/block-service";
import { User } from "@/types/user";
import { useNetwork } from "@mantine/hooks";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { webSocketAtom } from "../../_web-socket-atom";
import { BlockedButton } from "../../users/[userName]/(profile)/_blocked-button";

const firstPageRequestedAtAtom = atom<Date>(new Date());

const BlockedUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  const webSocket = useAtomValue(webSocketAtom);
  const network = useNetwork();

  const [idOfTheUserBeingUnlocked, setIdOfTheUserBeingUnlocked] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const {
    data,
    isLoading,
    isSuccess,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [blocksQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getBlocksRequest({
        page: query.pageParam,
        firstPageRequestedAt,
        sort: recentlyBlocked,
      }),
    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
  });

  const unblockUser = (user: User) => {
    if (!network.online) {
      return;
    }
    webSocket?.emit("unblock-user", {
      userToUnblockId: user.id,
    });
    setIdOfTheUserBeingUnlocked(user.id);
  };

  const unblockUserSuccessEvent = (eventData: { unblockedUser: User }) => {
    toast({
      colorScheme: "success",
      description: `Unblocked`,
    });
    queryClient.setQueryData([blocksQueryKey], (qData: any) => {
      return {
        ...qData,
        pages: qData.pages.map((pageData: any) => ({
          ...pageData,
          blocks: pageData.blocks.filter(
            ({ blockedId }: { blockedId: string }) =>
              blockedId !== eventData.unblockedUser.id
          ),
        })),
      };
    });
    setIdOfTheUserBeingUnlocked(undefined);
  };

  const unblockUserErrorEvent = () => {
    setIdOfTheUserBeingUnlocked(undefined);
  };

  useEffect(() => {
    webSocket?.on("unblock-user-success", unblockUserSuccessEvent);
    webSocket?.on("unblock-user-error", unblockUserErrorEvent);
    webSocket?.on("has-unblocked-an-user", unblockUserSuccessEvent);

    return () => {
      webSocket?.off("unblock-user-success", unblockUserSuccessEvent);
      webSocket?.off("unblock-user-error", unblockUserErrorEvent);
      webSocket?.off("has-unblocked-an-user", unblockUserSuccessEvent);
    };
  }, [webSocket]);

  useEffect(() => {
    if (inView && !isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Blocked users</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="px-2.5 pt-4 overflow-y-scroll flex-1 pb-10">
        <div className="mx-auto max-w-md">
          {isLoading ? (
            <>
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
            </>
          ) : (isSuccess && data.pages.length === 0) ||
            (isSuccess &&
              data.pages.length === 1 &&
              data.pages[0].blocks.length === 0) ? (
            <div className="h-56 flex justify-center items-center">
              <div className="text-sm text-gray-500">No user blocked</div>
            </div>
          ) : isSuccess ? (
            data?.pages.map((page) =>
              page.blocks.map(({ id, blocked }) => (
                <UserRowItem key={id} user={blocked}>
                  <UserRowItemAvatar />
                  <UserRowItemNameAndUserName />
                  <BlockedButton
                    isLoading={id === idOfTheUserBeingUnlocked}
                    unblockUser={() => unblockUser(blocked)}
                  />
                </UserRowItem>
              ))
            )
          ) : null}
          {isFetchingNextPage && (
            <>
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
            </>
          )}
          {hasNextPage && !isFetchingNextPage && (
            <div className="h-16" ref={ref}></div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlockedUsers;
