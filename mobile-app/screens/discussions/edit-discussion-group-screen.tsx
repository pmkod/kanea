import { webSocketAtom } from "@/atoms/web-socket-atom";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import { Discussion } from "@/types/discussion";
import { useNetInfo } from "@react-native-community/netinfo";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { editDiscussionGroupSceenName } from "@/constants/screens-names-constants";
import { ScrollView, View } from "react-native";
import { DiscussionItemAvatar } from "@/components/items/discussion-item";
import { Button } from "@/components/core/button";
import { FormItem } from "@/components/core/form";
import MyText from "@/components/core/my-text";
import Space from "@/components/core/space";
import { Input } from "@/components/core/input";
import { useDiscussion } from "@/hooks/use-discussion";
import { buildDiscussionFileUrl } from "@/utils/discussion-utils";
import { discussionNameSchema } from "@/validation-schema/discussion-schema";
import { ZodError } from "zod";
import { Buffer } from "buffer";

export const EditDiscussionGroupSceen = () => {
  const route = useRoute();
  const { discussionId } = route.params as {
    discussionId: string;
  };

  const { data: discussionData } = useDiscussion(discussionId);
  // const { toast } = useToast();
  const [discussionGroup, setDiscussionGroup] = useState<{
    name?: string;
    picture?: {
      file: Buffer;
      url: string;
    };
  }>({
    name: undefined,
    picture: undefined,
  });
  const network = useNetInfo();

  const [isLoading, setIsLoading] = useState(false);
  const webSocket = useAtomValue(webSocketAtom);
  const navigation = useNavigation();

  const handleNameChange = (text: string) => {
    setDiscussionGroup((discussionGroup) => ({
      ...discussionGroup,
      name: text,
    }));
  };

  const selectGroupPicture = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
      allowsEditing: true,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
    };

    let result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) {
      const media = result.assets[0];
      const mediaFetchResponse = await fetch(media.uri);
      const mediaBufferArr = await mediaFetchResponse.arrayBuffer();
      const mediaBuffer = Buffer.from(mediaBufferArr);
      setDiscussionGroup((prevNewGroupDiscussion) => ({
        ...prevNewGroupDiscussion,
        picture: { url: media.uri, file: mediaBuffer },
      }));
    }
  };

  const editDiscussionGroup = async () => {
    if (!network.isConnected) {
      Toast.show({ type: "error", text2: "You are offline" });
      return;
    }
    setIsLoading(true);

    try {
      const nameToSend = discussionNameSchema.parse(discussionGroup.name);
      // navigation.navigate(newDiscussionGroupStepTwoScreenName);

      const dataToSend = {
        name: nameToSend,
        discussionId,
      } as any;

      if (discussionGroup.picture !== undefined) {
        dataToSend.picture = { file: discussionGroup.picture?.file };
      }
      webSocket?.emit("edit-group-discussion", dataToSend);
    } catch (error) {
      if (error instanceof ZodError) {
        Toast.show({ type: "error", text2: error.message });
      }
    }
  };

  const editGroupDiscussionSuccessEvent = (eventData: {
    discussion: Discussion;
  }) => {
    // modal.resolve();
    setIsLoading(false);
    Toast.show({ type: "success", text2: "Group discussion edited" });
    // modal.hide();
    navigation.goBack();
  };

  const editGroupDiscussionErrorEvent = (eventData: { message: string }) => {

    Toast.show({ type: "error", text2: eventData.message });
    setIsLoading(false);
    // modal.hide();
    navigation.goBack();
  };

  const discussionPictureUrl =
    discussionGroup.picture?.url ||
    (discussionData !== undefined &&
    discussionData.discussion.picture !== undefined
      ? buildDiscussionFileUrl({
          fileName: discussionData.discussion.picture.lowQualityFileName,
          discussionId,
        })
      : undefined);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <Button
            isLoading={isLoading}
            size="md"
            text="Save"
            onPress={editDiscussionGroup}
          />
        );
      },
    });
  }, [navigation, editDiscussionGroup]);

  useListenWebsocketEvent({
    name: "edit-group-discussion-success",
    handler: editGroupDiscussionSuccessEvent,
  });
  useListenWebsocketEvent({
    name: "edit-group-discussion-error",
    handler: editGroupDiscussionErrorEvent,
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{
          paddingHorizontal: 24,
          paddingTop: 10,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingTop: 6,
            gap: 14,
          }}
        >
          <DiscussionItemAvatar
            chatType="group"
            width={68}
            discussionPictureUrl={discussionPictureUrl}
          />
          <Button
            size="sm"
            variant="outline"
            text="Choose group picture"
            onPress={selectGroupPicture}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <FormItem>
            <MyText>Name</MyText>
            <Space height={8} />
            <Input
              placeholder="Choose a name for your group"
              onChange={handleNameChange}
              value={discussionGroup.name}
              defaultValue={discussionData?.discussion.name}
            />
          </FormItem>
        </View>
      </ScrollView>
    </View>
  );
};

export const editDiscussionGroupSceen = {
  name: editDiscussionGroupSceenName,
  component: EditDiscussionGroupSceen,
  options: {
    title: "Edit group",
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
