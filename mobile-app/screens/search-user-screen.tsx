import { IconButton } from "@/components/core/icon-button";
import { searchsQueryKey } from "@/constants/query-keys";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebouncedValue } from "@mantine/hooks";
import { useSearchUser } from "@/hooks/use-search-user";
import {
  UserRowItem,
  UserRowItemAvatar,
  UserRowItemDisplayNameAndUserName,
  UserRowItemLoader,
} from "@/components/items/user-row-item";
import { User } from "@/types/user";
import { useSearchs } from "@/hooks/use-searchs";
import MyText from "@/components/core/my-text";
import {
  deleteSearchRequest,
  deleteSearchsRequest,
  saveSearchRequest,
} from "@/services/search-service";
import { Search } from "@/types/search";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  searchUserScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import { useTheme } from "@/hooks/use-theme";
import { Input } from "@/components/core/input";

const SearchUserScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const goToPreviousScreen = () => {
    navigation.goBack();
  };

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);

  const clearQ = () => {
    setQ("");
  };

  const { data, isSuccess, isLoading } = useSearchUser({ debouncedQ });

  const {
    isSuccess: isSearchsSuccess,
    data: searchsData,
    isLoading: isSearchsLoading,
  } = useSearchs();

  const { mutate: deleteSearchs } = useMutation({
    mutationFn: deleteSearchsRequest,
    onMutate: () => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: [],
      }));
    },
  });

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      {/* <View style={{ flex: 1 }}> */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          paddingRight: 22,
          paddingLeft: 10,
        }}
      >
        <IconButton onPress={goToPreviousScreen} variant="ghost">
          <Feather name="chevron-left" size={28} color={theme.gray600} />
        </IconButton>
        <View style={{ flex: 1, paddingVertical: 14, flexDirection: "row" }}>
          <View
            style={{
              flex: 1,
              position: "relative",
            }}
          >
            <Input autoFocus placeholder="Search" onChange={setQ} value={q} />
            {q.length > 0 && (
              <View
                style={{
                  justifyContent: "center",
                  position: "absolute",
                  right: 6,
                  top: 0,
                  height: "100%",
                }}
              >
                <IconButton onPress={clearQ} variant="ghost">
                  <MaterialIcons
                    name="cancel"
                    size={18}
                    color={theme.gray500}
                  />
                </IconButton>
              </View>
            )}
          </View>
        </View>
      </View>
      <ScrollView
        style={{
          flex: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {debouncedQ === "" && (
          <>
            {isSearchsLoading ? (
              <>
                <UserRowItemLoader />
                <UserRowItemLoader />
                <UserRowItemLoader />
                <UserRowItemLoader />
                <UserRowItemLoader />
              </>
            ) : isSearchsSuccess && searchsData.searchs.length === 0 ? (
              <View
                style={{
                  justifyContent: "center",
                  height: 180,
                  alignItems: "center",
                  paddingHorizontal: 20,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={30}
                  color={theme.gray500}
                  style={{ marginBottom: 8 }}
                />

                <MyText
                  style={{
                    marginBottom: 4,
                    fontSize: 20,
                    color: theme.gray400,
                    textAlign: "center",
                  }}
                >
                  Try searching for users
                </MyText>
              </View>
            ) : isSearchsSuccess ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                  }}
                >
                  <MyText
                    style={{
                      fontFamily: "NunitoSans_600SemiBold",
                      fontSize: 18,
                    }}
                  >
                    Recents
                  </MyText>
                  <Pressable
                    onPress={() => deleteSearchs()}
                    style={{ paddingVertical: 4 }}
                  >
                    <MyText
                      style={{
                        color: "#225cff",
                        fontFamily: "NunitoSans_700Bold",
                      }}
                    >
                      Clear all
                    </MyText>
                  </Pressable>
                </View>

                {searchsData.searchs.map((search) => (
                  <SearchItem key={search.id} search={search} />
                ))}
              </>
            ) : null}
          </>
        )}

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
          <View
            style={{
              paddingTop: 50,
              alignItems: "center",
              paddingHorizontal: 30,
            }}
          >
            <View style={{ marginBottom: 16 }}>
              <Ionicons name="search-outline" size={30} color={theme.gray500} />
            </View>
            <MyText style={{ fontSize: 18, color: theme.gray500 }}>
              No user found for this search
            </MyText>
          </View>
        ) : isSuccess ? (
          data.users.map((user) => (
            <UserSearchResultItem key={user.id} user={user} />
          ))
        ) : null}
      </ScrollView>
      {/* </View> */}
    </View>
  );
};

//
//
//
//
//
//

const UserSearchResultItem = ({ user }: { user: User }) => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { mutate: saveSearch } = useMutation({
    mutationFn: saveSearchRequest,
    onMutate: (variable) => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: qData.searchs.filter(
          (s: Search) => s.searchedUser.id !== variable.searchedUserId
        ),
      }));
    },
    onSuccess: (data) => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: [data.search, ...qData.searchs],
      }));
    },
  });
  const visitProfile = () => {
    saveSearch({ searchedUserId: user.id });
    navigation.navigate(userScreenName, { userName: user.userName });
  };
  return (
    <UserRowItem user={user} onPress={visitProfile}>
      <UserRowItemAvatar />
      <UserRowItemDisplayNameAndUserName />
    </UserRowItem>
  );
};

//
//
//
//
//
//

const SearchItem = ({ search }: { search: Search }) => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { mutate: saveSearch } = useMutation({
    mutationFn: saveSearchRequest,
    onMutate: (variable) => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: qData.searchs.filter(
          (s: Search) => s.searchedUser.id !== variable.searchedUserId
        ),
      }));
    },
    onSuccess: (data) => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: [data.search, ...qData.searchs],
      }));
    },
  });

  const { mutate } = useMutation({
    mutationFn: (search: Search) => deleteSearchRequest(search.id),
    onMutate: (search) => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: qData.searchs.filter((s: Search) => s.id !== search.id),
      }));
    },
  });

  const deleteSearch = () => {
    mutate(search);
  };

  const visitProfile = () => {
    saveSearch({ searchedUserId: search.searchedUser.id });
    navigation.navigate(userScreenName, {
      userName: search.searchedUser.userName,
    });
  };

  return (
    <UserRowItem user={search.searchedUser} onPress={visitProfile}>
      <UserRowItemAvatar />
      <UserRowItemDisplayNameAndUserName />
      <IconButton onPress={deleteSearch} variant="ghost">
        <Feather name="x" size={18} color={theme.gray400} />
      </IconButton>
    </UserRowItem>
  );
};

//
//
//
//
//
//
//
//

export const searchUserScreen = {
  name: searchUserScreenName,
  component: SearchUserScreen,
  options: {
    headerShown: false,
    animation: "none",
  } as NativeStackNavigationOptions,
};
