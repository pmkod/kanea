"use client";
import { Button } from "@/components/core/button";
import { Separator } from "@/components/core/separator";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import { useToast } from "@/components/core/use-toast";
import SessionItem, {
  SessionItemLoader,
} from "@/components/items/session-item";
import { sessionsQueryKey } from "@/constants/query-keys";
import {
  getActiveSessionsRequest,
  logoutOfOthersSessionRequest,
} from "@/services/session-service";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const firstPageRequestedAtAtom = atom(new Date());

const Sessions = () => {
  //
  //
  //
  //
  //

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  const { toast } = useToast();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const queryClient = useQueryClient();
  //
  //
  //
  //
  //

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  //
  //
  //
  //
  //

  const {
    data,
    isLoading,
    isSuccess,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [sessionsQueryKey],
    initialPageParam: 1,
    queryFn: (query) =>
      getActiveSessionsRequest({
        page: query.pageParam,
        firstPageRequestedAt,
      }),

    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    enabled: firstPageRequestedAt !== undefined,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  //
  //
  //
  //
  //

  const { mutate, isPending } = useMutation({
    mutationFn: logoutOfOthersSessionRequest,
    onSuccess: () => {
      queryClient.setQueryData([sessionsQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: [
            {
              currentSession: qData.pages[0].currentSession,
              otherSessions: [],
            },
          ],
        };
      });
      toast({ colorScheme: "success", description: "Success" });
    },
    onError: () => {
      toast({ colorScheme: "destructive", description: "Success" });
    },
  });

  //
  //
  //
  //
  //

  const logoutOfOthersSession = () => {
    mutate();
  };

  //
  //
  //
  //
  //

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
          <TopBarTitle>Sessions</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="pt-4 flex-1 overflow-y-scroll pb-10">
        <div className="px-6">
          <div className="text-lg text-gray-700 font-bold">
            Current active session
          </div>

          <div className="text-gray-400 text-sm mt-1 mb-1">
            Your current session
          </div>
        </div>
        <div className="mt-4 mb-4 px-2">
          {isLoading ? (
            <SessionItemLoader />
          ) : isSuccess ? (
            <SessionItem
              session={data.pages[0].currentSession}
              isCurrentSession={true}
            />
          ) : null}
        </div>
        <div className="px-6">
          <Separator />
        </div>
        <div className="px-6 mt-6 flex justify-between items-start gap-y-2 flex-wrap">
          <div className="">
            <div className="text-lg text-gray-700 font-bold">
              Others active sessions
            </div>
            <div className="text-gray-400 text-sm mt-1 mb-1">
              Your others sessions
            </div>
          </div>
          {isSuccess &&
            data.pages.length > 0 &&
            data.pages[0].otherSessions.length > 0 && (
              <Button
                variant="outline"
                onClick={logoutOfOthersSession}
                className="px-2.5 mt-2"
                isLoading={isPending}
                size="sm"
              >
                Log out of all others sessions
              </Button>
            )}
        </div>

        <div className="mt-4 px-2">
          {isLoading ? (
            <>
              <SessionItemLoader />
              <SessionItemLoader />
              <SessionItemLoader />
              <SessionItemLoader />
              <SessionItemLoader />
            </>
          ) : (isSuccess && data.pages.length === 0) ||
            (isSuccess &&
              data.pages.length === 1 &&
              data.pages[0].otherSessions.length === 0) ? (
            <div className="h-56 flex justify-center items-center">
              <div className="text-sm text-gray-500">
                No other active sessions
              </div>
            </div>
          ) : isSuccess ? (
            data?.pages.map((page) =>
              page.otherSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isCurrentSession={false}
                />
              ))
            )
          ) : null}
          {isFetchingNextPage && (
            <>
              <SessionItemLoader />
              <SessionItemLoader />
              <SessionItemLoader />
              <SessionItemLoader />
            </>
          )}
        </div>

        {hasNextPage && <div className="h-16" ref={ref}></div>}
      </div>
    </>
  );
};

export default Sessions;
