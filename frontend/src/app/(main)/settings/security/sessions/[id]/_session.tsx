"use client";
import React from "react";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import {
  getActiveSessionRequest,
  logoutOfSessionRequest,
} from "@/services/session-service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/core/use-toast";
import { useParams } from "next/navigation";
import { sessionsQueryKey } from "@/constants/query-keys";
import { PiDesktop, PiDeviceMobileSpeaker } from "react-icons/pi";
import { UAParser } from "ua-parser-js";
import dayjs from "dayjs";
import { Button } from "@/components/core/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/core/skeleton";

const _Session = () => {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();

  const { data, isLoading, isSuccess, isError } = useQuery({
    queryKey: [sessionsQueryKey, params.id],
    queryFn: () => getActiveSessionRequest(params.id.toString()),
  });

  const uaParserInstance = new UAParser(data ? data?.session.agent : undefined);
  const uaResult = uaParserInstance.getResult();

  const { mutate, isPending } = useMutation({
    mutationFn: () => logoutOfSessionRequest(data!.session.id),
    onSuccess: () => {
      toast({ colorScheme: "success", description: "Success" });
      router.replace("/settings/security/sessions");
    },
    onError: () => {
      router.replace("/settings/security/sessions");
      toast({ colorScheme: "destructive", description: "Error" });
    },
  });

  const logoutOfSession = () => {
    if (!isPending) {
      mutate();
    }
  };

  if (isError) {
    router.replace("/settings/security/sessions");
    return null;
  }

  return (
    <>
      <TopBar>
        <TopBarLeftPart>
          <TopBarGoBackButton />
          <TopBarTitle>Session</TopBarTitle>
        </TopBarLeftPart>
      </TopBar>

      <div className="pt-4 flex-1 overflow-y-scroll pb-10 px-6">
        <div className="mb-6 flex items-center gap-x-5">
          {isLoading ? (
            <>
              <Skeleton className="w-14 h-14 rounded-full" />
              <Skeleton className="w-20 h-4 rounded-md" />
            </>
          ) : isSuccess ? (
            <>
              <div className="border border-gray-300 rounded-full w-16 aspect-square text-2xl flex justify-center items-center">
                {uaResult.browser.name !== undefined ? (
                  <PiDesktop />
                ) : uaResult.device.type === "mobile" ? (
                  <PiDeviceMobileSpeaker />
                ) : (
                  "--"
                )}
              </div>
              <div className="text-xl font-semibold">
                {uaResult.browser.name
                  ? "Web"
                  : uaResult.device.type === "mobile"
                  ? "Mobile"
                  : "Platform unknown"}
              </div>
            </>
          ) : null}
        </div>

        {isLoading && <Skeleton className="h-9 rounded mb-8" />}

        {isSuccess && !data.session.isCurrentSession && (
          <Button
            variant="outline"
            className="mb-8 text-red-600 w-full sm:w-max"
            onClick={logoutOfSession}
          >
            Desactivate this session
          </Button>
        )}

        {isLoading ? (
          <>
            <SessionInfoItemLoader />
            <SessionInfoItemLoader />
            <SessionInfoItemLoader />
            <SessionInfoItemLoader />
          </>
        ) : (
          <>
            <SessionInfoItem
              label="Created"
              value={
                data !== undefined
                  ? dayjs(data.session.createdAt).format(
                      "MMM DD, YYYY, hh:mm A"
                    )
                  : undefined
              }
            />
            {uaResult.device.vendor && uaResult.device.model && (
              <SessionInfoItem
                label="Device"
                value={uaResult.device.vendor + ", " + uaResult.device.model}
              />
            )}
            <SessionInfoItem label="Os" value={uaResult.os.name} />
            {uaResult.browser.name && uaResult.browser.version && (
              <SessionInfoItem
                label="Browser"
                value={uaResult.browser.name + " " + uaResult.browser.version}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default _Session;

//
//
//
//
//

const SessionInfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => {
  return value ? (
    <div className="mb-4">
      <div className="mb-1 text-gray-900 font-semibold">{label}</div>
      <div className="text-sm text-gray-400 font-medium">{value}</div>
    </div>
  ) : null;
};

const SessionInfoItemLoader = () => {
  return (
    <div className="mb-4">
      <Skeleton className="mb-2 h-2.5 rounded-md w-32" />
      <Skeleton className="h-2.5 rounded-md w-20" />
    </div>
  );
};
