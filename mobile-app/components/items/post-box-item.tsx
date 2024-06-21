import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  View,
} from "react-native";
import { Post } from "../../types/post";
import { useNavigation } from "@react-navigation/native";
import { buildPublicFileUrl } from "@/utils/url-utils";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { Skeleton } from "../core/skeleton";
import { useTheme } from "@/hooks/use-theme";
import { postScreenName } from "@/constants/screens-names-constants";
import { AVPlaybackStatusSuccess, Video } from "expo-av";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { themes } from "@/styles/themes";

export const getBoxItemWidth = () => {
  const screenWidth = Dimensions.get("screen").width;
  return screenWidth / 3;
};

interface PostBoxItemProps {
  post: Post;
  showTopRightIndicator?: boolean;
  // showStat?: boolean;
}

export const PostBoxItem = ({
  post,
  // showStat,
  showTopRightIndicator = true,
}: PostBoxItemProps) => {
  const { theme } = useTheme();

  const navigation = useNavigation();

  const goToPostScreen = () => {
    navigation.navigate(postScreenName, {
      postId: post.id,
    });
  };

  if (!post || !post.medias) {
    return null;
  }

  return (
    <>
      <Pressable
        onPress={goToPostScreen}
        style={{
          width: getBoxItemWidth(),
          // height: 50,
          aspectRatio: "1/1",
          // minHeight: 200,
          // height: 1800,
          backgroundColor: theme.gray300,
        }}
      >
        {({ pressed }) => (
          <>
            {showTopRightIndicator === true && (
              <View
                style={{
                  position: "absolute",
                  zIndex: 40,
                  top: 6,
                  right: 6,

                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 5,
                }}
              >
                {post.medias[0].mimetype.startsWith("video") ||
                  (post.medias.length > 1 && (
                    <View
                      style={{
                        position: "absolute",
                        width: 20,
                        height: 20,
                        backgroundColor: "#1d2424",
                        opacity: 0.05,
                        top: 0,
                        right: 0,

                        borderRadius: 2,
                        // elevation: 10,
                      }}
                    ></View>
                  ))}

                {post.medias[0].mimetype.startsWith("video") ? (
                  <Octicons name="video" size={20} color={themes.light.white} />
                ) : post.medias.length > 1 ? (
                  <MaterialCommunityIcons
                    name="checkbox-multiple-blank-outline"
                    size={20}
                    color="#ffffff"
                  />
                ) : null}
              </View>
            )}
            {acceptedImageMimetypes.includes(post.medias[0].mimetype) ? (
              <Image
                style={{
                  aspectRatio: "1/1",
                }}
                source={{
                  uri: buildPublicFileUrl({
                    fileName: post.medias[0].lowQualityFileName || "",
                  }),
                }}
              />
            ) : acceptedVideoMimetypes.includes(post.medias[0].mimetype) ? (
              <VideoItem
                src={buildPublicFileUrl({
                  fileName: post.medias[0].bestQualityFileName || "",
                })}
              />
            ) : null}

            {pressed && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "black",
                  opacity: 0.5,
                }}
              ></View>
            )}
          </>
        )}
      </Pressable>
    </>
  );
};

const VideoItem = ({ src }: { src: string }) => {
  const [status, setStatus] = useState<AVPlaybackStatusSuccess | undefined>(
    undefined
  );
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <Video
        style={{ flex: 1 }}
        shouldPlay={false}
        source={{
          uri: src,
        }}
        videoStyle={{ backgroundColor: themes.light.gray950 }}
        onPlaybackStatusUpdate={(status: any) => setStatus(status)}
      />
      {!status && (
        <View
          style={{
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <ActivityIndicator size="small" color={themes.light.white} />
        </View>
      )}
    </View>
  );
};

//
//
//

export const PostBoxItemLoader = () => {
  return (
    <Skeleton
      style={{
        // flex: 1,
        width: getBoxItemWidth(),
        // height: 50,
        aspectRatio: "1/1",
      }}
    />
  );
};
