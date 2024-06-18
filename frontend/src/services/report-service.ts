import { httpClient } from "./http-client";

//
//
//
//

export const makeReportRequest = async ({
  reportedUserId,
  reportedPostId,
  reportedPostCommentId,
  reportedMessageId,
  reportedDiscussionId,
  reportReasonId,
  customReason,
}: {
  reportedUserId?: string;
  reportedPostId?: string;
  reportedPostCommentId?: string;
  reportedMessageId?: string;
  reportedDiscussionId?: string;
  reportReasonId?: string;
  customReason?: string;
}): Promise<{}> =>
  await httpClient
    .post("reports", {
      json: {
        reportedUserId,
        reportedPostId,
        reportedPostCommentId,
        reportedMessageId,
        reportedDiscussionId,
        reportReasonId,
        customReason,
      },
    })
    .json();
