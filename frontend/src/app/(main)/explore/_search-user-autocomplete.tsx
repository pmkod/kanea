"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import { Button } from "@/components/core/button";
import { IconButton } from "@/components/core/icon-button";
import { Input } from "@/components/core/input";
import { UserRowItemLoader } from "@/components/items/user-row-item";
import { baseFileUrl } from "@/configs";
import { searchsQueryKey, usersQueryKey } from "@/constants/query-keys";
import {
  deleteSearchRequest,
  deleteSearchsRequest,
  getSearchsRequest,
  saveSearchRequest,
} from "@/services/search-service";
import { getUsersRequest } from "@/services/user-service";
import { Search } from "@/types/search";
import { User } from "@/types/user";
import { getNameInitials } from "@/utils/user-utils";
import { useClickOutside, useDebouncedValue } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { ChangeEventHandler, MouseEventHandler, useState } from "react";
import { MdCancel } from "react-icons/md";
import { PiMagnifyingGlass, PiX } from "react-icons/pi";

const SearchUserAutocomplete = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const {
    isSuccess: isSearchsSuccess,
    data: searchsData,
    isLoading: isSearchsLoading,
  } = useQuery({
    queryKey: [searchsQueryKey],
    queryFn: getSearchsRequest,
    enabled: isDropdownVisible,
  });

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);

  const clearQ = () => {
    setQ("");
  };

  const openDropdown = () => {
    setIsDropdownVisible(true);
  };

  const closeDropdown = () => {
    clearQ();
    setIsDropdownVisible(false);
  };

  const searchAutocompleteRef = useClickOutside(() => closeDropdown());

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    openDropdown();
  };

  const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQ(e.target.value || "");
  };

  const { data, isSuccess, isLoading } = useQuery({
    queryKey: [usersQueryKey, `q=${debouncedQ}`],
    queryFn: () => getUsersRequest({ q: debouncedQ }),
    enabled: debouncedQ.length > 0,
  });

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

  const { mutate: deleteSearchs } = useMutation({
    mutationFn: deleteSearchsRequest,
    onMutate: () => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: [],
      }));
    },
  });

  const visitUserProfile = async (user: User) => {
    router.push(`/users/${user.userName}`);
    saveSearch({ searchedUserId: user.id });
    setIsDropdownVisible(false);
  };

  return (
    <div
      ref={searchAutocompleteRef}
      className="relative px-5 md:px-0 pt-4 pb-3 md:pt-3 w-full md:w-[480px]"
    >
      <div className="flex items-center gap-x-2">
        <div className="relative flex-1">
          <Input
            className="pl-5"
            size="lg"
            placeholder="Search"
            onFocus={handleFocus}
            // onBlur={handleBlur}
            value={q}
            onChange={handleSearchInputChange}
          />
          {q.length > 0 && (
            <button
              type="button"
              onClick={clearQ}
              className="absolute right-0 text-lg text-gray-600 px-2 py-1 top-1/2 transform -translate-y-1/2"
            >
              <MdCancel />
            </button>
          )}
        </div>
        {isDropdownVisible && (
          <div className="md:hidden">
            <Button onClick={closeDropdown} variant="ghost" size="sm">
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div
        className={`absolute z-50 top-full left-0 w-full bg-white border-b border-x border-gray-200 p-2 rounded-b shadow-sm ${
          isDropdownVisible ? "visible" : "invisible"
        }`}
      >
        {isDropdownVisible && debouncedQ === "" && (
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
              <div className="h-20 flex flex-col justify-center items-center px-5">
                <div className="mb-1 text-3xl">
                  <PiMagnifyingGlass />
                </div>
                <div className="mb-4 text-lg text-gray-700 w-60 max-w-full text-center">
                  Try searching for users
                </div>
              </div>
            ) : isSearchsSuccess ? (
              <div>
                <div className="flex items-center justify-between pl-3 pr-1 pb-2">
                  <div className="text-lg font-semibold">Recents</div>
                  <button
                    onClick={() => deleteSearchs()}
                    className="px-2 py-1 text-sm font-semibold rounded hover:bg-gray-100 text-blue-500 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
                <div className="max-h-[65vh] overflow-auto">
                  {searchsData.searchs.map((search) => (
                    <RecentSearchSuggestionItem
                      key={search.id}
                      search={search}
                      visitUserProfile={visitUserProfile}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
        {isLoading && (
          <>
            <UserRowItemLoader />
            <UserRowItemLoader />
            <UserRowItemLoader />
            <UserRowItemLoader />
            <UserRowItemLoader />
          </>
        )}
        {isSuccess &&
          data.users.map((user) => (
            <SearchSuggestionItem
              key={user.id}
              user={user}
              visitUserProfile={visitUserProfile}
            />
          ))}

        {isSuccess && data.users.length === 0 && (
          <div className="h-44 flex flex-col justify-center items-center px-5 text-gray-500">
            <div className="mb-4 text-3xl">
              <PiMagnifyingGlass />
            </div>
            <div className="text-lg w-60 max-w-full text-center">
              No user found for this search
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUserAutocomplete;

//
//
//
//
//

const SearchSuggestionItem = ({
  user,
  visitUserProfile,
}: {
  user: User;
  visitUserProfile: (user: User) => void;
}) => {
  return (
    <div
      key={user.id}
      className="flex items-center gap-x-3 px-3 py-2.5 hover:bg-gray-100 transition-colors rounded cursor-pointer"
      onClick={() => visitUserProfile(user)}
    >
      <Avatar>
        <AvatarImage
          src={
            user.profilePicture
              ? baseFileUrl + user.profilePicture.lowQualityFileName
              : ""
          }
          alt={`@${user.userName}`}
        />
        <AvatarFallback>{getNameInitials(user?.displayName!)}</AvatarFallback>
      </Avatar>
      <div className="text-sm flex-1 leading-none">
        <div className="block font-semibold mb-1">{user?.displayName}</div>
        <div className="block text-graye-600">
          <span className="text-xs">@</span>
          <span>{user?.userName}</span>
        </div>
      </div>
    </div>
  );
};

//
//
//
//
//

const RecentSearchSuggestionItem = ({
  search,
  visitUserProfile,
}: {
  search: Search;
  visitUserProfile: (user: User) => void;
}) => {
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (search: Search) => deleteSearchRequest(search.id),
    onMutate: (search) => {
      queryClient.setQueryData([searchsQueryKey], (qData: any) => ({
        ...qData,
        searchs: qData.searchs.filter((s: Search) => s.id !== search.id),
      }));
    },
  });

  const deleteSearch: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    mutate(search);
  };
  return (
    <div
      key={search.searchedUser.id}
      className="relative flex items-center gap-x-3 px-3 py-2.5 hover:bg-gray-100 transition-colors rounded cursor-pointer"
      onClick={() => visitUserProfile(search.searchedUser)}
    >
      <Avatar>
        <AvatarImage
          src={
            search.searchedUser.profilePicture
              ? baseFileUrl +
                search.searchedUser.profilePicture.lowQualityFileName
              : ""
          }
          alt="@shadcn"
        />
        <AvatarFallback>
          {getNameInitials(search.searchedUser?.displayName!)}
        </AvatarFallback>
      </Avatar>
      <div className="text-sm flex-1 leading-none">
        <div className="block font-semibold mb-1">
          {search.searchedUser?.displayName}
        </div>
        <div className="block text-gray-600">
          <span className="text-xs">@</span>
          <span>{search.searchedUser?.userName}</span>
        </div>
      </div>

      <IconButton
        variant="ghost"
        onClick={deleteSearch}
        className="hover:bg-gray-200"
      >
        <PiX />
      </IconButton>
    </div>
  );
};
