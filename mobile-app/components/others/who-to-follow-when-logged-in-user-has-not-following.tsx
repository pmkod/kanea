import { Button } from "@/components/core/button";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemFollowButton,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import {
  followingTimelineQueryKey,
  whoToFollowQueryKey,
} from "@/constants/query-keys";
import { getUsersSuggestionsToFollowRequest } from "@/services/user-service";
import { User } from "@/types/user";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";
import MyText from "../core/my-text";
import Space from "../core/space";
import { useNavigation } from "@react-navigation/native";
import { exploreScreenName } from "@/constants/screens-names-constants";
import { useTheme } from "@/hooks/use-theme";
import { useFollowingTimeline } from "@/hooks/use-following-timeline";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { Feather } from "@expo/vector-icons";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const WhoToFollowWhenLoggedInUserHasNotFollowing = () => {
  const [followedUsersCount, setFollowedUsersCount] = useState(0);

  const queryClient = useQueryClient();

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const navigation = useNavigation();

  const { theme } = useTheme();

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const { data, isSuccess, isLoading, refetch } = useQuery({
    queryKey: [whoToFollowQueryKey],
    queryFn: () =>
      getUsersSuggestionsToFollowRequest({
        firstPageRequestedAt: firstPageRequestedAt!,
        limit: 7,
      }),
    enabled: firstPageRequestedAt !== undefined,
  });

  useRefreshOnScreenFocus(refetch);

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

  const { isFetching } = useFollowingTimeline({
    firstPageRequestedAt: new Date(),
    enabled: false,
  });

  const refetchFollowingTimeline = () => {
    queryClient.refetchQueries({
      queryKey: [followingTimelineQueryKey],
    });
    // queryClient.refetchQueries({
    //   queryKey: [whoToFollowQueryKey],
    // });
  };

  const goToExplorePage = () => {
    navigation.navigate(exploreScreenName);
  };

  return (
    <View>
      <View>
        <MyText
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            fontSize: 24,
            fontFamily: "NunitoSans_600SemiBold",
          }}
        >
          {isSuccess &&
            data.users.length > 0 &&
            "Follow at least three to continue"}
        </MyText>
        <Space height={20} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={{
            height: Dimensions.get("screen").height * 0.5,
          }}
        >
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
            <View style={{ alignItems: "center" }}>
              <MyText
                style={{
                  textAlign: "center",
                  fontSize: 14,
                  color: theme.gray600,
                  marginBottom: 20,
                }}
              >
                No post to show and no user suggestions to show, visit our
                explore page
              </MyText>
              <Space height={120} />
              <Button
                size="lg"
                text="Explore"
                onPress={goToExplorePage}
                leftDecorator={<Feather name="search" size={20} />}
              />
            </View>
          ) : isSuccess ? (
            data.users.map((user) => (
              <UserRowItem key={user.id} user={user}>
                <UserRowItemAvatar />
                <UserRowItemDisplayNameAndUserName />
                <UserRowItemFollowButton
                  onFollowSuccess={handleFollowSuccess}
                  onUnfollowSuccess={handleUnfollowSuccess}
                />
              </UserRowItem>
            ))
          ) : null}
          <Space height={20} />
        </ScrollView>
      </View>
      {isSuccess && data.users.length > 0 && (
        <View style={{ paddingHorizontal: 20 }}>
          <Button
            size="lg"
            fullWidth
            onPress={refetchFollowingTimeline}
            disabled={followedUsersCount < 3}
            text="Start"
            isLoading={isFetching}
          />
        </View>
      )}
    </View>
  );
};

export default WhoToFollowWhenLoggedInUserHasNotFollowing;
