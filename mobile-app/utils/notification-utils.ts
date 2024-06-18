import { Notification } from "@/types/notification";

export const sortNotificationsByGroup = (notifications: Notification[]) => {
  const sortedNotifications: { elements: Notification[] }[] = [];

  while (notifications.length > 0) {
    const currentNotification = { ...notifications[0] };

    const elements = [currentNotification];

    notifications = notifications.filter(
      ({ id }) => id !== currentNotification.id
    );
    // notifications = notifications.filter(
    //   ({ id }) => id !== currentNotification.id
    // );

    for (let k = 0; k < notifications.length; k++) {
      const nextVisitedNotification = notifications[k];

      if (currentNotification.followId && nextVisitedNotification.followId) {
        elements.push(nextVisitedNotification);
        // notifications = notifications.filter(
        //   ({ id }) => id !== nextVisitedNotification.id
        // );
      } else if (
        currentNotification.postLikeId &&
        nextVisitedNotification.postLikeId &&
        currentNotification.postLike?.postId ===
          nextVisitedNotification.postLike?.postId &&
        currentNotification.postLike?.likerId !==
          nextVisitedNotification.postLike?.likerId
      ) {
        elements.push(nextVisitedNotification);
        // notifications = notifications.filter(
        //   ({ id }) => id !== nextVisitedNotification.id
        // );
      } else if (
        currentNotification.parentPostCommentId &&
        nextVisitedNotification.parentPostCommentId &&
        currentNotification.postComment?.mostDistantParentPostCommentId ===
          nextVisitedNotification.postComment?.mostDistantParentPostCommentId &&
        currentNotification.postComment?.commenterId !==
          currentNotification.postComment?.commenterId
      ) {
        elements.push(nextVisitedNotification);
        // notifications = notifications.filter(
        //   ({ id }) => id !== nextVisitedNotification.id
        // );
      } else if (
        currentNotification.postCommentId &&
        nextVisitedNotification.postCommentId &&
        currentNotification.postComment?.postId ===
          nextVisitedNotification.postComment?.postId &&
        currentNotification.postComment?.commenterId !==
          nextVisitedNotification.postComment?.commenterId
      ) {
        elements.push(nextVisitedNotification);
        // notifications = notifications.filter(
        //   ({ id }) => id !== nextVisitedNotification.id
        // );
      } else if (
        currentNotification.postCommentLikeId &&
        nextVisitedNotification.postCommentLikeId &&
        currentNotification.postCommentLike?.postCommentId ===
          nextVisitedNotification.postCommentLike?.postCommentId &&
        currentNotification.postCommentLike?.likerId !==
          nextVisitedNotification.postCommentLike?.likerId
      ) {
        elements.push(nextVisitedNotification);
        // notifications = notifications.filter(
        //   ({ id }) => id !== nextVisitedNotification.id
        // );
      }
    }

    notifications = notifications.filter(
      ({ id }) => !elements.map(({ id }) => id).includes(id)
    );

    sortedNotifications.push({ elements });
  }

  return sortedNotifications;
};
