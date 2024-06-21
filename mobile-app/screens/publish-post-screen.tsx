import { webSocketAtom } from "@/atoms/web-socket-atom";
import { Buffer } from "buffer";
import { IconButton } from "@/components/core/icon-button";
import { Post } from "@/types/post";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useAtomValue } from "jotai";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Button } from "@/components/core/button";
import { Media } from "@/types/media";
import { SelectedMediaItem } from "@/components/items/selected-media-item";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { useTheme } from "@/hooks/use-theme";
import Space from "@/components/core/space";
import Avatar from "@/components/core/avatar";
import {
  publishPostScreenName,
  selectedMediaScreenName,
} from "@/constants/screens-names-constants";
import { HeaderCloseButton } from "@/components/core/header";
import Toast from "react-native-toast-message";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import { Feather, Ionicons } from "@expo/vector-icons";

const PublishPostScreen = () => {
  const [text, setText] = useState("");
  const webSocket = useAtomValue(webSocketAtom);
  const [isPublishing, setIsPublishing] = useState(false);
  const navigation = useNavigation();

  const { data: loggedInUserData } = useLoggedInUser({ enabled: false });

  const { theme } = useTheme();

  const maxPostTextLength = 340;

  const [selectedMedias, setSelectedMedias] = useState<Media[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);

  const isPublishButtonDisabled = selectedMedias.length === 0;

  const queryClient = useQueryClient();

  const selectPhotoOrVideo = async ({
    from,
  }: {
    from: "galery" | "camera";
  }) => {
    const maxMediasCount = 4;

    if (selectedMedias.length >= maxMediasCount) {
      // ! Notify he can't select more the four images
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.All,

      aspect: [1, 1],
      quality: 1,
      selectionLimit: maxMediasCount - selectedMedias.length,
      allowsMultipleSelection: true,
      videoMaxDuration: 10 * 60,
      // cameraType: ImagePicker.CameraType.front,
      // allowsEditing: true,
      // preferredAssetRepresentationMode: "",
      // allowsMultipleSelection: true,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.AUTOMATIC,
    };

    let result =
      from === "galery"
        ? await ImagePicker.launchImageLibraryAsync(options)
        : await ImagePicker.launchCameraAsync(options);

    if (!result.canceled) {
      // const medias = result.assets
      setIsMediaLoading(true);

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
      setIsMediaLoading(false);
    }
  };

  const publishPost = async () => {
    setIsPublishing(true);
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
    webSocket?.emit("publish-post", {
      text: text,
      medias,
    });
  };

  const onPressSelectedMedia = (index: number) => {
    navigation.navigate(selectedMediaScreenName, {
      selectedMedias,
      initialMediaIndex: index,
      // removeMedia,
    });
  };

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

  const publishPostSuccessEvent = (eventData: { post: Post }) => {
    const followingTimelineQueryState = queryClient.getQueryState([
      followingTimelineQueryKey,
    ]);

    if (followingTimelineQueryState?.status === "success") {
      queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any, pageIndex: number) => ({
            ...pageData,
            posts:
              pageIndex === 0
                ? [eventData.post, ...pageData.posts]
                : pageData.posts,
          })),
        };
      });
    }

    setText("");
    setSelectedMedias([]);
    setIsPublishing(false);
    navigation.goBack();
    Toast.show({ type: "success", text1: "Post published" });
  };

  const publishPostErrorEvent = ({
    errors,
  }: {
    errors: { message: string }[];
  }) => {
    setIsPublishing(false);
    Toast.show({ type: "error", text1: errors[0].message });
  };

  useListenWebsocketEvent({
    name: "publish-post-success",
    handler: publishPostSuccessEvent,
  });
  useListenWebsocketEvent({
    name: "publish-post-error",
    handler: publishPostErrorEvent,
  });

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingRight: 18,
          paddingLeft: 14,
          height: 60,
          // backgroundColor: "blue",
        }}
      >
        <HeaderCloseButton />
        <Button
          text="Publish"
          onPress={publishPost}
          isLoading={isPublishing}
          disabled={isPublishButtonDisabled}
          size="md"
        />
      </View>

      <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
        <Space height={10} />

        <View
          style={{
            paddingHorizontal: 20,
            flex: 1,
          }}
        >
          {loggedInUserData && (
            <Avatar
              src={
                loggedInUserData?.user.profilePicture
                  ? buildPublicFileUrl({
                      fileName:
                        loggedInUserData.user.profilePicture.lowQualityFileName,
                    })
                  : undefined
              }
              name={loggedInUserData.user.displayName}
              width={40}
            />
          )}
          <Space height={6} />

          <TextInput
            placeholder="What's new ?"
            multiline={true}
            numberOfLines={20}
            value={text}
            onChangeText={setText}
            autoFocus={true}
            placeholderTextColor={theme.gray500}
            maxLength={maxPostTextLength}
            style={{
              // paddingHorizontal: 16,
              color: theme.gray800,
              verticalAlign: "top",
              paddingTop: 10,
              fontSize: 18,
              fontFamily: "NunitoSans_400Regular",
            }}
          />
        </View>
      </ScrollView>
      <View
        style={{
          borderTopWidth: 0.5,
          borderTopColor: theme.gray300,
        }}
      >
        {selectedMedias.length > 0 && (
          <ScrollView
            horizontal
            contentContainerStyle={{
              gap: 10,
              paddingBottom: 6,
              paddingTop: 16,
              paddingHorizontal: 20,
            }}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
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
            {isMediaLoading && (
              <ActivityIndicator
                size="large"
                color={theme.gray950}
                style={{ marginLeft: 10 }}
              />
            )}
          </ScrollView>
        )}
      </View>

      <View
        style={{
          height: 60,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: 20,
        }}
      >
        <IconButton
          variant="outline"
          onPress={() => selectPhotoOrVideo({ from: "camera" })}
        >
          <Feather name="camera" size={18} color={theme.gray400} />
        </IconButton>
        <Button
          variant="outline"
          text="Add photos / videos"
          onPress={() => selectPhotoOrVideo({ from: "galery" })}
          leftDecorator={
            <Ionicons name="image-outline" size={18} color={theme.gray500} />
          }
        />
      </View>
    </View>
  );
};

export const publishPostScreen = {
  name: publishPostScreenName,
  component: PublishPostScreen,
  options: {
    // headerRight: PublishPostScreenHeaderRight,
    // header: () => null,
    title: "",
    headerShown: false,
    animation: "fade_from_bottom",
  } as NativeStackNavigationOptions,
};
