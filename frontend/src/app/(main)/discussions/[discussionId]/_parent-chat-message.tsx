import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Message } from "@/types/message";
import { formatMilisecondsToMinutes } from "@/utils/datetime-utils";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { PiFileFill, PiMicrophoneFill } from "react-icons/pi";

interface ParentChatMessageProps {
  message: Message | null;
  chatBodySize: {
    width: number;
    height: number;
  };
  onTheRight?: boolean;
  isMessageToReplyTo?: boolean;
}

const ParentChatMessage = ({
  message,
  chatBodySize,
  onTheRight,
  isMessageToReplyTo,
}: ParentChatMessageProps) => {
  const { data: loggedInUserData, isSuccess } = useLoggedInUser({
    enabled: false,
  });

  const sentByLoggedInUser = isSuccess
    ? loggedInUserData?.user.id === message?.senderId
    : false;

  return (
    <div className="flex rounded overflow-hidden">
      <div
        className={`px-2 py-1 text-xs flex-1 border ${
          onTheRight === true
            ? "bg-gray-100 border-gray-200"
            : "bg-gray-200 border-gray-300"
        } ${message?.medias && message.medias.length > 0 && "pr-4"}`}
      >
        <div className={`font-bold text-gray-700`}>
          {message === null ||
          message.usersWhoDeletedTheMessageForThem.includes(
            loggedInUserData!.user.id
          )
            ? "_"
            : sentByLoggedInUser
            ? "Vous"
            : message.sender.displayName}
        </div>
        {message?.voiceNote && (
          <div className={`flex items-center gap-x-1 text-gray-700`}>
            <div className="text-sm">
              <PiMicrophoneFill />
            </div>

            <span className="text-xs mt-0.5">
              {formatMilisecondsToMinutes(message.voiceNote.durationInMs)}
            </span>
          </div>
        )}
        {message?.docs &&
          message.docs.length > 0 &&
          message.docs.map((doc) => (
            <div className={`flex items-center gap-x-1 text-gray-600`}>
              <div className="text-sm">
                <PiFileFill />
              </div>
              <div
                key={doc.fileName}
                className="text-xs"
              >{`${doc.originalFileName}`}</div>
            </div>
          ))}
        <div
          style={{
            maxWidth: isMessageToReplyTo
              ? undefined
              : `${chatBodySize.width * 0.48}px`,
          }}
          className={`break-words text-gray-600 ${
            isMessageToReplyTo ? "line-clamp-2" : ""
          }`}
        >
          {message === null
            ? "Deleted"
            : message.usersWhoDeletedTheMessageForThem.includes(
                loggedInUserData!.user.id
              )
            ? "Deleted by you"
            : message.text}
          <div>
            {message && message.medias.length > 0
              ? `${message.medias.length} media${
                  message.medias.length > 1 ? "s" : ""
                }`
              : message && message.docs.length > 0
              ? `${message.docs.length} document${
                  message.docs.length > 1 ? "s" : ""
                }`
              : ""}
          </div>
        </div>
      </div>

      {message?.medias && message.medias.length > 0 && (
        <div className="w-14 h-14">
          {acceptedImageMimetypes.includes(message.medias[0].mimetype) ? (
            <img
              src={buildMessageFileUrl({
                messageId: message.id,
                discussionId: message.discussionId,
                fileName: message.medias[0].lowQualityFileName,
              })}
              className="w-full h-full object-cover"
            />
          ) : acceptedVideoMimetypes.includes(message.medias[0].mimetype) ? (
            <video className="w-full h-full object-cover">
              <source
                src={buildMessageFileUrl({
                  messageId: message.id,
                  discussionId: message.discussionId,
                  fileName: message.medias[0].bestQualityFileName,
                })}
                type={message.medias[0].mimetype}
              />
            </video>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ParentChatMessage;
