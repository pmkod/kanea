import { baseV1ApiUrl } from "@/configs";
import { sessionIdFieldName } from "@/constants/session-constants";
import { httpClient } from "@/services/http-client";

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
  "/api/v1/discussions/" +
  discussionId +
  "/messages/" +
  messageId +
  "/files/" +
  fileName +
  "?" +
  sessionIdFieldName +
  "=" +
  localStorage.getItem(sessionIdFieldName);

export const buildDiscussionFileUrl = ({
  discussionId,
  fileName,
}: {
  discussionId: string;
  fileName: string;
}) =>
  baseV1ApiUrl +
  "/api/v1/discussions/" +
  discussionId +
  "/files/" +
  fileName +
  "?" +
  sessionIdFieldName +
  "=" +
  localStorage.getItem(sessionIdFieldName);
