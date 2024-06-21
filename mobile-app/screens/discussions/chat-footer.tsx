import { isMessageSendingAtom } from "@/atoms/is-message-sending-atom";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import {
  DropdownMenu,
  DropdownMenuItem,
} from "@/components/core/dropdown-menu";
import { IconButton } from "@/components/core/icon-button";
import MyText from "@/components/core/my-text";
import { Skeleton } from "@/components/core/skeleton";
import { discussionsQueryKey } from "@/constants/query-keys";
import { useDiscussion } from "@/hooks/use-discussion";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useTheme } from "@/hooks/use-theme";
import { Discussion } from "@/types/discussion";
import { Doc } from "@/types/doc";
import { Media } from "@/types/media";
import { Message } from "@/types/message";
import { User } from "@/types/user";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { atom, useAtom, useAtomValue } from "jotai";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Buffer } from "buffer";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  NativeSyntheticEvent,
  ScrollView,
  TextInput,
  TextInputFocusEventData,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { SelectedMediaItem } from "@/components/items/selected-media-item";
import { selectedMediaScreenName } from "@/constants/screens-names-constants";
import { SelectedDocItem } from "@/components/items/seleted-doc-item";
import ParentChatMessageItem from "@/components/items/parent-chat-message-item";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  Octicons,
} from "@expo/vector-icons";

export const messageToReplyToAtom = atom<Message | undefined>(undefined);
export const selectedMediasAtom = atom<Media[]>([]);
export const selectedDocsAtom = atom<Doc[]>([]);

const ChatFooter = () => {
  const [inputHeight, setInputHeight] = useState(46);
  const { theme } = useTheme();
  const [voiceMessageModeActive, setVoiceMessageModeActive] = useState(false);
  const [messageText, setMessageText] = useState("");
  const route = useRoute();

  const { discussionId, newInterlocutor } = route.params as {
    discussionId?: string;
    newInterlocutor?: User;
  };

  const activateVoiceMessageMode = () => {
    setVoiceMessageModeActive(true);
  };
  const desactivateVoiceMessageMode = () => {
    setVoiceMessageModeActive(false);
  };

  const maxVoiceNoteSeconds = 120;
  const maxChatMessageTextLength = 1000;
  const maxMediasCount = 4;
  const webSocket = useAtomValue(webSocketAtom);
  const queryClient = useQueryClient();
  const [messageToShowInsteadOfInput, setMessageToShowInsteadOfInput] =
    useState<string | undefined>(undefined);
  // const router = useRouter();
  const navigation = useNavigation();

  // const { toast } = useToast();

  // const sendVoiceMessageButtonRef = useRef<HTMLButtonElement>(null);

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  // const { isRecording, stop, start, recorder, error } = useVoiceRecorder(
  //   (data) => {
  //     if (data) {
  //       setVoiceMessage({
  //         url: window.URL.createObjectURL(data),
  //         data,
  //       });
  //     }
  //   }
  // );

  // const [voiceMessage, setVoiceMessage] = useState<{
  //   url: string | null;
  //   data: Blob | null;
  // }>({
  //   url: null,
  //   data: null,
  // });
  // const textAreaRef = useRef<HTMLTextAreaElement>(null);
  // const recorderedVoiceMessageRef = useRef<HTMLAudioElement>(null);

  const [isMessageSending, setIsMessageSending] = useAtom(isMessageSendingAtom);

  const [selectedMedias, setSelectedMedias] = useAtom(selectedMediasAtom);
  const [selectedDocs, setSelectedDocs] = useAtom(selectedDocsAtom);

  const [messageToReplyTo, setMessageToReplyTo] = useAtom(messageToReplyToAtom);

  const [textInputCursorIndex, setTextInputCursorIndex] = useState(0);

  const [recorderedVoiceMessageSeconds, setRecorderedVoiceMessageSeconds] =
    useState(0);

  const [recorderedAudioState, setRecorderedAudioState] = useState<
    "pause" | "playing" | "end" | undefined
  >();

  // const interval = useInterval(
  //   () => setRecorderedVoiceMessageSeconds((s) => s + 1),
  //   1000
  // );

  const [recorderedAudioCurrentTime, setRecorderedAudioCurrentTime] =
    useState(0);

  const handleMessageTextChange = (text: string) => {
    if (text.length >= maxChatMessageTextLength) {
      return;
    }
    setMessageText(text);
  };

  const clearMessageToReplyTo = () => {
    setMessageToReplyTo(undefined);
  };

  // const handleTimeUpdate: ReactEventHandler<HTMLAudioElement> = (e) => {
  //   setRecorderedAudioCurrentTime(e.currentTarget.currentTime);
  // };

  const sendMessage = async () => {
    // if (isRecording) {
    //   stopRecordingVoiceMessage();
    //   setTimeout(() => {
    //     sendVoiceMessageButtonRef.current?.click();
    //   }, 20);
    //   return;
    // }
    // const text = textAreaRef.current?.value;
    if (
      (messageText && messageText.length > 0) ||
      selectedMedias.length > 0 ||
      selectedDocs.length > 0
      // || (voiceMessage.url !== null && voiceMessage.data !== null)
    ) {
      setIsMessageSending(true);
      const dataToSend: any = {};
      if (messageText) {
        dataToSend.text = messageText;
      }
      if (discussionId === undefined) {
        dataToSend.isFirstPrivateMessage = true;
        dataToSend.memberId = newInterlocutor?.id;
      } else {
        dataToSend.discussionId = discussionId;
      }
      if (messageToReplyTo !== undefined) {
        dataToSend.parentMessageId = messageToReplyTo.id;
      }
      if (selectedMedias.length > 0) {
        const medias = [];
        for (const media of selectedMedias) {
          const mediaFetchResponse = await fetch(media.url);
          const mediaBufferArr = await mediaFetchResponse.arrayBuffer();
          const mediaBuffer = Buffer.from(mediaBufferArr);
          medias.push({
            ...media,
            file: mediaBuffer,
          });
        }
        dataToSend.medias = medias;
      } else if (selectedDocs.length > 0) {
        const docs = [];
        for (const doc of selectedDocs) {
          const docFetchResponse = await fetch(doc.url);
          const docBufferArr = await docFetchResponse.arrayBuffer();
          const docBuffer = Buffer.from(docBufferArr);
          docs.push({
            ...doc,
            file: docBuffer,
          });
        }
        dataToSend.docs = docs;
      }

      // if (voiceMessage.url !== null && voiceMessage.data !== null) {
      //   dataToSend.voiceMessage = voiceMessage;
      // }
      webSocket?.emit("send-message", dataToSend);
      setMessageToReplyTo(undefined);
      setSelectedMedias([]);
      setSelectedDocs([]);
    }
  };

  //
  //
  //
  //
  //

  const selectPhotosOrVideos = async ({
    from,
  }: {
    from: "galery" | "camera";
  }) => {
    if (selectedDocs.length > 0) {
      Toast.show({
        type: "info",
        text2: "You can't select image/video and docs at same time",
      });
      return;
    }

    const imagePickerOptions: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,

      aspect: [1, 1],
      quality: 1,
      selectionLimit: maxMediasCount - selectedMedias.length,
      allowsMultipleSelection: true,
      videoMaxDuration: 10 * 60,
      // preferredAssetRepresentationMode: "",
      // allowsMultipleSelection: true,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
    };
    let result =
      from === "galery"
        ? await ImagePicker.launchImageLibraryAsync(imagePickerOptions)
        : await ImagePicker.launchCameraAsync(imagePickerOptions);

    if (!result.canceled) {
      // const medias = result.assets
      const newMedias: any[] = [];
      for (let i = 0; i < result.assets.length; i++) {
        const media = result.assets[i];
        const newMedia: Media = {
          id:
            selectedMedias.length > 0
              ? selectedMedias[selectedMedias.length - 1].id + 1 + i
              : 1 + i,
          url: media.uri,
          mimeType: media.mimeType,
        };
        newMedias.push(newMedia);
      }
      setSelectedMedias((prevSelectedMedias) => [
        ...prevSelectedMedias,
        ...newMedias,
      ]);
    }
  };

  //
  //
  //
  //
  //

  const selectDocs = async () => {
    if (selectedMedias.length > 0) {
      Toast.show({
        type: "info",
        text2: "You can't select image/video and docs at same time",
      });
      return;
    }
    const maxDocsCount = 4;
    const result = await DocumentPicker.getDocumentAsync({
      multiple: true,
    });

    if (!result.canceled) {
      // const medias = result.assets
      if (result.assets.length > 4) {
        Toast.show({
          type: "error",
          text2: `You can't select more than ${maxDocsCount} documents`,
        });
        return;
      }

      const newDocs: any[] = [];
      for (let i = 0; i < result.assets.length; i++) {
        const doc = result.assets[i];
        const newDoc: Doc = {
          id:
            selectedDocs.length > 0
              ? selectedDocs[selectedDocs.length - 1].id + 1 + i
              : 1 + i,
          url: doc.uri,
          mimeType: doc.mimeType,
          name: doc.name,
        };
        newDocs.push(newDoc);
      }
      setSelectedDocs((prevSelectedDocs) => [...prevSelectedDocs, ...newDocs]);
    }
  };

  //
  //
  //
  //
  //

  const removeMedia = (id: number) => {
    const newMedias = selectedMedias.filter((media) => media.id !== id);
    setSelectedMedias(newMedias);
  };

  useEffect(() => {
    DeviceEventEmitter.addListener("remove-media", removeMedia);
    return () => {
      DeviceEventEmitter.removeAllListeners("remove-media");
    };
  }, []);

  const removeDoc = (id: number) => {
    const newDocs = selectedDocs.filter((doc) => doc.id !== id);
    setSelectedDocs(newDocs);
  };

  const onPressSelectedMedia = (index: number) => {
    navigation.navigate(selectedMediaScreenName, {
      selectedMedias,
      initialMediaIndex: index,
    });
  };

  // const startRecordingVoiceMessage = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //       video: false,
  //     });
  //     stream.getAudioTracks().forEach((track) => {
  //       track.stop();
  //     });
  //   } catch (error) {
  //     toast({
  //       colorScheme: "default",
  //       description:
  //         "Authorise access to the microphone to send voice messages",
  //       duration: 2000,
  //     });
  //     return;
  //   }
  //   start();
  //   setVoiceMessageModeActive(true);
  //   interval.start();
  // };

  // const stopRecordingVoiceMessage = () => {
  //   stop();
  //   recorder?.stream.getAudioTracks().forEach((track) => {
  //     track.stop();
  //   });

  //   recorderedVoiceMessageRef.current?.pause();
  //   interval.stop();
  // };

  // useEffect(() => {
  //   if (recorderedVoiceMessageSeconds >= maxVoiceNoteSeconds) {
  //     stopRecordingVoiceMessage();
  //   }

  //   return () => {
  //     interval.stop;
  //   };
  // }, [recorderedVoiceMessageSeconds]);

  // useEffect(() => {
  //   if (recorderedAudioCurrentTime === recorderedVoiceMessageSeconds) {
  //     // plaiVoiceMessageInterval.stop();
  //     setRecorderedAudioCurrentTime(0);
  //   }
  //   return () => {
  //     // plaiVoiceMessageInterval.stop();
  //   };
  // }, [recorderedAudioCurrentTime]);

  // const cancelRecordingVoiceMessage = () => {
  //   setVoiceMessage({
  //     url: null,
  //     data: null,
  //   });
  //   stopRecordingVoiceMessage();
  //   setRecorderedVoiceMessageSeconds(0);

  //   setRecorderedAudioState(undefined);
  //   setVoiceMessageModeActive(false);
  // };

  const { data, isSuccess, isLoading, isError } = useDiscussion(
    discussionId || "",
    {
      enabled: discussionId !== undefined,
    }
  );

  // const playRecorderedVoiceMessage = () => {
  //   setRecorderedAudioState("playing");
  //   recorderedVoiceMessageRef.current?.play();
  // };

  // const onPlayRecorderedVoiceMessageEnd = () => {
  //   setRecorderedAudioState("end");
  // };

  const discussionType: "group" | "private" =
    isSuccess && data.discussion.name ? "group" : "private";

  const userToShow =
    discussionType === "private"
      ? data?.discussion.members.find(
          (member) => member.userId !== loggedInUserData?.user?.id
        )?.user
      : undefined;

  // useEffect(() => {
  //   if (recorderedVoiceMessageRef.current !== null) {
  //     recorderedVoiceMessageRef.current.addEventListener(
  //       "ended",
  //       onPlayRecorderedVoiceMessageEnd
  //     );
  //   }
  //   return () => {
  //     recorderedVoiceMessageRef.current?.removeEventListener(
  //       "ended",
  //       onPlayRecorderedVoiceMessageEnd
  //     );
  //   };
  // }, [recorderedVoiceMessageRef.current]);

  // const pauseRecorderedVoiceMessage = () => {
  //   // setIsRecorderedVoiceMessagePlaying(false);
  //   setRecorderedAudioState("pause");
  //   // plaiVoiceMessageInterval.stop();
  //   recorderedVoiceMessageRef.current?.pause();
  // };

  //
  //
  //
  //
  //

  const beRemovedFromGroupDiscussionEvent = (eventData: {
    discussion: Discussion;
  }) => {
    navigation.goBack();
    setMessageToShowInsteadOfInput("You have been removed from the group");
    // router.push("/discussions");
  };

  const addUserInMembersOfDiscussionWhoBlockedList = (eventData: {
    blockedUser: User;
    userWhoBlocked: User;
  }) => {
    const blockedUserIsInGroup = data?.discussion.members.find(
      ({ userId }) => userId === eventData.blockedUser.id
    );
    const userWhoBlockedIsInGroup = data?.discussion.members.find(
      ({ userId }) => userId === eventData.userWhoBlocked.id
    );
    if (
      data?.discussion.name === undefined &&
      blockedUserIsInGroup !== undefined &&
      userWhoBlockedIsInGroup !== undefined
    ) {
      queryClient.setQueryData(
        [discussionsQueryKey, data?.discussion.id],
        (qData: any) => {
          return {
            ...qData,
            discussion: {
              ...qData.discussion,
            },
            blocksInRelationToThisDiscussion: [
              ...qData.blocksInRelationToThisDiscussion,
              {
                blocker: eventData.userWhoBlocked,
                blocked: eventData.blockedUser,
                blockerId: eventData.userWhoBlocked.id,
                blockedId: eventData.blockedUser.id,
              },
            ],
          };
        }
      );
    }
  };

  const blockUserErrorEvent = (eventData: { message: string }) => {
    Toast.show({ type: "error", text1: "Error" });
  };

  const removeUserFromMemberOfDiscussionWhoBlockedOfTheList = (eventData: {
    unblockedUser: User;
  }) => {
    if (eventData.unblockedUser.id === userToShow?.id) {
      queryClient.setQueryData(
        [discussionsQueryKey, data?.discussion.id],
        (qData: any) => ({
          ...qData,
          discussion: {
            ...qData.discussion,
          },
          blocksInRelationToThisDiscussion:
            qData.blocksInRelationToThisDiscussion.filter(
              ({ blockerId }: any) => blockerId !== loggedInUserData?.user.id
            ),
        })
      );
    }
  };

  const receiveMessageDeletion = (eventData: {
    discussion: Discussion;
    message: Message;
  }) => {
    if (eventData.message.id === messageToReplyTo?.id) {
      clearMessageToReplyTo();
    }
  };

  const sendMessageSuccess = () => {
    // cancelRecordingVoiceMessage();
    setMessageText("");
    // if (messageText) {
    // textAreaRef.current.value = "";
    // }
    // adjustTextareaHeight();
    setIsMessageSending(false);
  };

  const sendMessageErrorEvent = ({ message }: { message: string }) => {
    setIsMessageSending(false);
    Toast.show({ type: "error", text1: message });
  };

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    // if (isChatBodyScrollLevelAtTheBottom) {
    // }
  };

  useEffect(() => {
    webSocket?.on(
      "be-removed-from-group-discussion",
      beRemovedFromGroupDiscussionEvent
    );

    webSocket?.on(
      "has-blocked-an-user",
      addUserInMembersOfDiscussionWhoBlockedList
    );
    webSocket?.on(
      "blocked-by-an-user",
      addUserInMembersOfDiscussionWhoBlockedList
    );

    webSocket?.on(
      "block-user-success",
      addUserInMembersOfDiscussionWhoBlockedList
    );
    webSocket?.on("block-user-error", blockUserErrorEvent);
    webSocket?.on(
      "unblock-user-success",
      removeUserFromMemberOfDiscussionWhoBlockedOfTheList
    );
    webSocket?.on(
      "has-unblocked-an-user",
      removeUserFromMemberOfDiscussionWhoBlockedOfTheList
    );
    webSocket?.on(
      "unblocked-by-an-user",
      removeUserFromMemberOfDiscussionWhoBlockedOfTheList
    );
    webSocket?.on("send-message-success", sendMessageSuccess);
    webSocket?.on("send-message-error", sendMessageErrorEvent);
    webSocket?.on("receive-message-deletion", receiveMessageDeletion);

    return () => {
      webSocket?.off(
        "be-removed-from-group-discussion",
        beRemovedFromGroupDiscussionEvent
      );
      webSocket?.off(
        "has-blocked-an-user",
        addUserInMembersOfDiscussionWhoBlockedList
      );
      webSocket?.off(
        "blocked-by-an-user",
        addUserInMembersOfDiscussionWhoBlockedList
      );

      webSocket?.off(
        "block-user-success",
        addUserInMembersOfDiscussionWhoBlockedList
      );
      webSocket?.off("block-user-error", blockUserErrorEvent);
      webSocket?.off(
        "unblock-user-success",
        removeUserFromMemberOfDiscussionWhoBlockedOfTheList
      );
      webSocket?.off(
        "has-unblocked-an-user",
        removeUserFromMemberOfDiscussionWhoBlockedOfTheList
      );
      webSocket?.off(
        "unblocked-by-an-user",
        removeUserFromMemberOfDiscussionWhoBlockedOfTheList
      );
      webSocket?.off("send-message-success", sendMessageSuccess);
      webSocket?.off("send-message-error", sendMessageErrorEvent);
      webSocket?.off("receive-message-deletion", receiveMessageDeletion);

      setSelectedMedias([]);
      setSelectedDocs([]);
    };
  }, [webSocket]);

  // const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
  //   setTextInputCursorIndex(e.currentTarget.selectionStart || 0);
  //   adjustTextareaHeight();
  //   if (e.target.value.length > maxChatMessageTextLength) {
  //     e.target.value = e.target.value.slice(0, maxChatMessageTextLength);
  //     toast({
  //       colorScheme: "destructive",
  //       description: `Max length of message is ${maxChatMessageTextLength}`,
  //       duration: 1800,
  //     });
  //   }
  // };

  // const handleDragEnd = (e: DragEndEvent) => {
  //   const { active, over } = e;

  //   if (active.id !== over?.id) {
  //     const activeIndex = selectedMedias.findIndex(
  //       (item) => item.id === active.id
  //     );
  //     const overIndex = selectedMedias.findIndex(
  //       (item) => item.id === over?.id
  //     );
  //     setSelectedMedias(arrayMove(selectedMedias, activeIndex, overIndex));
  //   }
  // };

  if (isLoading) {
    return (
      <View
        style={{
          padding: 14,
        }}
      >
        <Skeleton
          style={{ width: "100%", height: inputHeight, borderRadius: 4 }}
        />
      </View>
    );
  }

  if (isError) {
    return null;
  }

  if (
    isSuccess &&
    data.discussion.name === undefined &&
    data.blocksInRelationToThisDiscussion.length > 0
  ) {
    const loggedInUserBlock = data.blocksInRelationToThisDiscussion.find(
      ({ blockerId }) => blockerId === loggedInUserData?.user.id
    );
    const otherMemberBlock = data.blocksInRelationToThisDiscussion.find(
      ({ blockerId }) => blockerId !== loggedInUserData?.user.id
    );
    return (
      <View style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
        <MyText
          style={{
            fontSize: 12,
            textAlign: "center",
            color: theme.gray500,
          }}
        >
          {loggedInUserBlock ? (
            <>
              You have blocked
              <MyText style={{ fontFamily: "NunitoSans_600SemiBold" }}>
                {" " + loggedInUserBlock.blocked.displayName}
              </MyText>
            </>
          ) : (
            <>
              <MyText style={{ fontFamily: "NunitoSans_600SemiBold" }}>
                {otherMemberBlock?.blocker.displayName + " "}
              </MyText>
              blocked you
            </>
          )}
        </MyText>
      </View>
    );
  }

  if (messageToShowInsteadOfInput) {
    return (
      <View style={{ paddingVertical: 12 }}>
        <MyText
          style={{ fontSize: 12, textAlign: "center", color: theme.gray500 }}
        >
          {messageToShowInsteadOfInput}
        </MyText>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: 14, paddingVertical: 14 }}>
      {messageToReplyTo !== undefined && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
            gap: 8,
            paddingTop: 8,
            paddingBottom: 10,
            borderTopWidth: 1,
            borderColor: theme.gray200,
          }}
        >
          <View style={{ flex: 1 }}>
            <ParentChatMessageItem
              // chatBodySize={chatBodySize}
              message={messageToReplyTo}
              isMessageToReplyTo={true}
            />
          </View>
          <IconButton onPress={clearMessageToReplyTo} variant="ghost">
            <Feather name="x" size={20} />
          </IconButton>
        </View>
      )}
      {selectedDocs.length > 0 && (
        <View
          style={{
            borderTopWidth: 0.4,
            borderTopColor: theme.gray300,
          }}
        >
          <MyText style={{ marginTop: 6, paddingLeft: 4 }}>
            {selectedDocs.length} documents selected
          </MyText>
          <ScrollView
            horizontal
            contentContainerStyle={{
              gap: 10,
              paddingBottom: 14,
              paddingTop: 8,
            }}
            overScrollMode="never"
          >
            {selectedDocs.map((docItem, index) => (
              <SelectedDocItem
                key={docItem.id}
                // index={index}
                doc={docItem}
                remove={() => removeDoc(docItem.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {selectedMedias.length > 0 && (
        <View
          style={{
            borderTopWidth: 0.5,
            borderTopColor: theme.gray300,
          }}
        >
          <ScrollView
            horizontal
            contentContainerStyle={{
              gap: 10,
              paddingBottom: 14,
              paddingTop: 10,
              // paddingHorizontal: 20,
            }}
            overScrollMode="never"
          >
            {selectedMedias.map((mediaItem, index) => (
              <SelectedMediaItem
                key={mediaItem.id}
                index={index}
                media={mediaItem}
                onPress={() => onPressSelectedMedia(index)}
                remove={() => removeMedia(mediaItem.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}
      {voiceMessageModeActive ? (
        <View
          style={{
            height: inputHeight,
            borderRadius: 6,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.gray100,
          }}
        >
          <IconButton
            style={{ marginRight: 6 }}
            onPress={desactivateVoiceMessageMode}
            variant="ghost"
          >
            <Feather name="x" size={22} />
          </IconButton>
          <IconButton variant="ghost">
            <Ionicons name="stop" size={22} weight="fill" />
          </IconButton>
          <View
            style={{
              height: inputHeight * 0.6,
              borderRadius: 60,
              backgroundColor: theme.green500,
              flex: 1,
              marginLeft: 12,
              marginRight: 12,
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingHorizontal: 10,
            }}
          >
            <MyText style={{ fontSize: 11, color: theme.white }}>00:25</MyText>
          </View>
          <IconButton style={{ marginRight: 4 }} variant="ghost">
            <Octicons name="paper-airplane" size={20} />
          </IconButton>
        </View>
      ) : (
        <View
          style={{
            // minHeight: height,
            // // height: "auto",
            // maxHeight: height * 3,
            height: inputHeight,
            backgroundColor: theme.gray200,
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <DropdownMenu
            anchor={
              <IconButton variant="ghost">
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={theme.gray500}
                  weight="bold"
                />
              </IconButton>
            }
          >
            <DropdownMenuItem
              onPress={() => selectPhotosOrVideos({ from: "camera" })}
              title="Camera"
              leftDecorator={
                <MaterialCommunityIcons name="camera-outline" size={20} />
              }
            />
            <DropdownMenuItem
              onPress={() => selectPhotosOrVideos({ from: "galery" })}
              title="Photos or videos"
              leftDecorator={
                <Ionicons
                  name="image-outline"
                  size={18}
                  color={theme.gray500}
                />
              }
            />
            <DropdownMenuItem
              onPress={selectDocs}
              title="Documents"
              leftDecorator={<Ionicons name="document-outline" />}
            />
          </DropdownMenu>
          <View
            style={{
              position: "relative",
              paddingLeft: 10,
              flex: 1,
              height: "100%",
              // height,
            }}
          >
            {isMessageSending ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  height: "100%",
                }}
              >
                <ActivityIndicator size={18} color={theme.gray900} />
                <MyText>Message is sending</MyText>
              </View>
            ) : (
              <TextInput
                style={{
                  height: inputHeight,
                  flex: 1,
                  color: theme.gray800,
                  fontFamily: "NunitoSans_400Regular",
                  // backgroundColor: "blue",
                  paddingVertical: 4,
                }}
                multiline={true}
                maxLength={maxChatMessageTextLength}
                value={messageText}
                placeholder="Write your message here"
                onChangeText={handleMessageTextChange}
                onFocus={handleFocus}
                // enterKeyHint={undefined}
                returnKeyType="next"
                placeholderTextColor={theme.gray600}
                onContentSizeChange={(event) => {
                  const h = event.nativeEvent.contentSize.height;
                  setInputHeight(h > 100 ? 100 : h > 46 ? h : 46);
                }}
              />
            )}
          </View>

          {/* {messageText.length > 0 ||
          selectedMedias.length > 0 ||
          selectedDocs.length > 0 ? (
            <IconButton
              style={{ marginLeft: 4 }}
              variant="ghost"
              onPress={sendMessage}
            >
              <PaperPlaneRight size={22} weight="bold" />
            </IconButton>
          ) : (
            <IconButton
              style={{ marginLeft: 4 }}
              onPress={activateVoiceMessageMode}
              variant="ghost"
            >
            <MaterialCommunityIcons
              name="microphone-outline"
              color={theme.green600}
              size={22}
            />
            </IconButton>
          )} */}
          <IconButton
            style={{ marginLeft: 4 }}
            variant="ghost"
            onPress={sendMessage}
          >
            <Octicons name="paper-airplane" size={20} />
          </IconButton>
        </View>
      )}
    </View>
  );
};

export default ChatFooter;
