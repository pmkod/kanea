import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import * as Clipboard from "expo-clipboard";
import MyText from "../core/my-text";
import { Skeleton } from "../core/skeleton";
import { useTheme } from "@/hooks/use-theme";
import { Message } from "@/types/message";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import ParentChatMessageItem from "./parent-chat-message-item";
import { Menu } from "react-native-paper";
import { DropdownMenuItem } from "../core/dropdown-menu";
import { useNavigation, useRoute } from "@react-navigation/native";
import {
  makeReportScreenName,
  messageMediasScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import Toast from "react-native-toast-message";
import { useSetAtom } from "jotai";
import { messageToReplyToAtom } from "@/screens/discussions/chat-footer";
import { useDiscussion } from "@/hooks/use-discussion";
import dayjs from "dayjs";
import Avatar from "../core/avatar";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { getNameInitials } from "@/utils/user-utils";
import ParsedText from "react-native-parsed-text";
import { truncate } from "@/utils/string-utils";
import NiceModal from "@ebay/nice-modal-react";
import { DeleteMessageConfirmModal } from "../modals/delete-message-confirm-modal";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { AVPlaybackStatusSuccess, ResizeMode, Video } from "expo-av";
import { themes } from "@/styles/themes";

interface ChatMessageItemProps {
  // chatBodySize: {
  //   width: number;
  //   height: number;
  // };

  message: Message;
  isGroupMessage: boolean;
  // chatBodyWidth: number;
}

const ChatMessageMediaItem = ({
  media,
  message,
  showDropdown,
}: {
  media: Message["medias"][0];
  message: Message;
  showDropdown: () => void;
}) => {
  const route = useRoute();
  // const { discussionId } = route.params as {
  //   discussionId: string;
  // };
  const navigation = useNavigation();
  const seeMedia = () => {
    const initialMediaIndex = message.medias.findIndex(
      ({ id }) => id === media.id
    );
    navigation.navigate(messageMediasScreenName, {
      initialMediaIndex,
      message,
    });
  };

  const [status, setStatus] = useState<AVPlaybackStatusSuccess | undefined>(
    undefined
  );
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={seeMedia}
      onLongPress={showDropdown}
      style={{ height: "100%", flex: 1 }}
    >
      {({ pressed }) =>
        acceptedImageMimetypes.includes(media.mimetype) ? (
          <Image
            src={buildMessageFileUrl({
              fileName: media.lowQualityFileName,
              discussionId: message.discussionId,
              messageId: message.id,
            })}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              backgroundColor: theme.gray200,
              // opacity: pressed ? 0.9 : 1,
            }}
          />
        ) : acceptedVideoMimetypes.includes(media.mimetype) ? (
          <View style={{ position: "relative", flex: 1 }}>
            <Video
              style={{
                flex: 1,
              }}
              shouldPlay={false}
              videoStyle={{ backgroundColor: themes.light.gray950 }}
              resizeMode={ResizeMode.COVER}
              onPlaybackStatusUpdate={(status: any) => setStatus(status)}
              source={{
                uri: buildMessageFileUrl({
                  fileName: media.bestQualityFileName,
                  discussionId: message.discussionId,
                  messageId: message.id,
                }),
              }}
            />
            <View
              style={{
                position: "absolute",
                flex: 1,
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  borderRadius: 500,
                  padding: 12,
                  backgroundColor: themes.light.gray900,
                }}
              >
                {!status ? (
                  <ActivityIndicator size="small" color={themes.light.white} />
                ) : (
                  <Ionicons
                    name="play"
                    size={20}
                    weight="fill"
                    color={themes.light.white}
                  />
                )}
              </View>
            </View>
          </View>
        ) : null
      }
    </Pressable>
  );
};

const ChatMessageDocItem = ({
  doc,
  message,
}: {
  message: Message;
  doc: Message["docs"][0];
}) => {
  const { theme } = useTheme();
  const download = async () => {
    // await downloadFile({
    //   url: buildMessageFileUrl({
    //     fileName: doc.fileName,
    //     messageId: message.id,
    //     discussionId: message.discussionId,
    //   }),
    //   name: doc.originalFileName,
    // });
  };
  return (
    <Pressable onPress={download}>
      {({ pressed }) => (
        <View
          key={doc.fileName}
          style={{
            borderWidth: 0.8,
            borderColor: theme.gray300,
            padding: 5,
            borderRadius: 4,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            // backgroundColor: pressed ? theme.gray300 : theme.transparent,
          }}
        >
          <MaterialCommunityIcons
            name="file-outline"
            size={16}
            color={theme.gray950}
            style={{ marginRight: 8, marginBottom: 2 }}
          />
          <View
            style={{
              maxWidth: 140,
              paddingBottom: 2,
              overflow: "hidden",
              marginRight: 16,
            }}
          >
            <MyText numberOfLines={1}>{doc.originalFileName}</MyText>
          </View>

          <Feather name="download" size={14} color={theme.gray950} />
        </View>
      )}
    </Pressable>
  );
};

export const ChatMessageItem = ({
  // chatBodyWidth,
  message,
  isGroupMessage,
}: ChatMessageItemProps) => {
  // <PiArrowBendUpLeftBold />

  const { data } = useLoggedInUser({ enabled: false });
  const sentByLoggedInUser = message.senderId === data?.user.id;
  const { theme } = useTheme();
  const navigation = useNavigation();
  const setMessageToReplyTo = useSetAtom(messageToReplyToAtom);
  const { data: loggedInUserData } = useLoggedInUser({ enabled: false });
  const { data: discussionData, isSuccess: isDiscussionData } = useDiscussion(
    message.discussionId,
    {
      enabled: false,
    }
  );

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const showDropdown = () => setIsDropdownVisible(true);

  const hideDropdown = () => setIsDropdownVisible(false);

  const copyMessageText = async () => {
    if (message.text) {
      await Clipboard.setStringAsync(message.text);
      Toast.show({
        type: "info",
        text2: "Copied",
      });
    }
  };

  const goToMakeReportScreen = () => {
    navigation.navigate(makeReportScreenName, {
      message,
    });
  };
  const openDeleteMessageModal = () => {
    NiceModal.show(DeleteMessageConfirmModal, {
      message,
    });
  };
  const visitSenderProfile = () => {
    navigation.navigate(userScreenName, {
      userName: message.sender.userName,
    });
  };
  return (
    <>
      <Pressable
        style={{
          marginBottom: 6,
          width: "100%",
        }}
        onLongPress={showDropdown}
        delayLongPress={150}
      >
        {({ pressed }) => (
          <View style={{ position: "relative", width: "100%" }}>
            {/* {pressed && (
              <View
                style={{
                  position: "absolute",
                  zIndex: 500,
                  backgroundColor: pressed ? theme.blue : theme.transparent,
                  width: "100%",
                  height: "100%",
                  opacity: 0.2,
                }}
              ></View>
            )} */}
            <View
              style={{
                // width: "auto",
                flexDirection: "row",
                // gap: 8,
                alignSelf: sentByLoggedInUser ? "flex-end" : "flex-start",
                paddingHorizontal: 14,
                maxWidth: "80%",
                // opacity: pressed ? 0.5 : 1,
                // backgroundColor: "blue",
              }}
            >
              {!sentByLoggedInUser && isGroupMessage && (
                <Pressable
                  onPress={visitSenderProfile}
                  style={{ marginRight: 8 }}
                >
                  <Avatar
                    width={30}
                    src={
                      message.sender.profilePicture
                        ? buildPublicFileUrl({
                            fileName:
                              message.sender.profilePicture.lowQualityFileName,
                          })
                        : undefined
                    }
                    name={getNameInitials(message.sender.displayName)}
                  />
                </Pressable>
              )}
              <View
                style={{
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: sentByLoggedInUser
                    ? theme.gray300
                    : theme.gray200,
                  backgroundColor: sentByLoggedInUser
                    ? theme.white
                    : theme.gray200,
                  // maxWidth: "100%",
                }}
              >
                {!sentByLoggedInUser && isGroupMessage && (
                  <Pressable
                    onPress={visitSenderProfile}
                    style={{ marginTop: 2, marginHorizontal: 4 }}
                  >
                    <MyText style={{ fontSize: 11, color: theme.gray600 }}>
                      {message.sender.displayName}
                    </MyText>
                  </Pressable>
                )}
                {message.parentMessage && (
                  <View style={{ padding: 4 }}>
                    <ParentChatMessageItem
                      message={message.parentMessage}
                      // chatBodySize={chatBodySize}
                      onTheRight={sentByLoggedInUser}
                    />
                  </View>
                )}
                {message.docs && message.docs.length > 0 && (
                  <View style={{ padding: 4, gap: 4 }}>
                    {message.docs.map((doc) => (
                      <ChatMessageDocItem
                        key={doc.fileName}
                        doc={doc}
                        message={message}
                      />
                    ))}
                  </View>
                )}
                {message.medias && message.medias.length > 0 && (
                  <View
                    style={{
                      padding: 4,
                    }}
                  >
                    <View
                      style={{
                        maxWidth: 400,
                        borderRadius: 2,
                        overflow: "hidden",
                        width: Dimensions.get("screen").width * 0.5,
                        aspectRatio: "1/1",
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                        }}
                      >
                        <ChatMessageMediaItem
                          media={message.medias[0]}
                          message={message}
                          showDropdown={showDropdown}
                        />
                        {message.medias.length > 1 && (
                          <ChatMessageMediaItem
                            media={message.medias[1]}
                            message={message}
                            showDropdown={showDropdown}
                          />
                        )}
                      </View>
                      {message.medias.length > 2 && (
                        <View
                          style={{
                            flex: 1,
                            width: "100%",
                            flexDirection: "row",
                          }}
                        >
                          <ChatMessageMediaItem
                            media={message.medias[2]}
                            message={message}
                            showDropdown={showDropdown}
                          />

                          {message.medias.length > 3 && (
                            <ChatMessageMediaItem
                              media={message.medias[3]}
                              message={message}
                              showDropdown={showDropdown}
                            />
                          )}
                        </View>
                      )}
                    </View>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "flex-end",
                    justifyContent: message.text ? "space-between" : "flex-end",
                    flexWrap: "wrap",
                  }}
                >
                  {message.text && (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingTop: 4,
                        paddingBottom: 8,
                      }}
                    >
                      <ParsedText
                        style={{
                          color: theme.gray900,
                          fontFamily: "NunitoSans_400Regular",
                          fontSize: 15,
                        }}
                        parse={[
                          {
                            type: "url",
                            style: { color: theme.blue },
                            onPress: Linking.openURL,
                            renderText: (matchingString) =>
                              "\n" + truncate(matchingString, 50),
                          },
                        ]}
                      >
                        {message.text}
                      </ParsedText>
                    </View>
                  )}

                  <View
                    // ${(message.text === "" || message.text === undefined) && "mt-2"}`
                    style={{
                      flexDirection: "row",
                      marginBottom: 4,
                      marginLeft: "auto",
                      // alignSelf: "flex-end",
                    }}
                  >
                    <MyText
                      style={{
                        fontSize: 10,
                        marginRight: 4,
                        color: theme.gray700,
                      }}
                    >
                      {dayjs(message.createdAt).format("HH:mm")}
                    </MyText>
                    {message.senderId === loggedInUserData?.user.id &&
                      discussionData !== undefined &&
                      message.viewers.length ===
                        discussionData.discussion.members.length - 1 && (
                        <View
                          style={{
                            marginRight: 7,
                            marginTop: 2,
                          }}
                        >
                          <MaterialIcons
                            name="done-all"
                            weight="bold"
                            color={theme.blue}
                            size={12}
                          />
                        </View>
                      )}
                  </View>
                </View>
              </View>

              <Menu
                visible={isDropdownVisible}
                onDismiss={hideDropdown}
                style={{
                  paddingVertical: 0,
                  zIndex: 800,
                }}
                contentStyle={{
                  backgroundColor: theme.gray100,
                  alignSelf: sentByLoggedInUser ? "flex-end" : "flex-start",
                }}
                elevation={2}
                anchor={
                  <View
                    style={{
                      width: 1,
                      height: 1,
                    }}
                  ></View>
                }
              >
                <DropdownMenuItem
                  onPress={() => setMessageToReplyTo(message)}
                  title="Reply"
                  leftDecorator={
                    <MaterialCommunityIcons name="arrow-left-top" />
                  }
                  closeMenu={hideDropdown}
                />
                {message.text && (
                  <DropdownMenuItem
                    onPress={copyMessageText}
                    title="Copy"
                    leftDecorator={
                      <MaterialCommunityIcons name="content-copy" />
                    }
                    closeMenu={hideDropdown}
                  />
                )}
                <DropdownMenuItem
                  onPress={goToMakeReportScreen}
                  title="Report"
                  leftDecorator={<Feather name="flag" />}
                  closeMenu={hideDropdown}
                />
                <DropdownMenuItem
                  onPress={openDeleteMessageModal}
                  title="Delete"
                  leftDecorator={<Feather name="trash-2" />}
                  closeMenu={hideDropdown}
                />
              </Menu>
            </View>
          </View>
        )}
      </Pressable>
    </>
  );
};

export const ChatMessageItemLoader = ({
  widthPercentage = 40,
  side = "left",
}: {
  widthPercentage?: number;
  side?: "left" | "right";
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        // width: "100%",
        justifyContent: side === "left" ? "flex-start" : "flex-end",
        marginBottom: 6,
        height: 40,
        width: "100%",
        paddingHorizontal: 14,
      }}
    >
      <Skeleton
        style={{
          width: `${widthPercentage}%`,
          borderRadius: 6,
          height: "100%",

          // marginLeft: "auto",
        }}
      />
    </View>
  );
};
