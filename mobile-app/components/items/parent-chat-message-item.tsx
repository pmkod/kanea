import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useTheme } from "@/hooks/use-theme";
import { Message } from "@/types/message";
import { formatMilisecondsToMinutes } from "@/utils/datetime-utils";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { Image, View } from "react-native";
import MyText from "../core/my-text";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ParentChatMessageItemProps {
  message: Message | null;
  //   chatBodySize: {
  //     width: number;
  //     height: number;
  //   };
  onTheRight?: boolean;
  isMessageToReplyTo?: boolean;
}

const ParentChatMessageItem = ({
  message,
  //   chatBodySize,
  onTheRight,
  isMessageToReplyTo,
}: ParentChatMessageItemProps) => {
  const { data: loggedInUserData, isSuccess } = useLoggedInUser({
    enabled: false,
  });

  const sentByLoggedInUser = isSuccess
    ? loggedInUserData?.user.id === message?.senderId
    : false;

  const { theme } = useTheme();

  return (
    <View
      style={{
        overflow: "hidden",
        flexDirection: "row",
        borderRadius: 4,
        // width: "100%",

        borderWidth: 1,
        borderColor: onTheRight ? theme.gray200 : theme.gray300,
      }}
    >
      <View
        style={{
          //   paddingHorizontal: 60,
          //   paddingLeft: 10,
          //   paddingRight: 10,
          paddingVertical: 4,
          //   flex: 1,
          backgroundColor: onTheRight ? theme.gray100 : theme.gray200,
          paddingRight: message?.medias && message.medias.length > 0 ? 8 : 14,
          paddingLeft: 8,
          borderRadius: 4,
          //   flexDirection: "column",
          //   width: 20,
        }}
      >
        <MyText
          style={{
            color: theme.gray600,
            fontFamily: "NunitoSans_600SemiBold",
            fontSize: 11,
          }}
        >
          {message === null ||
          message.usersWhoDeletedTheMessageForThem.includes(
            loggedInUserData!.user.id
          )
            ? "_"
            : sentByLoggedInUser
            ? "Vous"
            : message.sender.displayName}
        </MyText>
        {message?.voiceNote && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MaterialCommunityIcons
              name="microphone-outline"
              color={theme.gray600}
              size={18}
            />

            <MyText style={{ color: theme.gray600 }}>
              {formatMilisecondsToMinutes(message.voiceNote.durationInMs)}
            </MyText>
          </View>
        )}
        {message?.docs &&
          message.docs.length > 0 &&
          message.docs.map((doc) => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <MaterialCommunityIcons
                name="file-outline"
                color={theme.green600}
                size={18}
              />
              <MyText
                key={doc.fileName}
                style={{ color: theme.gray600 }}
              >{`${doc.originalFileName}`}</MyText>
            </View>
          ))}
        <MyText
          numberOfLines={1}
          style={{
            // maxWidth: isMessageToReplyTo
            //   ? undefined
            //   : chatBodySize.width * 0.48,
            color: theme.gray600,
            // width:
            // flex: 1,
          }}
        >
          {message === null
            ? "Deleted"
            : message.usersWhoDeletedTheMessageForThem.includes(
                loggedInUserData!.user.id
              )
            ? "Deleted by you"
            : message.text}
          <>
            {message && message.medias.length > 0
              ? `${message.medias.length} media${
                  message.medias.length > 1 ? "s" : ""
                }`
              : message && message.docs.length > 0
              ? `${message.docs.length} document${
                  message.docs.length > 1 ? "s" : ""
                }`
              : ""}
          </>
        </MyText>
      </View>

      {message?.medias && message.medias.length > 0 && (
        <View style={{ width: 80, aspectRatio: "1/1" }}>
          {
            acceptedImageMimetypes.includes(message.medias[0].mimetype) ? (
              <Image
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                src={buildMessageFileUrl({
                  messageId: message.id,
                  discussionId: message.discussionId,
                  fileName: message.medias[0].lowQualityFileName,
                })}
              />
            ) : acceptedVideoMimetypes.includes(
                message.medias[0].mimetype
              ) ? null : null //   </video> //     /> //       type={message.medias[0].mimetype} //       })} //         fileName: message.medias[0].bestQualityFileName, //         discussionId: message.discussionId, //         messageId: message.id, //       src={buildMessageFileUrl({ //     <source //   <video className="w-full h-full object-cover">
          }
        </View>
      )}
    </View>
  );
};

export default ParentChatMessageItem;
