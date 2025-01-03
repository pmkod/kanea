import { baseV1ApiUrl } from "@/configs";
import { sessionIdFieldName } from "@/constants/session-constants";
import * as SecureStore from "expo-secure-store";

export const buildMessageFileUrl = ({
  discussionId,
  messageId,
  fileName,
}: {
  discussionId: string;
  messageId: string;
  fileName: string;
}) =>
  baseV1ApiUrl +
  "/v1/discussions/" +
  discussionId +
  "/messages/" +
  messageId +
  "/files/" +
  fileName +
  "?" +
  sessionIdFieldName +
  "=" +
  SecureStore.getItem(sessionIdFieldName);

export const buildDiscussionFileUrl = ({
  discussionId,
  fileName,
}: {
  discussionId: string;
  fileName: string;
}) =>
  baseV1ApiUrl +
  "/v1/discussions/" +
  discussionId +
  "/files/" +
  fileName +
  "?" +
  sessionIdFieldName +
  "=" +
  SecureStore.getItem(sessionIdFieldName);

export const getUnseenDiscussionMessagesOfThisDiscussion = (
  discData: any,
  loggedInUserData: any
): number | undefined => {
  // for (const page of discsData.pages) {
  // for (const discussion of page.discussions) {
  // if (discussion.id === params.discussionId) {
  // if () {

  for (const member of discData.discussion.members) {
    if (member.userId === loggedInUserData?.user.id) {
      return member.unseenDiscussionMessagesCount;
    }
  }
  // }
  // }
  // }
  // }
  return undefined;
};
