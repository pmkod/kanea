import { Types } from "mongoose";
import { isEmpty } from "radash";
import { BlockModel } from "../models/block-model";
import DiscussionModel from "../models/discussion-model";
import MessageModel from "../models/message-model";
import UserModel from "../models/user-model";
import {
  idValidator,
  paginationQueryParamsValidator,
  searchQueryParamsValidator,
} from "../validators/shared-validators";
import { RecordNotFoundException } from "../utils/exception-utils";
import { FastifyReply, FastifyRequest } from "fastify";
import { streamFile } from "../utils/file-utils";
import { S3_DISCUSSIONS_BUCKET_NAME, S3_MESSAGES_BUCKET_NAME } from "../configs";

//
//
//
//
//

export const getDicussions = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);

  const limit = query.limit || 10;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const userId = request.session.userId;

  const discussions = await DiscussionModel.find({
    members: {
      $elemMatch: { userId, hasDeletedDiscussionForHim: { $ne: true } },
    },
  })
    .skip(startIndex)
    .limit(limit + 1)
    .sort({ lastMessageSentAt: "desc" })
    .populate({
      path: "members.user",
      select: [
        "id",
        "displayName",
        "userName",
        "profilePicture.lowQualityFileName",
        "unseenDiscussionMessagesCount",
        "online",
        "previouslyOnlineAt",
      ],
    })
    .populate({
      path: "lastMessage",
    });

  const nextPage = discussions.length > limit ? page + 1 : undefined;

  if (nextPage) {
    discussions.pop();
  }

  const idOfMembersOfAllDiscussions = discussions
    .map(({ members }) => members.map(({ userId }) => userId?.toString()))
    .flat()
    .filter((id) => id !== userId.toString());

  const usersWhoBlockedYou = await BlockModel.find({ blockerId: idOfMembersOfAllDiscussions, blockedId: userId });

  const idOfUsersWhoBlockedYou = usersWhoBlockedYou.map(({ blockerId }) => blockerId?.toString());

  const discussionToSend = discussions.map((discussion) => {
    const disc = discussion.toObject();
    disc.members = disc.members.map((member: any) =>
      idOfUsersWhoBlockedYou.includes(member.userId.toString())
        ? {
            ...member,
            user: {
              ...member.user,
              online: false,
              previouslyOnlineAt: undefined,
            },
          }
        : {
            ...member,
          }
    ) as any;
    return disc;
  });

  reply.send({ discussions: discussionToSend, page, nextPage });
};

//
//
//
//
//
//

export const getDiscussionDetails = async (
  request: FastifyRequest<{ Params: { discussionId: string } }>,
  reply: FastifyReply
) => {
  const discussionId = await idValidator.validate(request.params.discussionId);

  const loggedInUserId = request.session.userId;

  const discussion = await DiscussionModel.findOne({
    _id: discussionId,
    members: {
      $elemMatch: { userId: loggedInUserId },
    },
  }).populate({
    path: "members.user",
    select: [
      "id",
      "displayName",
      "userName",
      "profilePicture.lowQualityFileName",
      "profilePicture.bestQualityFileName",
      "online",
      "previouslyOnlineAt",
    ],
  });

  if (discussion === null) {
    throw Error("Discussion not found");
  }

  let blocksInRelationToThisDiscussion: any[] = [];

  if (discussion.name === undefined) {
    blocksInRelationToThisDiscussion = await BlockModel.find({
      $or: [
        {
          blockerId: discussion.members[0].userId,
          blockedId: discussion.members[1].userId,
        },
        {
          blockerId: discussion.members[1].userId,
          blockedId: discussion.members[0].userId,
        },
      ],
    })
      .populate({
        path: "blocker",
        select: ["displayName", "userName"],
      })
      .populate({
        path: "blocked",
        select: ["displayName", "userName"],
      });
  }

  const idOfUsersInThisDiscussion = discussion.members
    .map(({ userId }) => userId?.toString())
    .filter((id) => id !== loggedInUserId.toString());

  const blockMadeMyDiscussionMembersToYou = await BlockModel.find({
    blockerId: { $in: idOfUsersInThisDiscussion },
    blockedId: loggedInUserId,
  });

  const idOfUsersInThisDiscussionWhoBlockedYou = blockMadeMyDiscussionMembersToYou.map(({ blockerId }) =>
    blockerId?.toString()
  );

  const discussionToSend = discussion.toObject();

  discussionToSend.members = discussion.members.map((member: any) =>
    idOfUsersInThisDiscussionWhoBlockedYou.includes(member.userId?.toString())
      ? {
          ...member.toObject(),
          user: {
            ...member.user._doc,
            online: false,
            previouslyOnlineAt: undefined,
          },
        }
      : { ...member.toObject() }
  ) as any;

  reply.send({ discussion: discussionToSend, blocksInRelationToThisDiscussion });
};

//
//
//
//
//

export const getDiscussionMessages = async (
  request: FastifyRequest<{ Params: { discussionId: string } }>,
  reply: FastifyReply
) => {
  const discussionId = await idValidator.validate(request.params.discussionId);
  const query = await paginationQueryParamsValidator.validate(request.query);

  const userId = request.session.userId;
  const limit = query.limit || 20;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const discussion = await DiscussionModel.findOne({
    _id: discussionId,
    members: {
      $elemMatch: { userId },
    },
  });

  if (discussion === null) {
    throw new RecordNotFoundException("Discussion not found");
  }

  const messages = await MessageModel.find({
    discussionId: discussion?._id,
    usersWhoDeletedTheMessageForThem: {
      $nin: userId,
    },
  })
    .skip(startIndex)
    .limit(limit + 1)
    .sort({ createdAt: "desc" })
    .populate({
      path: "parentMessage",
      populate: { path: "sender", select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"] },
    })
    .populate({
      path: "sender",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    });

  const messagesToSend = messages.map((message) => {
    message = message.toObject() as any;
    return {
      ...message,
      usersWhoDeletedTheMessageForThem: [],
      parentMessage:
        (message as any).parentMessage !== null
          ? {
              ...(message as any).parentMessage,
              usersWhoDeletedTheMessageForThem: [],
            }
          : null,
    };
  });

  const nextPage = messages.length > limit ? page + 1 : undefined;

  if (nextPage) {
    messages.pop();
  }

  reply.send({ messages: messagesToSend, page, nextPage });
};

//
//
//
//
//

export const searchDiscussions = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = await searchQueryParamsValidator.validate(request.query);

  const userId = request.session.userId;

  const discussions = await DiscussionModel.find({
    members: {
      $elemMatch: { userId },
    },
  })
    .sort({ lastMessageSentAt: "desc" })
    .populate({
      path: "members.user",
      select: [
        "id",
        "displayName",
        "userName",
        "unseenDiscussionMessagesCount",
        "profilePicture.lowQualityFileName",
        "online",
        "previouslyOnlineAt",
      ],
    })

    .populate({
      path: "lastMessage",
    });

  const discussionsToSend = [];

  let selectedDiscussionsCount = 0;

  const q = query.q.toLowerCase();

  for (const discussion of discussions) {
    if (!isEmpty(discussion.name) && discussion.name?.toLowerCase().includes(q)) {
      discussionsToSend.push(discussion.toObject());
      selectedDiscussionsCount += 1;
    } else if (discussion.members.length === 2) {
      if (
        discussion.members.find(
          ({ user }: any) => user.displayName.toLowerCase().includes(q) || user.userName.toLowerCase().includes(q)
        )
      ) {
        discussionsToSend.push(discussion.toObject());
        selectedDiscussionsCount += 1;
      }
    }
    if (selectedDiscussionsCount === query.limit) break;
  }

  reply.send({ discussions: discussionsToSend });
};

//
//
//
//
//
//

export const streamMessageFile = async (
  request: FastifyRequest<{ Params: { discussionId: string; messageId: string; fileName: string } }>,
  reply: FastifyReply
) => {
  const discussionId = await idValidator.validate(request.params.discussionId);
  const messageId = await idValidator.validate(request.params.messageId);
  const fileName = (request.params.fileName).toString();

  const userId = request.session.userId;

  const discussion = await DiscussionModel.findById(discussionId);

  if (discussion === null) {
    throw new RecordNotFoundException("File not found");
  }

  const isMemberOfDiscussion = discussion.members.find((member) => member.userId?.equals(userId));

  if (!isMemberOfDiscussion) {
    throw new RecordNotFoundException("File not found");
  }

  const message = await MessageModel.findById(messageId);

  if (message === null) {
    throw new RecordNotFoundException("File not found");
  }
  if (message.discussionId?.toString() !== discussionId) {
    throw new RecordNotFoundException("File not found");
  }

  const isMessageMediasContainRequestedFileName = message.medias.find(
    (media) =>
      media.lowQualityFileName === fileName ||
      media.mediumQualityFileName === fileName ||
      media.bestQualityFileName === fileName
  );

  const isMessageDocsContainRequestedFileName = message.docs.find((doc) => doc.fileName === fileName);

  const isMessageVoiceNoteContainRequestedFileName = message.voiceNote?.fileName === fileName;

  if (
    !isMessageMediasContainRequestedFileName &&
    !isMessageDocsContainRequestedFileName &&
    !isMessageVoiceNoteContainRequestedFileName
  ) {
    throw new RecordNotFoundException("File not found");
  }

  await streamFile({
    request,
    reply,
    fileName,
    bucketName: S3_MESSAGES_BUCKET_NAME,
  });
};

//
//
//
//
//
//

export const getDiscussionMessagesWithMediasAndDocs = async (
  request: FastifyRequest<{ Params: { discussionId: string } }>,
  reply: FastifyReply
) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const discussionId = await idValidator.validate(request.params.discussionId);

  const loggedInUserId = request.session.userId;

  const limit = query.limit || 20;

  const discussion = await DiscussionModel.findOne({
    _id: discussionId,
  });

  if (discussion === null) {
    throw Error("Discussion not found");
  }

  const isLoggedInUserMemberOfThidDicussion = discussion?.members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (!isLoggedInUserMemberOfThidDicussion) {
    throw Error("You can't access to this discussion");
  }

  const messages = await MessageModel.find({
    discussionId: discussion?._id,
    $or: [
      {
        medias: {
          $exists: true,
          $type: "array",
          $ne: [],
        },
      },
      {
        docs: {
          $exists: true,
          $type: "array",
          $ne: [],
        },
      },
    ],
  })
    .select(["id", "medias", "docs", "createdAt", "senderId", "discussionId"])
    .populate({
      path: "sender",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .limit(limit)
    .sort({ createdAt: "desc" });

  reply.send({ messages });
};

//
//
//
//
//
//

export const getDiscussionMessagesWithMedias = async (
  request: FastifyRequest<{ Params: { discussionId: string } }>,
  reply: FastifyReply
) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const discussionId = await idValidator.validate(request.params.discussionId);

  const loggedInUserId = request.session.userId;

  const limit = query.limit || 20;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const discussion = await DiscussionModel.findOne({
    _id: discussionId,
    createdAt: { $lte: query.firstPageRequestedAt },
  });

  if (discussion === null) {
    throw Error("Discussion not found");
  }

  const isLoggedInUserMemberOfThidDicussion = discussion?.members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (!isLoggedInUserMemberOfThidDicussion) {
    throw Error("You can't access to this discussion");
  }

  const messages = await MessageModel.find({
    discussionId: discussion?._id,
    medias: {
      $exists: true,
      $type: "array",
      $ne: [],
    },
  })
    .select(["id", "medias", "senderId", "createdAt", "discussionId"])
    .populate({
      path: "sender",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName", "createdAt"],
    })
    .skip(startIndex)
    .limit(limit + 1)
    .sort({ createdAt: "desc" });

  const nextPage = messages.length > limit ? page + 1 : undefined;

  if (nextPage) {
    messages.pop();
  }

  reply.send({ messages, page, nextPage });
};

//
//
//
//
//
//

export const getDiscussionMessagesWithDocs = async (
  request: FastifyRequest<{ Params: { discussionId: string } }>,
  reply: FastifyReply
) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const discussionId = await idValidator.validate(request.params.discussionId);

  const loggedInUserId = request.session.userId;

  const limit = query.limit || 20;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const discussion = await DiscussionModel.findOne({
    _id: discussionId,
    createdAt: { $lte: query.firstPageRequestedAt },
  });

  if (discussion === null) {
    throw new RecordNotFoundException("Discussion not found");
  }

  const isLoggedInUserMemberOfThidDicussion = discussion?.members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (!isLoggedInUserMemberOfThidDicussion) {
    throw Error("You can't access to this discussion");
  }

  const messages = await MessageModel.find({
    discussionId: discussion?._id,
    docs: {
      $exists: true,
      $type: "array",
      $ne: [],
    },
  })
    .select(["id", "docs", "createdAt", "discussionId"])
    .populate({
      path: "sender",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName", "createdAt"],
    })
    .skip(startIndex)
    .limit(limit + 1)
    .sort({ createdAt: "desc" });

  const nextPage = messages.length > limit ? page + 1 : undefined;

  if (nextPage) {
    messages.pop();
  }

  reply.send({ messages, page, nextPage });
};

//
//
//
//
//
//

export const defineGroupDiscussionMemberAsAdmin = async (
  request: FastifyRequest<{ Params: { discussionId: string; userId: string } }>,
  reply: FastifyReply
) => {
  const discussionId = await idValidator.validate(request.params.discussionId);
  const memberId = await idValidator.validate(request.params.userId);

  const loggedInUserId = request.session.userId;

  const discussion = await DiscussionModel.findById(discussionId);

  if (discussion === null) {
    throw Error("Discussion not found");
  }

  const user = await UserModel.findOne({ _id: memberId, active: true });

  if (user === null) {
    throw Error("User not found");
  }

  const memberWhoWantDefineAMemberAsAdmin = discussion
    .toObject()
    .members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (memberWhoWantDefineAMemberAsAdmin === undefined) {
    throw Error("You are not a member of this discussion");
  }

  if (!memberWhoWantDefineAMemberAsAdmin.isAdmin) {
    throw Error("You are not an admin of this discussion");
  }

  discussion.members = discussion.members.map((member) => ({
    ...member.toObject(),
    isAdmin: member.userId?.equals(memberId) ? true : member.isAdmin,
  })) as any;

  await discussion.save();
  reply.send({ message: "Success" });
};

//
//
//
//
//
//

export const dismissGroupDiscussionMemberAsAdmin = async (
  request: FastifyRequest<{ Params: { discussionId: string; userId: string } }>,
  reply: FastifyReply
) => {
  const discussionId = await idValidator.validate(request.params.discussionId);
  const memberId = await idValidator.validate(request.params.userId);
  const loggedInUserId = request.session.userId as Types.ObjectId;

  const discussion = await DiscussionModel.findById(discussionId);

  if (discussion === null) {
    throw Error("Discussion not found");
  }

  if (loggedInUserId.equals(memberId)) {
    throw Error("You can't dismis yourself as admin");
  }

  const user = await UserModel.findOne({ _id: memberId, active: true });

  if (user === null) {
    throw Error("User not found");
  }

  if (user._id?.equals(discussion.creatorId)) {
    throw Error("The group creator can't be dismiss admin");
  }

  const memberWhoWantDismisAMemberAsAdmin = discussion
    .toObject()
    .members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (memberWhoWantDismisAMemberAsAdmin === undefined) {
    throw Error("You are not a member of this discussion");
  }

  if (!memberWhoWantDismisAMemberAsAdmin.isAdmin) {
    throw Error("You are not an admin of this discussion");
  }

  const memberToDismisAsAdmin = discussion.toObject().members.find(({ userId }) => userId?.equals(memberId));

  if (memberToDismisAsAdmin === undefined) {
    throw Error("This member is not in group discussion");
  }

  discussion.members = discussion.members.map((member) => ({
    ...member.toObject(),
    isAdmin: member.userId?.equals(memberId) ? false : member.isAdmin,
  })) as any;

  await discussion.save();
  reply.send({ message: "Success" });
};

//
//
//
//
//
//

export const streamDiscussionFile = async (
  request: FastifyRequest<{ Params: { discussionId: string; fileName: string } }>,
  reply: FastifyReply
) => {
  const discussionId = await idValidator.validate(request.params.discussionId);
  const fileName = (request.params.fileName).toString();

  const loggedInUserId = request.session.userId;

  const discussion = await DiscussionModel.findById(discussionId);
  if (discussion === null) {
    throw new RecordNotFoundException("File not found");
  }

  const isMemberOfDiscussion = discussion.members.find((member) => member.userId?.equals(loggedInUserId));

  if (!isMemberOfDiscussion) {
    throw new RecordNotFoundException("File not found");
  }

  await streamFile({
    request,
    reply,
    fileName,
    bucketName: S3_DISCUSSIONS_BUCKET_NAME,
  });
};

export const checkIfDiscussionBetweenTwoUsersExist = async (
  request: FastifyRequest<{ Body: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = await idValidator.validate(request.body.userId);
  const loggedInUserId = request.session.userId;

  const discussion = await DiscussionModel.findOne({
    $and: [
      {
        name: { $exists: false },
      },
      {
        members: {
          $elemMatch: { userId },
        },
      },
      {
        members: {
          $elemMatch: { userId: loggedInUserId },
        },
      },
    ],
  });

  if (discussion === null || discussion.members.length !== 2) {
    throw new RecordNotFoundException("Not found");
  }

  reply.send({ discussion });
};
