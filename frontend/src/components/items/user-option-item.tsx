import { User } from "@/types/user";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import { baseFileUrl } from "@/configs";
import { getNameInitials } from "@/utils/user-utils";
import { Skeleton } from "../core/skeleton";

//
//
//
//

interface UserOptionItemProps {
  user: User;
  onSelect: (user: User) => void;
  disabled?: boolean;
}

export const UserOptionItem = ({
  user,
  onSelect,
  disabled,
}: UserOptionItemProps) => {
  return (
    <div
      onClick={() => (disabled ? undefined : onSelect(user))}
      className={`flex items-center gap-x-3 px-3 py-2  rounded-md
        ${
          disabled
            ? "opacity-40"
            : "hover:bg-gray-100 transition-colors cursor-pointer"
        }
        `}
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
        <div className="block text-gray-600">
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
//

export const UserOptionItemLoader = () => {
  return (
    <div className="flex items-center gap-x-3 px-3 py-2">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 pt-0.5">
        <Skeleton className="w-1/3 min-w-[60px] h-2.5 mb-2" />
        <Skeleton className="w-1/4 min-w-[30px] h-2.5" />
      </div>
    </div>
  );
};
