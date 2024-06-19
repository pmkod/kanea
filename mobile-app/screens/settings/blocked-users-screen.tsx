import MyText from "@/components/core/my-text";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import { BlockUserConfirmModal } from "@/components/modals/block-user-confirm-modal";
import { BlockedUserButton } from "@/components/others/blocked-user-button";
import { blockedUsersSettingsScreenName } from "@/constants/screens-names-constants";
import { useBlocks } from "@/hooks/use-blocks";
import { useRefreshOnScreenFocus } from "@/hooks/use-refresh-on-screen-focus";
import { useTheme } from "@/hooks/use-theme";
import { User } from "@/types/user";
import NiceModal from "@ebay/nice-modal-react";
import { useDidUpdate } from "@mantine/hooks";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { atom, useAtom } from "jotai";
import React, { useEffect } from "react";
import { FlatList, View } from "react-native";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const BlockedUsersSettingsScreen = () => {
  const { theme } = useTheme();
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  useEffect(() => {
    if (firstPageRequestedAt === undefined) {
      setFirstPageRequestedAt(new Date());
    }
    return () => {
      setFirstPageRequestedAt(undefined);
    };
  }, []);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     setFirstPageRequestedAt(new Date());
  //     return () => setFirstPageRequestedAt(undefined);
  //   }, [])
  // );

  const {
    data,
    isLoading,
    isSuccess,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    isError,
    isRefetching,
    isFetching,
  } = useBlocks({
    firstPageRequestedAt,
    enabled: firstPageRequestedAt !== undefined,
  });
  // useRefreshOnScreenFocus(refetch);

  const openUnblockUserConfirmModal = (user: User) => {
    NiceModal.show(BlockUserConfirmModal, {
      user,
    });
  };

  const loadMoreBlockedUsers = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  const blockedUsers = isSuccess
    ? data.pages.map((page) => page.blocks).flat()
    : [];

  useDidUpdate(() => {
    if (firstPageRequestedAt && !isFetching) {
      refetch();
    }
  }, [firstPageRequestedAt]);

  const handleRefresh = () => {
    setFirstPageRequestedAt(new Date());
  };

  return (
    <View style={{ flex: 1, paddingTop: 16 }}>
      {isLoading ? (
        <>
          <UserRowItemLoader />
          <UserRowItemLoader />
          <UserRowItemLoader />
          <UserRowItemLoader />
        </>
      ) : isSuccess ? (
        <FlatList
          refreshing={isRefetching && !isFetching}
          onRefresh={handleRefresh}
          data={blockedUsers}
          initialNumToRender={18}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <UserRowItem user={item.blocked}>
              <UserRowItemAvatar />
              <UserRowItemDisplayNameAndUserName />
              <BlockedUserButton
                unblockUser={() => openUnblockUserConfirmModal(item.blocked)}
              />
            </UserRowItem>
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <MyText style={{ fontSize: 16, color: theme.gray500 }}>
                No user blocked
              </MyText>
            </View>
          }
          keyExtractor={(item, index) => index.toString()}
          onEndReached={loadMoreBlockedUsers}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <>
                <UserRowItemLoader />
                <UserRowItemLoader />
                <UserRowItemLoader />
                <UserRowItemLoader />
              </>
            ) : null
          }
        />
      ) : null}
    </View>
  );
};

export const blockedUsersSettingsScreen = {
  name: blockedUsersSettingsScreenName,
  component: BlockedUsersSettingsScreen,
  options: {
    title: "Blocked users",
    animation: "ios",
  } as NativeStackNavigationOptions,
};
