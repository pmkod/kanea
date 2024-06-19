import { postCommentsQueryKey, postsQueryKey } from "@/constants/query-keys";
import { getPostCommentsRequest } from "@/services/post-service";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { FlatList, View } from "react-native";
import PostCommentItem, {
  PostCommentItemLoader,
} from "../items/post-comment-item";
import MyText from "../core/my-text";
import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";
import { useDidUpdate } from "@mantine/hooks";

const firstPageRequestedAtAtom = atom<Date | undefined>(undefined);

const PostCommentsBlock = ({ postId }: { postId: string }) => {
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtAtom
  );
  useEffect(() => {
    if (firstPageRequestedAt === undefined) {
      setFirstPageRequestedAt(new Date());
    } else {
      setFirstPageRequestedAt(undefined);
    }
  }, []);

  const {
    data,
    fetchNextPage,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    isSuccess,
    isFetching,
    isRefetching,
    refetch,
    isError,
  } = useInfiniteQuery({
    queryKey: [postsQueryKey, postId, postCommentsQueryKey],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostCommentsRequest(postId, {
        page: pageParam,
        limit: 8,
        firstPageRequestedAt,
      }),

    getNextPageParam: (lastPage, _) => {
      return lastPage.nextPage;
    },
    enabled: firstPageRequestedAt !== undefined,

    refetchOnMount: "always",
  });

  const postComments = isSuccess
    ? data.pages.map((page) => page.postComments).flat()
    : [];

  const loadMorePostComments = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  useDidUpdate(() => {
    if (firstPageRequestedAt && !isFetching) {
      refetch();
    }
  }, [firstPageRequestedAt]);

  const handleRefresh = () => {
    setFirstPageRequestedAt(new Date());
  };

  return (
    <>
      <View
        style={{
          flex: 1,
        }}
      >
        {isLoading ? (
          <>
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
            <PostCommentItemLoader />
          </>
        ) : isSuccess && data.pages[0].postComments.length === 0 ? (
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <MyText>No comments for this post</MyText>
          </View>
        ) : (
          isSuccess && (
            <FlatList
              refreshing={isRefetching && !isRefetching}
              onRefresh={handleRefresh}
              data={postComments}
              numColumns={1}
              initialNumToRender={18}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <PostCommentItem level={1} postComment={item} />
              )}
              keyExtractor={(item, index) => index.toString()}
              onEndReached={loadMorePostComments}
              onEndReachedThreshold={0.2}
              overScrollMode="never"
              ListFooterComponent={
                isFetchingNextPage ? (
                  <>
                    <PostCommentItemLoader />
                    <PostCommentItemLoader />
                    <PostCommentItemLoader />
                    <PostCommentItemLoader />
                  </>
                ) : null
              }
            />
          )
        )}
      </View>
    </>
  );
};

export default PostCommentsBlock;
