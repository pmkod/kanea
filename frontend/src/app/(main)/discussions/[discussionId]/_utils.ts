"use client";
//
//
//

export const getUnseenDiscussionMessagesOfThisDiscussion = (
  discData: any,
  loggedInUserData: any
): number | undefined => {
  // for (const page of discsData.pages) {
  // for (const discussion of page.discussions) {
  // if (discussion.id === params.discussionId) {
  for (const member of discData.discussion.members) {
    if (member.userId === loggedInUserData?.user.id) {
      return member.unseenDiscussionMessagesCount;
    }
  }
  // }
  // }
  // }
  return undefined;
};
