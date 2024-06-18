export interface User {
  id: string;
  displayName: string;
  userName: string;
  email: string;
  bio: string;
  followersCount?: number;
  postsCount?: number;
  followingCount?: number;
  unseenNotificationsCount: number;
  unseenDiscussionMessagesCount: number;
  followedByLoggedInUser?: boolean;
  blockedByLoggedInUser?: boolean;
  hasBlockedLoggedInUser?: boolean;
  profilePicture?: {
    lowQualityFileName: string;
    mediumQualityFileName: string;
    bestQualityFileName: string;
  };
  online: boolean;
  previouslyOnlineAt?: Date;
  allowOtherUsersToSeeMyOnlineStatus: boolean;
}
