import { Session } from "@/types/session";
import {
  PiCaretRight,
  PiDesktop,
  PiDeviceMobileSpeaker,
  PiLineSegment,
  PiTextUnderline,
  PiX,
} from "react-icons/pi";
import { UAParser } from "ua-parser-js";
import { Skeleton } from "../core/skeleton";
import Link from "next/link";
import dayjs from "dayjs";

//
//
//
//
//

interface SessionItemProps {
  session: Session;
  isCurrentSession: boolean;
}

//
//
//
//
//

const SessionItem = ({ session, isCurrentSession }: SessionItemProps) => {
  const uaParserInstance = new UAParser(session.agent);
  const uaResult = uaParserInstance.getResult();

  return (
    <Link
      href={`/settings/security/sessions/${session.id}`}
      className="flex items-center px-4 py-2.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
    >
      <div className="border border-gray-200 rounded-full mr-4 w-11 text-xl aspect-square flex justify-center items-center">
        {uaResult.browser.name !== undefined ? (
          <PiDesktop />
        ) : uaResult.device.type === "mobile" ? (
          <PiDeviceMobileSpeaker />
        ) : (
          "--"
        )}
      </div>
      <div className="flex-1">
        <div className="text-sm">
          {uaResult.browser.name
            ? "Web"
            : uaResult.device.type === "mobile"
            ? "Mobile"
            : "Platform unknown"}
        </div>
        <div className="text-xs text-gray-400">
          {"Created " + dayjs(session.createdAt).locale("en").fromNow()}
        </div>
      </div>
      <div className="text-xl">
        <PiCaretRight />
      </div>
    </Link>
  );
};

export default SessionItem;

//
//
//
//
//
//
//
//
//

export const SessionItemLoader = () => {
  return (
    <div className="flex items-center mb-2 px-4">
      <div className="mr-4">
        <Skeleton className="w-12 aspect-square rounded-full" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-2 w-1/3 mb-4" />
        <Skeleton className="h-2 w-1/4" />
      </div>
    </div>
  );
};
