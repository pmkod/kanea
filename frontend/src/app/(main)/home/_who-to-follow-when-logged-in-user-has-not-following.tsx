import { Button } from "@/components/core/button";
import UserRowItem, {
  UserRowItemAvatar,
  UserRowItemFollowButton,
  UserRowItemLoader,
  UserRowItemNameAndUserName,
} from "@/components/items/user-row-item";
import {
  followingTimelineQueryKey,
  whoToFollowQueryKey,
} from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { getUsersSuggestionsToFollowRequest } from "@/services/user-service";
import { User } from "@/types/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const WhoToFollowWhenLoggedInUserHasNotFollowing = () => {
  const [followedUsersCount, setFollowedUsersCount] = useState(0);

  const queryClient = useQueryClient();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  //
  //
  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [whoToFollowQueryKey],
    queryFn: () =>
      getUsersSuggestionsToFollowRequest({
        firstPageRequestedAt: firstPageRequestedAt!,
        limit: 7,
      }),
    enabled: firstPageRequestedAt !== undefined,
  });

  const handleFollowSuccess = (user: User) => {
    queryClient.setQueryData([whoToFollowQueryKey], (qData: any) => {
      return {
        ...qData,
        users: qData.users.map((u: User) =>
          user.id === u.id
            ? {
                ...u,
                followedByLoggedInUser: true,
              }
            : { ...u }
        ),
      };
    });
    setFollowedUsersCount((prevState) => prevState + 1);
  };

  //
  //
  //
  //
  //
  //

  const handleUnfollowSuccess = (user: User) => {
    queryClient.setQueryData([whoToFollowQueryKey], (qData: any) => {
      return {
        ...qData,
        users: qData.users.map((u: User) =>
          user.id === u.id
            ? {
                ...u,
                followedByLoggedInUser: false,
              }
            : { ...u }
        ),
      };
    });
    setFollowedUsersCount((prevState) => prevState - 1);
  };

  const refetchFollowingTimeline = () => {
    queryClient.refetchQueries({
      queryKey: [followingTimelineQueryKey],
    });
    queryClient.refetchQueries({
      queryKey: [whoToFollowQueryKey],
    });
  };

  return (
    <div className="h-[80vh] flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="flex items-center px-4 sm:px-8 md:px-5 h-[60px] text-xl font-semibold">
          {isSuccess &&
            data.users.length > 0 &&
            "Follow at least three to continue"}
        </div>
        <div className="px-1 sm:px-5 md:px-2 pb-6">
          {isLoading ? (
            <>
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
              <UserRowItemLoader />
            </>
          ) : isSuccess && data.users.length === 0 ? (
            <div className="h-80 flex flex-col justify-center items-center bg-gray-100 rounded px-10 md:px-20">
              <div className="text-lg text-center text-gray-600 mb-6">
                No post to show and no user suggestions to show, visit our
                explore page
              </div>

              <Button asChild size="lg">
                <Link href="/explore">
                  <PiMagnifyingGlass />
                  <span className="ml-2">Explore</span>
                </Link>
              </Button>
            </div>
          ) : isSuccess ? (
            data.users.map((user) => (
              <UserRowItem key={user.id} user={user}>
                <UserRowItemAvatar />
                <UserRowItemNameAndUserName />
                <UserRowItemFollowButton
                  size="sm"
                  onFollowSuccess={handleFollowSuccess}
                  onUnfollowSuccess={handleUnfollowSuccess}
                />
              </UserRowItem>
            ))
          ) : null}
        </div>
      </div>
      {isSuccess && data.users.length > 0 && (
        <div className="px-5">
          <Button
            size="lg"
            fullWidth
            onClick={refetchFollowingTimeline}
            disabled={followedUsersCount < 3}
          >
            Start
          </Button>
        </div>
      )}
    </div>
  );
};

export default WhoToFollowWhenLoggedInUserHasNotFollowing;
