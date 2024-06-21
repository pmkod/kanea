import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { Discussion } from "@/types/discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import Avatar from "../core/avatar";
import Space from "../core/space";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { buildDiscussionFileUrl } from "@/utils/discussion-utils";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import dayjs from "dayjs";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "../core/skeleton";
import { discussionScreenName } from "@/constants/screens-names-constants";
import { formatMilisecondsToMinutes } from "@/utils/datetime-utils";

interface DiscussionItemProps {
  discussion: Discussion;
  onPress?: () => void;
}

export const DiscussionItem = ({
  discussion,
  onPress,
}: DiscussionItemProps) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const goToDiscussionPage = () => {
    navigation.navigate(discussionScreenName, {
      discussionId: discussion.id,
    });
  };
  if (onPress === undefined) {
    onPress = goToDiscussionPage;
  }

  const { data, isSuccess } = useLoggedInUser({
    enabled: false,
  });

  const chatType: "group" | "private" =
    discussion.name !== undefined ? "group" : "private";

  const userToShow =
    chatType === "private"
      ? discussion.members.find((member) => member.userId !== data?.user.id)
          ?.user
      : undefined;

  const name =
    userToShow !== undefined ? userToShow.displayName : discussion.name;

  const unseenDiscussionMessagesCount =
    discussion.members.find((member) => member.userId === data?.user?.id)
      ?.unseenDiscussionMessagesCount ?? 0;

  const discussionPictureUrl =
    userToShow && userToShow.profilePicture && chatType === "private"
      ? buildPublicFileUrl({
          fileName: userToShow.profilePicture.lowQualityFileName,
        })
      : discussion.picture !== undefined && chatType === "group"
      ? buildDiscussionFileUrl({
          discussionId: discussion.id,
          fileName: discussion.picture.lowQualityFileName,
        })
      : undefined;

  const lastMessageDate = discussion.lastMessage
    ? dayjs(discussion.lastMessageSentAt).isToday()
      ? dayjs(discussion.lastMessageSentAt).format("HH:mm")
      : dayjs(discussion.lastMessageSentAt).format("MM/DD/YY")
    : null;

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: pressed ? theme.gray100 : theme.white,
          }}
        >
          <DiscussionItemAvatar
            chatType={chatType}
            name={name}
            discussionPictureUrl={discussionPictureUrl}
            online={userToShow?.online}
          />
          <Space width={16} />
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 2,
              }}
            >
              <MyText
                style={{ fontSize: 15, fontFamily: "NunitoSans_600SemiBold" }}
              >
                {name}
              </MyText>
              <MyText style={{ fontSize: 11, color: "gray" }}>
                {lastMessageDate}
              </MyText>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              >
                {discussion.lastMessage?.senderId === data?.user.id &&
                  discussion.lastMessage?.viewers.length ===
                    discussion.members.length - 1 &&
                  !discussion.lastMessage?.usersWhoDeletedTheMessageForThem.includes(
                    data!.user.id
                  ) &&
                  discussion.lastMessage !== null && (
                    <View style={{ marginRight: 4, marginTop: 0.5 }}>
                      <MaterialIcons
                        name="done-all"
                        size={18}
                        color={theme.blue}
                      />
                    </View>
                  )}
                {isSuccess && discussion.lastMessage ? (
                  discussion.lastMessage.usersWhoDeletedTheMessageForThem.includes(
                    data.user.id
                  ) ? (
                    <>
                      <View style={{ marginRight: 4 }}>
                        <MaterialCommunityIcons
                          name="cancel"
                          size={18}
                          color={theme.gray500}
                        />
                      </View>
                      <LastMessageText>
                        You have deleted this message
                      </LastMessageText>
                    </>
                  ) : isSuccess &&
                    discussion.lastMessage.medias &&
                    discussion.lastMessage.medias.length > 0 ? (
                    <>
                      <View style={{ marginRight: 4 }}>
                        <Ionicons
                          name="image-outline"
                          size={15}
                          color={theme.gray500}
                        />
                      </View>
                      <LastMessageText>
                        {`${discussion.lastMessage.medias.length} media${
                          discussion.lastMessage.medias.length > 1 ? "s" : ""
                        }`}
                      </LastMessageText>
                    </>
                  ) : isSuccess &&
                    discussion.lastMessage.docs &&
                    discussion.lastMessage.docs.length > 0 ? (
                    <>
                      <View style={{ marginRight: 4 }}>
                        <MaterialCommunityIcons
                          name="file-outline"
                          size={18}
                          color={theme.gray500}
                        />
                      </View>
                      <LastMessageText>
                        {`${discussion.lastMessage.docs.length} document${
                          discussion.lastMessage.docs.length > 1 ? "s" : ""
                        }`}
                      </LastMessageText>
                    </>
                  ) : isSuccess &&
                    discussion.lastMessage.voiceNote !== undefined ? (
                    <>
                      <View style={{ marginRight: 4 }}>
                        <MaterialCommunityIcons
                          name="microphone-outline"
                          color={theme.gray500}
                          size={18}
                        />
                      </View>
                      <LastMessageText>
                        {formatMilisecondsToMinutes(
                          discussion.lastMessage.voiceNote.durationInMs
                        )}
                      </LastMessageText>
                    </>
                  ) : (
                    <LastMessageText>
                      {discussion?.lastMessage?.text || ""}
                    </LastMessageText>
                  )
                ) : isSuccess &&
                  discussion.lastMessage === null &&
                  discussion.lastMessageId === undefined ? (
                  <LastMessageText>Group created</LastMessageText>
                ) : (
                  <>
                    <View style={{ marginRight: 4 }}>
                      <MaterialCommunityIcons
                        name="cancel"
                        size={18}
                        color={theme.gray500}
                      />
                    </View>
                    <LastMessageText>Message deleted</LastMessageText>
                  </>
                )}
              </View>

              {unseenDiscussionMessagesCount > 0 && (
                <View
                  style={{
                    borderRadius: 120,
                    backgroundColor: theme.blue,
                    paddingHorizontal: 4.8,
                    paddingTop: 1.8,
                    paddingBottom: 2,
                    minWidth: 18,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MyText
                    style={{
                      color: "#ffffff",
                      fontWeight: "bold",
                      fontSize: 11,
                    }}
                  >
                    {unseenDiscussionMessagesCount > 999
                      ? "+999"
                      : unseenDiscussionMessagesCount}
                  </MyText>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

const LastMessageText = ({ children }: { children: string }) => {
  const { theme } = useTheme();
  return (
    <MyText numberOfLines={1} style={{ fontSize: 15, color: theme.gray500 }}>
      {children}
    </MyText>
  );
};

export const DiscussionItemAvatar = ({
  name,
  discussionPictureUrl,
  chatType,
  width,
  online,
}: {
  width?: number;
  name?: string;
  discussionPictureUrl?: string;
  chatType: "group" | "private";
  online?: boolean;
}) => {
  const { theme } = useTheme();

  return (
    <View>
      <Avatar
        src={discussionPictureUrl}
        name={name}
        width={width}
        fallback={
          chatType === "group" && discussionPictureUrl === undefined ? (
            <MaterialCommunityIcons
              name="account-group-outline"
              size={width ? width * 0.4 : 24}
              color={theme.gray400}
            />
          ) : undefined
        }
      />

      {online && (
        <View
          style={{
            padding: width ? width * 0.05 : 2,
            borderRadius: 300,
            backgroundColor: theme.white,
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        >
          <View
            style={{
              backgroundColor: theme.green500,
              borderRadius: 50,
              width: width ? width * 0.26 : 11,
              aspectRatio: "1/1",
            }}
          ></View>
        </View>
      )}
    </View>
  );
};

//
//
//
//
//

export const DiscussionItemLoader = () => {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Skeleton style={{ borderRadius: 500, width: 44, height: 44 }} />
      <Space width={16} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Skeleton style={{ width: "60%", borderRadius: 8, height: 10 }} />
          <Skeleton style={{ width: 40, borderRadius: 8, height: 10 }} />
        </View>
        <Space height={12} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Skeleton style={{ width: "35%", borderRadius: 8, height: 10 }} />
          <Skeleton style={{ width: 20, borderRadius: 8, height: 10 }} />
        </View>
      </View>
    </View>
  );
};
