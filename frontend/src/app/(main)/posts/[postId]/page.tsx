"use client";
import { Button } from "@/components/core/button";
import {
  TopBar,
  TopBarGoBackButton,
  TopBarLeftPart,
  TopBarTitle,
} from "@/components/core/top-bar";
import PostItem, { PostItemLoader } from "@/components/items/post-item";
import PostCommentsBlock from "@/components/sheets/post-comments-block";
import { appName } from "@/constants/app-constants";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { usePost } from "@/hooks/use-post";
import { useMediaQuery, useNetwork } from "@mantine/hooks";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { IoCloudOfflineOutline } from "react-icons/io5";
import { PiMagnifyingGlass } from "react-icons/pi";
import { TbError404 } from "react-icons/tb";

const PostPage = () => {
  const params = useParams();
  const router = useRouter();
  const network = useNetwork();

  const goToPreviousRoutes = () => {
    router.back();
  };

  const { data, isLoading, isSuccess, isError } = usePost(
    params.postId.toString(),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    }
  );

  const { isSuccess: isLoggedInUserSuccess, data: loggedInUserData } =
    useLoggedInUser({ enabled: false });

  const xlMinMediaQuery = useMediaQuery("(min-width: 1280px)");

  useEffect(() => {
    if (isSuccess && isLoggedInUserSuccess) {
      const unseenDiscussionMessagesAndNotificationsCount =
        loggedInUserData.user.unseenNotificationsCount +
        loggedInUserData.user.unseenDiscussionMessagesCount;

      const prefix =
        unseenDiscussionMessagesAndNotificationsCount > 0
          ? `(${unseenDiscussionMessagesAndNotificationsCount}) `
          : "";

      const documentTitleContainParenthesis = document.title.includes("(");

      const rightParenthesisIndex = document.title.indexOf(")");

      document.title = documentTitleContainParenthesis
        ? document.title.slice(rightParenthesisIndex + 2)
        : document.title;

      document.title =
        prefix +
        "@" +
        data.post.publisher.userName +
        (data.post.text ? ' : "' + data.post.text + '"' : " post") +
        " - " +
        appName;
    }
  }, [isSuccess, isLoggedInUserSuccess, loggedInUserData]);

  return (
    <div className="flex justify-between max-w-5xl mx-auto xl:h-screen xl:overflow-hidden">
      <div className="w-full sm:w-max mx-auto xl:ml-14">
        <div className="sticky top-0 bg-white z-40">
          <TopBar>
            <div className="-mx-1 sm:-mx-5">
              <TopBarLeftPart>
                <TopBarGoBackButton onClick={goToPreviousRoutes} />
                <TopBarTitle>Post</TopBarTitle>
              </TopBarLeftPart>
            </div>
          </TopBar>
        </div>

        <div className="sm:w-[540px] gap-x-4">
          {isLoading ? (
            <PostItemLoader />
          ) : isSuccess ? (
            <PostItem post={data.post} />
          ) : null}
          {isError && (
            <div className="w-full aspect-square flex flex-col pt-20 items-center">
              {network.online ? (
                <>
                  <div className="mb-2 text-5xl md:text-8xl">
                    <TbError404 />
                  </div>
                  <div className="text-left md:text-2xl mb-5">
                    Post not found
                  </div>
                  <Button variant="outline" asChild className="">
                    <Link href="/explore">
                      <PiMagnifyingGlass />
                      <span className="ml-2">Go to explore</span>
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-3xl md:text-5xl mb-3">
                    <IoCloudOfflineOutline />
                  </div>

                  <div className="text-xl md:text-2xl mb-10">
                    You are offline
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {isSuccess && xlMinMediaQuery && (
        <div className="w-96 border-l border-gray-100 pl-6 pr-2 h-screen py-4 fixed top-0 right-2 bg-white">
          <PostCommentsBlock post={data.post} />
        </div>
      )}
    </div>
  );
};

export default PostPage;
