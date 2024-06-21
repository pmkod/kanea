import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { themes } from "@/styles/themes";
import { Media } from "@/types/media";
import { Image, Pressable, View } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Feather, Ionicons } from "@expo/vector-icons";

interface SelectedMediaItemProps {
  media: Media;
  remove: () => void;
  index: number;
  width?: number;
  onPress: () => void;
}

export const SelectedMediaItem = ({
  media,
  remove,
  width = 84,
  onPress,
}: SelectedMediaItemProps) => {
  const isImage = acceptedImageMimetypes.includes(media.mimeType || "");
  const isVideo = acceptedVideoMimetypes.includes(media.mimeType || "");

  const openMediaDisplayModal = () => {
    onPress();
  };

  const onRemove = () => {
    remove();
  };

  return (
    <>
      <View
        style={{
          position: "relative",
        }}
      >
        <Pressable
          style={{
            position: "absolute",
            borderRadius: 300,
            backgroundColor: themes.light.gray900,
            padding: 5,
            zIndex: 30,

            right: 4,
            top: 4,
          }}
          onPress={onRemove}
        >
          <Feather name="x" size={12} color={themes.light.white} />
        </Pressable>
        <Pressable
          onPress={openMediaDisplayModal}
          style={{
            borderRadius: 6,
            overflow: "hidden",
            aspectRatio: "1/1",
            position: "relative",
            // flex: 1,
            // pointerEvents: hasFullScreenMode ? "auto" : "none",
            width,
          }}
        >
          {({ pressed }) => (
            <View
              style={{
                width: "100%",
                height: "100%",
                opacity: pressed ? 0.5 : 1,
                backgroundColor: themes.light.white,
              }}
            >
              {isImage ? (
                <Image
                  src={media.url}
                  style={{
                    // position: "relative",
                    flex: 1,
                    objectFit: "cover",
                  }}
                />
              ) : isVideo ? (
                <>
                  <Video
                    source={{
                      uri: media.url,
                    }}
                    style={{ flex: 1 }}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls={false}
                    shouldPlay={false}

                    // onPlaybackStatusUpdate={status => setStatus(() => status)}
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
                    <View
                      style={{
                        backgroundColor: themes.light.gray950,
                        borderRadius: 300,
                        padding: 6,
                        opacity: 0.7,
                      }}
                    >
                      <Ionicons
                        name="play"
                        size={12}
                        weight="fill"
                        color={themes.light.white}
                      />
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          )}
        </Pressable>
      </View>
    </>
  );
};
