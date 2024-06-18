"use client";
import { baseFileUrl } from "@/configs";
import { User } from "@/types/user";
import { getNameInitials } from "@/utils/user-utils";
import { PiX, PiXBold } from "react-icons/pi";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";

interface SelectedUserBubbleItemProps {
  user: User;
  onRemove: () => any;
}

//
//
//
//
//
//

export const SelectedUserBubbleItem = ({
  user,
  onRemove,
}: SelectedUserBubbleItemProps) => {
  return (
    <div className="cursor-pointer hover:opacity-80" onClick={onRemove}>
      <div className="relative w-max">
        <Avatar className="w-12 h-12 rounded-full">
          <AvatarImage
            src={
              user.profilePicture
                ? baseFileUrl + user.profilePicture.lowQualityFileName
                : ""
            }
            alt={`@${user.userName}`}
          />
          <AvatarFallback className="text-lg">
            {getNameInitials(user.displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="absolute -bottom-0.5 -right-0.5 p-[3px] rounded-full bg-white">
          <div className="p-0.5 rounded-full bg-gray-300 text-xs">
            <PiXBold />
          </div>
        </div>
      </div>
      <div className="mt-1 text-xs text-center max-w-16 truncate">
        {user.displayName}
      </div>
    </div>
  );
};
