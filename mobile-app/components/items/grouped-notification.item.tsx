import {
  postScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useTheme } from "@/hooks/use-theme";
import { Notification } from "@/types/notification";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Pressable, View } from "react-native";
import Avatar from "../core/avatar";
import { buildPublicFileUrl } from "@/utils/url-utils";
import MyText from "../core/my-text";

interface GroupedNotificationItemProps {
  elements: Notification[];
}

export const GroupedNotificationItem = ({
  elements,
}: GroupedNotificationItemProps) => {
  const firstNotificationInGroup = elements[0];
  const { data } = useLoggedInUser({ enabled: false });
  const { theme } = useTheme();
  const navigation = useNavigation();

  const handlePress = () => {
    if (firstNotificationInGroup.followId) {
      // router.push(`/users/${firstNotificationInGroup.initiator.userName}`);
      navigation.navigate(userScreenName, {
        userName: firstNotificationInGroup.initiator.userName,
      });
    } else if (firstNotificationInGroup.postLikeId) {
      navigation.navigate(postScreenName, {
        postId: firstNotificationInGroup.postLike?.postId,
      });
      // router.push(`/posts/${}`);
    } else if (firstNotificationInGroup.parentPostCommentId) {
      // router.push(`/posts/${firstNotificationInGroup.postComment?.postId}`);

      navigation.navigate(postScreenName, {
        postId: firstNotificationInGroup.postComment?.postId,
      });
    } else if (firstNotificationInGroup.postCommentId) {
      navigation.navigate(postScreenName, {
        postId: firstNotificationInGroup.postComment?.postId,
      });
      // router.push(`/posts/${firstNotificationInGroup.postComment?.postId}`);
    } else if (firstNotificationInGroup.postCommentLikeId) {
      // router.push(`/posts/${firstNotificationInGroup.postCommentLike.}`)
    }
  };
  const goToNotificationInitiatorProfile = () => {
    navigation.navigate(userScreenName, {
      userName: firstNotificationInGroup.initiator.userName,
    });
  };
  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <View
          style={{
            // flexDirection: "row",

            paddingHorizontal: 20,
            paddingVertical: 12,
          }}
        >
          <View>
            <View style={{ position: "relative" }}>
              <View
                style={{
                  position: "absolute",
                  left: 24,
                  top: 0,
                  width: 42,
                  aspectRatio: "1/1",
                  borderRadius: 300,
                  backgroundColor: theme.gray500,
                  justifyContent: "center",
                  alignItems: "flex-end",
                  paddingRight: 4,
                }}
              >
                <MyText style={{ color: theme.white, fontSize: 11 }}>
                  +{elements.length - 1 > 999 ? "999" : elements.length - 1}
                </MyText>
              </View>
              <Pressable onPress={goToNotificationInitiatorProfile}>
                <Avatar
                  src={
                    firstNotificationInGroup.initiator.profilePicture
                      ? buildPublicFileUrl({
                          fileName:
                            firstNotificationInGroup.initiator.profilePicture
                              .lowQualityFileName,
                        })
                      : undefined
                  }
                  name={firstNotificationInGroup.initiator.displayName}
                  width={42}
                />
              </Pressable>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
              }}
            >
              <MyText style={{ color: theme.gray500 }}>
                <MyText
                  onPress={goToNotificationInitiatorProfile}
                  style={{ color: theme.gray500 }}
                >
                  {firstNotificationInGroup.initiator.displayName + " "}
                </MyText>
                and {elements.length - 1} others
                {firstNotificationInGroup.followId ? (
                  " started following you"
                ) : firstNotificationInGroup.postLikeId ? (
                  " liked your post"
                ) : firstNotificationInGroup.parentPostCommentId &&
                  firstNotificationInGroup.parentPostComment?.commenterId !==
                    data?.user.id ? (
                  " replied to a comment on your post"
                ) : firstNotificationInGroup.parentPostCommentId &&
                  firstNotificationInGroup.parentPostComment?.commenterId ===
                    data?.user.id ? (
                  " replied to your comment"
                ) : firstNotificationInGroup.postCommentId ? (
                  " commented your post"
                ) : firstNotificationInGroup.postCommentLikeId ? (
                  <>
                    {" "}
                    liked your comment
                    {firstNotificationInGroup.postComment?.text}
                  </>
                ) : null}
              </MyText>

              <View style={{ marginLeft: 10 }}>
                {firstNotificationInGroup.followId ? (
                  <MaterialCommunityIcons
                    name="account-plus"
                    size={26}
                    color={theme.blue}
                    style={{ marginRight: 2 }}
                  />
                ) : firstNotificationInGroup.postLikeId ||
                  firstNotificationInGroup.postCommentLikeId ? (
                  <Ionicons name="heart" size={20} color={theme.heart} />
                ) : firstNotificationInGroup.postCommentId ? (
                  // <RiChat1Fill />
                  <Ionicons
                    name="chatbubble"
                    size={20}
                    weight="fill"
                    color={theme.blue}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};
