import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import MyText from "../core/my-text";
import { Notification } from "@/types/notification";
import { useTheme } from "@/hooks/use-theme";
import { Skeleton } from "../core/skeleton";
import Space from "../core/space";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { useNavigation } from "@react-navigation/native";
import {
  postScreenName,
  userScreenName,
} from "@/constants/screens-names-constants";
import Avatar from "../core/avatar";
import { buildPublicFileUrl } from "@/utils/url-utils";
import { durationFromNow } from "@/utils/datetime-utils";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationDate = ({ date }: { date: Date }) => {
  const { theme } = useTheme();
  return (
    <MyText style={{ fontSize: 12, color: theme.gray400 }}>
      {durationFromNow(date)}
    </MyText>
  );
};

const NotificationText = ({
  text,
  notification,
}: {
  text: string;
  notification: Notification;
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const goToNotificationInitiatorProfile = () => {
    navigation.navigate(userScreenName, {
      userName: notification.initiator.userName,
    });
  };
  return (
    <MyText style={{ fontSize: 16, color: theme.gray500 }}>
      <MyText
        onPress={goToNotificationInitiatorProfile}
        style={{
          color: theme.gray900,
          fontSize: 16,
          // fontFamily: "NunitoSans_600SemiBold",
        }}
      >
        {notification.initiator?.displayName + " "}
      </MyText>
      {text}
    </MyText>
  );
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const handlePress = () => {
    if (notification.followId) {
      // router.push(`/users/${notification.initiator.userName}`);
      navigation.navigate(userScreenName, {
        userName: notification.initiator.userName,
      });
    } else if (notification.postLikeId) {
      // router.push(`/posts/${}`);
      navigation.navigate(postScreenName, {
        postId: notification.postLike?.postId,
      });
    } else if (notification.parentPostCommentId) {
      navigation.navigate(postScreenName, {
        postId: notification.postComment?.postId,
      });
      // router.push(`/posts/${notification.postComment?.postId}`);
    } else if (notification.postCommentId) {
      // router.push(`/posts/${notification.postComment?.postId}`);

      navigation.navigate(postScreenName, {
        postId: notification.postComment?.postId,
      });
    } else if (notification.postCommentLikeId) {
      // router.push(`/posts/${notification}`)
    }
  };
  const goToNotificationInitiatorProfile = () => {
    navigation.navigate(userScreenName, {
      userName: notification.initiator.userName,
    });
  };

  return (
    <Pressable onPress={handlePress}>
      {({ pressed }) => (
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 12,
            flexDirection: "row",
            alignItems: "center",
            // backgroundColor: pressed ? theme.gray100 : theme.white,
          }}
        >
          <View style={{ marginRight: 14 }}>
            <Pressable onPress={goToNotificationInitiatorProfile}>
              <Avatar
                src={
                  notification.initiator.profilePicture
                    ? buildPublicFileUrl({
                        fileName:
                          notification.initiator.profilePicture
                            .lowQualityFileName,
                      })
                    : undefined
                }
                name={notification.initiator.displayName}
                width={42}
              />
            </Pressable>
          </View>

          <View style={{ flex: 1 }}>
            {/* <MyText style={{ fontSize: 17 }}>liked your post</MyText> */}

            {notification.followId ? (
              <NotificationText
                text="started following you"
                notification={notification}
              />
            ) : notification.postLikeId ? (
              <NotificationText
                text="liked your post"
                notification={notification}
              />
            ) : notification.parentPostCommentId &&
              notification.parentPostComment?.commenterId !==
                loggedInUserData?.user.id ? (
              <NotificationText
                text="replied to a comment on your post"
                notification={notification}
              />
            ) : notification.parentPostCommentId &&
              notification.parentPostComment?.commenterId ===
                loggedInUserData?.user.id ? (
              <NotificationText
                text="replied to your comment"
                notification={notification}
              />
            ) : notification.postCommentId ? (
              <>
                <NotificationText
                  text="commented your post"
                  notification={notification}
                />
                <MyText style={{ fontSize: 16, color: theme.gray500 }}>
                  {notification.postComment?.text}
                </MyText>
              </>
            ) : notification.postCommentLikeId ? (
              <>
                <NotificationText
                  text="liked your comment"
                  notification={notification}
                />
                <MyText style={{ fontSize: 16, color: theme.gray500 }}>
                  {notification.postComment?.text}
                </MyText>
              </>
            ) : null}

            <NotificationDate date={notification.createdAt} />
          </View>

          <View style={{ marginLeft: 10 }}>
            {notification.followId ? (
              <MaterialCommunityIcons
                name="account-plus"
                size={26}
                color={theme.blue}
                style={{ marginRight: 2 }}
              />
            ) : notification.postLikeId || notification.postCommentLikeId ? (
              <Ionicons name="heart" size={20} color={theme.heart} />
            ) : notification.postCommentId ? (
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
      )}
    </Pressable>
  );
};

export const NotificationItemLoader = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
      }}
    >
      <Skeleton
        style={{
          width: 46,
          height: 46,
          borderRadius: 500,
          marginRight: 12,
        }}
      />
      <View style={{ flex: 1 }}>
        <Skeleton style={{ width: "35%", borderRadius: 8, height: 12 }} />
        <Space height={14} />
        <Skeleton style={{ width: "70%", borderRadius: 8, height: 12 }} />
      </View>
      <Skeleton
        style={{
          width: 18,
          height: 18,
          borderRadius: 300,
        }}
      />
    </View>
  );
};
