import {
  discussionsQueryKey,
  messagesWithMediasQueryKey,
} from "@/constants/query-keys";
import { getDiscussionMessagesWithMediasRequest } from "@/services/discussion-service";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useDiscussionMessagesWithMediasFirstPage = ({
  discussionId,
  firstPageRequestedAt,
}: {
  firstPageRequestedAt?: Date;
  discussionId: string;
}) =>
  useQuery({
    queryKey: [
      discussionsQueryKey,
      discussionId,
      messagesWithMediasQueryKey + "_first-page",
    ],
    queryFn: (query) =>
      getDiscussionMessagesWithMediasRequest(discussionId, {
        page: 1,
        firstPageRequestedAt,
      }),
  });
