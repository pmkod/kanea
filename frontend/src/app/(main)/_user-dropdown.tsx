"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/core/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/core/dropdown-menu";
import { Skeleton } from "@/components/core/skeleton";
import { useToast } from "@/components/core/use-toast";
import { baseFileUrl } from "@/configs";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useLogout } from "@/hooks/use-logout";
import { getNameInitials } from "@/utils/user-utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PiSignOutLight, PiUser } from "react-icons/pi";

const UserDropdown = () => {
  const { data, isPending, isSuccess } = useLoggedInUser({ enabled: false });
  const router = useRouter();
  const { toast } = useToast();
  const { logout } = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center h-max lg:border border-gray-300 lg:hover:bg-gray-100 transition-colors lg:rounded">
          <div className="lg:p-2.5">
            <div className="w-12 lg:w-9 aspect-square">
              {isPending ? (
                <Skeleton className="w-full h-full rounded-full" />
              ) : isSuccess ? (
                <Avatar className="w-full h-full">
                  <AvatarImage
                    src={
                      data?.user.profilePicture
                        ? baseFileUrl +
                          data?.user.profilePicture?.lowQualityFileName
                        : ""
                    }
                    alt={`@${data?.user.userName}`}
                  />
                  <AvatarFallback>
                    {getNameInitials(data!.user.displayName)}
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-start">
            {isPending ? (
              <Skeleton className="w-24 h-2 mb-2.5 rounded-md" />
            ) : (
              <div className="text-sm text-left font-semibold w-[136px] truncate">
                {data?.user.displayName}
              </div>
            )}
            {isPending ? (
              <Skeleton className="w-12 h-2 rounded-md" />
            ) : (
              <div className="text-sm text-gray-500 w-[136px] text-left truncate">
                <span className="text-xs">@</span>
                {data?.user.userName}
              </div>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      {isSuccess && (
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/users/${data.user.userName}`}>
              <div className="text-lg mr-3">
                <PiUser />
              </div>
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <div className="text-lg mr-3">
              <PiSignOutLight />
            </div>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};

export default UserDropdown;
