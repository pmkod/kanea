"use client";
import { Skeleton } from "@/components/core/skeleton";
import { Switch } from "@/components/core/switch";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import { useToast } from "@/components/core/use-toast";
import { loggedInUserQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { User } from "@/types/user";
import { useNetwork } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { webSocketAtom } from "../../_web-socket-atom";

const OnlineStatus = () => {
  const { data, isPending, isSuccess } = useLoggedInUser({ enabled: false });
  const queryClient = useQueryClient();
  const webSocket = useAtomValue(webSocketAtom);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const network = useNetwork();

  //
  //
  const updateOnlineStatusVisibility = () => {
    if (!network.online) {
      return;
    }
    setIsLoading(true);
    webSocket?.emit("define-if-other-user-can-see-my-online-status");
  };

  const defineIfOtherUserCanSeeMyOnlineStatusSuccess = (eventData: {
    user: User;
  }) => {
    setIsLoading(false);
    queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => ({
      ...qData,
      user: {
        ...qData.user,
        allowOtherUsersToSeeMyOnlineStatus:
          eventData.user.allowOtherUsersToSeeMyOnlineStatus,
      },
    }));
  };

  const defineIfOtherUserCanSeeMyOnlineStatusError = ({
    message,
  }: {
    message: string;
  }) => {
    setIsLoading(false);
    toast({ colorScheme: "destructive", description: message });
  };

  useEffect(() => {
    webSocket?.on(
      "define-if-other-user-can-see-my-online-status-success",
      defineIfOtherUserCanSeeMyOnlineStatusSuccess
    );
    webSocket?.on(
      "define-if-other-user-can-see-my-online-status-error",
      defineIfOtherUserCanSeeMyOnlineStatusError
    );
    return () => {
      webSocket?.off(
        "define-if-other-user-can-see-my-online-status-success",
        defineIfOtherUserCanSeeMyOnlineStatusSuccess
      );
      webSocket?.off(
        "define-if-other-user-can-see-my-online-status-error",
        defineIfOtherUserCanSeeMyOnlineStatusError
      );
    };
  }, [webSocket]);

  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Online status</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>
      <div className="px-6 pt-5">
        <div className="flex justify-between">
          <div>Show online status</div>
          {isPending ? (
            <Skeleton className="rounded-full w-9 h-5" />
          ) : isSuccess ? (
            <Switch
              disabled={isLoading}
              onClick={updateOnlineStatusVisibility}
              checked={data?.user.allowOtherUsersToSeeMyOnlineStatus}
            />
          ) : null}
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Allow users you are chatting with to see if you are online. <br />
          {/* When this is turned off, you won't be able to see the activity status of other accounts. */}
        </div>
      </div>
    </>
  );
};

export default OnlineStatus;
