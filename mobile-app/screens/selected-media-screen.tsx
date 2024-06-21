import { HeaderCloseButton } from "@/components/core/header";
import { Button } from "@/components/core/button";
import Space from "@/components/core/space";
import { SelectedMediaItem } from "@/components/items/selected-media-item";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { selectedMediaScreenName } from "@/constants/screens-names-constants";
import { useTheme } from "@/hooks/use-theme";
import { Media } from "@/types/media";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import PagerView, {
  PagerViewOnPageSelectedEvent,
} from "react-native-pager-view";
import { themes } from "@/styles/themes";
import { AVPlaybackStatusSuccess, ResizeMode, Video } from "expo-av";
import Slider from "@react-native-community/slider";
import MyText from "@/components/core/my-text";
import { formatMilisecondsToMinutes } from "@/utils/datetime-utils";
import { Ionicons } from "@expo/vector-icons";

export const SelectedMediaScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  // status['']
  const {
    selectedMedias,
    initialMediaIndex,
  }: // removeMedia,
  {
    selectedMedias: Media[];
    initialMediaIndex: number;
    // removeMedia: Function;
  } = route.params as any;

  const [localSelectedMedias, setLocalSelectedMedias] =
    useState(selectedMedias);

  const [selectedMediaIndex, setSelectedMediaIndex] =
    useState(initialMediaIndex);

  const ref: any = useRef(PagerView);

  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    setSelectedMediaIndex(e.nativeEvent.position);
    // e.nativeEvent
  };

  const handleRemoveMedia = (mediaId: number) => {
    if (selectedMedias.length === 1) {
      // removeMedia(mediaId);
      DeviceEventEmitter.emit("remove-media", mediaId);

      navigation.goBack();
    } else {
      const removedMediaIndex = localSelectedMedias.findIndex(
        (m) => m.id === mediaId
      );
      const newSelectedMediaIndex =
        removedMediaIndex > 0 ? removedMediaIndex - 1 : 0;
      setSelectedMediaIndex(newSelectedMediaIndex);
      // removeMedia(mediaId);
      DeviceEventEmitter.emit("remove-media", mediaId);
    }
    const newMedias = localSelectedMedias.filter(
      (media) => media.id !== mediaId
    );
    setLocalSelectedMedias(newMedias);
  };

  const selectedMedia = localSelectedMedias[selectedMediaIndex];

  const goToPreviousScreen = () => {
    navigation.goBack();
  };

  const onPressSelectedItem = (index: number) => {
    ref.current.setPage(index);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 14,
          paddingRight: 16,
          height: 60,
          position: "absolute",
          width: "100%",
          zIndex: 200,
          // backgroundColor: "blue",
        }}
      >
        <HeaderCloseButton />
        <Button onPress={goToPreviousScreen} variant="fill" text="save" />
      </View>
      <PagerView
        ref={ref}
        collapsable={false}
        style={{
          flex: 1,
        }}
        initialPage={initialMediaIndex}
        overScrollMode="never"
        onPageSelected={handlePageSelected}
      >
        {localSelectedMedias.map((media, index) => (
          <View key={index} style={{ flex: 1 }}>
            {media.mimeType &&
              (acceptedImageMimetypes.includes(media.mimeType) ? (
                <Image
                  source={{
                    uri: media.url,
                  }}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : acceptedVideoMimetypes.includes(media.mimeType) ? (
                <>
                  <VideoItem media={media} selectedMedia={selectedMedia} />
                </>
              ) : null)}
          </View>
        ))}
      </PagerView>
      <View
        style={{
          position: "absolute",
          bottom: 20,
          paddingLeft: 20,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {localSelectedMedias.length > 0 && (
          <ScrollView
            horizontal
            contentContainerStyle={{
              paddingVertical: 12,
              gap: 6,
            }}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
          >
            {localSelectedMedias.map((mediaItem, index) => (
              <Pressable
                key={mediaItem.id}
                // onPress={() => setSelectedMediaIndex(index)}
                style={{
                  opacity: index === selectedMediaIndex ? 1 : 0.4,
                  position: "relative",
                }}
              >
                <SelectedMediaItem
                  index={index}
                  media={mediaItem}
                  remove={() => handleRemoveMedia(mediaItem.id)}
                  onPress={() => onPressSelectedItem(index)}
                  width={74}
                />
              </Pressable>
            ))}
            <Space width={20} />
          </ScrollView>
        )}
      </View>
    </View>
  );
};

//
//
//
//
//

const VideoItem = ({
  media,
  selectedMedia,
}: {
  media: Media;
  selectedMedia: Media;
}) => {
  const videoRef = useRef<Video>(null);

  const [status, setStatus] = useState<AVPlaybackStatusSuccess | undefined>(
    undefined
  );

  const { theme } = useTheme();

  const playOrStopVideo = async () => {
    if (status?.isBuffering) {
      return;
    }
    if (status?.isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const getSliderValue = () => {
    if (status?.positionMillis && status.durationMillis) {
      return status.positionMillis / status.durationMillis;
    }
    return 0;
  };

  const handleSliderValueChange = async (value: number) => {
    if (status?.durationMillis) {
      if (status.isPlaying) {
        await videoRef.current?.pauseAsync();
      }
      await videoRef.current?.setPositionAsync(value * status.durationMillis);
    }
  };

  const handlePlayBackStatusUpdate = (status: any) => {
    setStatus(status);
  };

  useEffect(() => {
    return () => {
      videoRef.current?.stopAsync();
    };
  }, []);

  useEffect(() => {
    if (status?.positionMillis === status?.durationMillis) {
      videoRef.current?.stopAsync();
      // videoRef.current?.setPositionAsync(0);
    }
  }, [status]);

  // const [isPlaying, setIsPlaying] = useDebouncedState(status?.isPlaying, 200);

  useEffect(() => {
    if (selectedMedia.id !== media.id) {
      videoRef.current?.stopAsync();
    }
  }, [selectedMedia, media]);
  return (
    <>
      <View
        style={{
          position: "absolute",
          top: 70,
          // backgroundColor: "blue",
          height: 50,
          width: "100%",
          zIndex: 50,
          // flexDirection: "row",
          // alignContent: "center",
        }}
      >
        <Slider
          style={{ flex: 1 }}
          maximumTrackTintColor="#FFFFFF"
          minimumTrackTintColor={theme.blue}
          thumbTintColor={themes.light.white}
          // value={}
          value={getSliderValue()}
          minimumValue={0}
          maximumValue={1}
          onValueChange={handleSliderValueChange}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            paddingHorizontal: 14,
          }}
        >
          <View
            style={{
              backgroundColor: themes.light.gray950,
              opacity: 0.65,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 50,
            }}
          >
            <MyText
              style={{
                fontSize: 12,
                color: themes.light.white,
                fontFamily: "NunitoSans_600SemiBold",
              }}
            >
              {status ? formatMilisecondsToMinutes(status.positionMillis) : "-"}{" "}
              /
              {" " +
                (status?.durationMillis
                  ? formatMilisecondsToMinutes(status.durationMillis)
                  : "-")}
            </MyText>
          </View>
        </View>
      </View>

      <Pressable style={{ flex: 1 }} onPress={playOrStopVideo}>
        <Video
          ref={videoRef}
          style={{ flex: 1 }}
          source={{
            uri: media.url,
          }}
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={handlePlayBackStatusUpdate}

          // audioPan={}
          // isLooping
        />

        <View
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {!status?.isPlaying && (
            <View
              style={{
                backgroundColor: themes.light.gray950,
                borderRadius: 300,
                padding: 16,
                opacity: 0.7,
              }}
            >
              {!status ? (
                <ActivityIndicator size={26} color={themes.light.white} />
              ) : (
                <Ionicons
                  name="play"
                  size={26}
                  weight="fill"
                  color={themes.light.white}
                />
              )}
            </View>
          )}
        </View>
      </Pressable>
    </>
  );
};

export const selectedMediaScreen = {
  name: selectedMediaScreenName,
  component: SelectedMediaScreen,
  options: {
    title: "",
    animation: "ios",
    headerShown: false,
  } as NativeStackNavigationOptions,
};
