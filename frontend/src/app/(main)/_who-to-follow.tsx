import UserRowItem, {
  UserRowItemAvatar,
  UserRowItemFollowButton,
  UserRowItemLoader,
  UserRowItemNameAndUserName,
} from "@/components/items/user-row-item";
import { whoToFollowQueryKey } from "@/constants/query-keys";
import { getUsersSuggestionsToFollowRequest } from "@/services/user-service";
import { User } from "@/types/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const WhoToFollow = () => {
  const queryClient = useQueryClient();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  //
  //
  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [whoToFollowQueryKey],
    queryFn: () =>
      getUsersSuggestionsToFollowRequest({
        firstPageRequestedAt: firstPageRequestedAt!,
        limit: 5,
      }),
    enabled: firstPageRequestedAt !== undefined,
  });

  //
  //
  //
  //
  //

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
  };

  //
  //
  //
  //
  //

  return (
    <div>
      <div className="mb-3 pl-3 text-xl font-semibold">Who to follow ?</div>
      <div className="">
        {isLoading ? (
          <>
            <UserRowItemLoader />
            <UserRowItemLoader />
            <UserRowItemLoader />
            <UserRowItemLoader />
          </>
        ) : isSuccess && data.users.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-500">
            No suggestions to display
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
  );
};

export default WhoToFollow;
