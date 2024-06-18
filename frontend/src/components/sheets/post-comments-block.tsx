"use client";
import { postCommentsQueryKey, postsQueryKey } from "@/constants/query-keys";
import { getPostCommentsRequest } from "@/services/post-service";
import { Post } from "@/types/post";
import { useScrollIntoView } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import {
  PostCommentItem,
  PostCommentItemLoader,
} from "../items/post-comment-item";
import { PostCommentInput } from "../others/post-comment-input";
//
//
//
//
//

const firstPageRequestedAtAtom = atom(new Date());

const PostCommentsBlock = ({ post }: { post: Post }) => {
  const { scrollIntoView, targetRef, scrollableRef } = useScrollIntoView<
    HTMLDivElement,
    HTMLDivElement
  >({ duration: 0 });

  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );

  const {
    data,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: [postsQueryKey, post.id, postCommentsQueryKey],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostCommentsRequest(post.id, {
        page: pageParam,
        limit: 8,
        firstPageRequestedAt,
      }),

    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },

    refetchOnMount: "always",
  });

  //
  //
  //
  //

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    if (
      e.currentTarget.offsetHeight + e.currentTarget.scrollTop >=
        e.currentTarget.scrollHeight - 20 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <div
      className="flex-1 h-full flex flex-col"
      style={{ overflowAnchor: "auto" }}
    >
      <div className="text-lg font-semibold text-center md:text-left pb-5">
        Comments
      </div>
      <div
        ref={scrollableRef}
        className={"flex-1 overflow-y-auto max-h-[60vh] md:max-h-none"}
        onScroll={handleScroll}
      >
        {isLoading && (
          <>
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
          </>
        )}
        {isSuccess && data.pages[0].postComments.length === 0 && (
          <div className="text-center text-gray-500 text-sm pt-20">
            No comments for this post
          </div>
        )}
        {isSuccess &&
          data?.pages.map((page) =>
            page.postComments.map((postComment) => (
              <PostCommentItem key={postComment.id} postComment={postComment} />
            ))
          )}
        {isFetchingNextPage && (
          <>
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
          </>
        )}
      </div>
      <div className="pt-4">
        <PostCommentInput post={post} context="post-block" />
      </div>
    </div>
  );
};

export default PostCommentsBlock;
