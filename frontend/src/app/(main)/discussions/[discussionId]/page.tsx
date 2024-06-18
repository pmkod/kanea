"use client";
import { Button } from "@/components/core/button";
import { useDiscussion } from "@/hooks/use-discussion";
import { useElementSize, useNetwork } from "@mantine/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IoCloudOfflineOutline } from "react-icons/io5";
import { PiArrowLeft } from "react-icons/pi";
import { TbMessageCircleX } from "react-icons/tb";
import ChatBody from "./_chat-body";
import ChatFooter from "./_chat-footer";
import ChatHeader from "./_chat-header";

const DiscussionPage = () => {
  const params = useParams();

  const discussionId = params.discussionId.toString();

  const { ref, width, height } = useElementSize();

  const network = useNetwork();

  const { isError } = useDiscussion(params.discussionId.toString(), {
    enabled: discussionId !== "new",
  });

  return (
    <div
      ref={ref}
      className="flex-1 flex flex-col h-full max-w-[100vw] overflow-x-hidden"
    >
      <ChatHeader />
      {isError ? (
        <div className="flex-1 flex flex-col items-center pt-20 text-gray-500">
          {network.online ? (
            <>
              <div className="text-3xl md:text-5xl mb-3">
                <TbMessageCircleX />
              </div>
              <div className="text-xl md:text-2xl mb-10">
                Discussion not found
              </div>
              <div className="">
                <Button variant="outline" asChild>
                  <Link href="/discussions">
                    <PiArrowLeft />
                    <span className="ml-2">See my discussions</span>
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl md:text-5xl mb-3">
                <IoCloudOfflineOutline />
              </div>

              <div className="text-xl md:text-2xl mb-10">You are offline</div>
            </>
          )}
        </div>
      ) : (
        <>
          <ChatBody chatBodySize={{ width, height }} />
          <ChatFooter chatBodySize={{ width, height }} />
        </>
      )}
    </div>
  );
};

export default DiscussionPage;
