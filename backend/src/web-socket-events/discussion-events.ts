import { errors } from "@vinejs/vine";
import sharp from "sharp";
import { Socket } from "socket.io";
import { maxMembersInGroupDiscussion } from "../constants/discussion-constants";
import { acceptedImageMimetypes } from "../constants/file-constants";
import { BlockModel } from "../models/block-model";
import DiscussionModel from "../models/discussion-model";
import MessageModel from "../models/message-model";
import UserModel from "../models/user-model";
import { storeDiscussionPicture } from "../utils/discussion-utils";
import { deleteMessageFile, storeMessageFile } from "../utils/file-utils";
import { buildEachUserSelfRoomName, buildUserSelfRoomName } from "../utils/web-socket-utils";
import {
  addMembersToGroupDiscussionValidator,
  createGroupDiscussionValidator,
  editGroupDiscussionValidator,
  removeMemberFromGroupDiscussionValidator,
  sendMessageValidator,
} from "../validators/discussion-validators";
import {
  validateMessageDocFromBuffer,
  validateMessageMediaFromBuffer,
  validateMessageVoiceNoteFromBuffer,
} from "../validators/file-validator";
import { idValidator } from "../validators/shared-validators";
import {
  imageCompressionToBestQualityPercentage,
  imageCompressionToLowQualityPercentage,
  imageCompressionToMediumQualityPercentage,
} from "../constants/image-constants";
import { isEmpty } from "radash";

//
//
//
//

export const sendMessageEvent = async (socket: Socket, data: any) => {
  try {
    data = await sendMessageValidator.validate(data);
  } catch (error: any) {
    if (error instanceof errors.E_VALIDATION_ERROR) {
      socket.emit("send-message-error", { message: error.messages[0].message });
    }
    return;
  }

  if (data.medias && data.docs) {
    socket.emit("send-message-error", { message: "Error" });
    return;
  }
  if (data.voiceMessage && data.docs) {
    socket.emit("send-message-error", { message: "Error" });
    return;
  }
  if (data.voiceMessage && data.text) {
    socket.emit("send-message-error", { message: "Error" });
    return;
  }
  if (data.voiceMessage && data.medias) {
    socket.emit("send-message-error", { message: "Error" });
    return;
  }

  if (data.isFirstPrivateMessage && !data.memberId) {
    socket.emit("send-message-error", { message: "Error" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  let discussionId = "";
  let discussionMemberIds: string[] = [];

  if (data.isFirstPrivateMessage) {
    if (loggedInUserId === data.memberId) {
      socket.emit("send-message-error", { message: "You can not send message to yourself" });
      return;
    }
    const senderBlockedReceiver = await BlockModel.exists({ blockerId: loggedInUserId, blockedId: data.memberId });
    if (senderBlockedReceiver !== null) {
      socket.emit("send-message-error", { message: "You blocked this user" });
      return;
    }
    const receiverBlockedSender = await BlockModel.exists({ blockerId: data.memberId, blockedId: loggedInUserId });
    if (receiverBlockedSender !== null) {
      socket.emit("send-message-error", { message: "This user blocked you" });
      return;
    }
    const discussion = await DiscussionModel.findOne({
      name: {
        $exists: false,
      },
      members: {
        $size: 2,
        $all: [{ $elemMatch: { userId: loggedInUserId } }, { $elemMatch: { userId: data.memberId } }],
      },
    });
    if (discussion === null) {
      const newDiscussion = await DiscussionModel.create({
        members: [{ userId: loggedInUserId }, { userId: data.memberId }],
      });
      discussionId = newDiscussion.id;
      discussionMemberIds = newDiscussion.members.map((m) => m.userId!.toString());
    } else {
      discussionId = discussion._id.toString();
      discussionMemberIds = discussion.members.map((m) => m.userId!.toString());
    }
  } else {
    const discussion = await DiscussionModel.findOne({
      _id: data.discussionId,
    });
    if (discussion === null) {
      socket.emit("send-message-error", { message: "Discussion not found" });
      return;
    }
    const isMemberOfTheDiscussion = discussion?.members.find((m) => m.userId?.equals(loggedInUserId)) !== undefined;

    if (!isMemberOfTheDiscussion) {
      socket.emit("send-message-error", { message: "Unautorized" });
      return;
    }

    if (discussion.name !== undefined) {
      const receiver = discussion.members.find(({ userId }) => !userId?.equals(loggedInUserId));
      const senderBlockedReceiver = await BlockModel.exists({ blockerId: loggedInUserId, blockedId: receiver?.id });
      if (senderBlockedReceiver !== null) {
        socket.emit("send-message-error", { message: "You blocked this user" });
        return;
      }
      const receiverBlockedSender = await BlockModel.exists({ blockerId: receiver?.id, blockedId: loggedInUserId });
      if (receiverBlockedSender !== null) {
        socket.emit("send-message-error", { message: "This user blocked you" });
        return;
      }
    }

    discussionMemberIds = discussion.members.map((m) => m.userId!.toString());
    discussionId = discussion.id;
  }

  const messageData: any = {
    discussionId: discussionId,
    text: data.text,
    senderId: loggedInUserId,
  };

  if (data.parentMessageId && !data.isFirstPrivateMessage) {
    const parentMessage = await MessageModel.findOne({
      _id: data.parentMessageId,
      discussionId: data.discussionId,
    });
    if (parentMessage !== null) {
      messageData.parentMessageId = parentMessage.id;
    } else {
      // parent message don't exist
      socket.emit("send-message-error", { message: "Parent message don't exist" });
      return;
    }
  }

  let message = await MessageModel.create(messageData);

  if (data.medias) {
    //
    //
    //
    //

    for (let i = 0; i < data.medias.length; i++) {
      try {
        const mediaInfo = await validateMessageMediaFromBuffer(data.medias[i].file);
        data.medias[i] = { ...data.medias[i], ...mediaInfo };
      } catch (error: any) {
        socket.emit("send-message-error", { errors: [{ message: error.message }] });
        return;
      }
    }

    const messageMedias: any[] = [];

    for (let i = 0; i < data.medias.length; i++) {
      const media = data.medias[i];

      const lowQualityFileName =
        "m_" + message.id + "_" + imageCompressionToLowQualityPercentage + "_" + (i + 1) + "." + media.ext;
      const mediumQualityFileName =
        "m_" + message.id + "_" + imageCompressionToMediumQualityPercentage + "_" + (i + 1) + "." + media?.ext;
      const bestQualityFileName =
        "m_" + message.id + "_" + imageCompressionToBestQualityPercentage + "_" + (i + 1) + "." + media?.ext;

      if (acceptedImageMimetypes.includes(media.mime)) {
        const lowQualityFile = await sharp(media.file)
          .toFormat(media?.ext as any, { quality: imageCompressionToLowQualityPercentage })
          .withMetadata()
          .toBuffer();

        const mediumQualityFile = await sharp(media.file)
          .toFormat(media?.ext as any, { quality: imageCompressionToMediumQualityPercentage })
          .withMetadata()
          .toBuffer();

        const bestQualityFile = await sharp(media.file)
          .toFormat(media?.ext as any, { quality: imageCompressionToBestQualityPercentage })
          .withMetadata()
          .toBuffer();

        await Promise.all([
          storeMessageFile(lowQualityFileName, lowQualityFile),
          storeMessageFile(mediumQualityFileName, mediumQualityFile),
          storeMessageFile(bestQualityFileName, bestQualityFile),
        ]);
        messageMedias.push({
          lowQualityFileName,
          mediumQualityFileName,
          bestQualityFileName,
          mimetype: media?.mime,
        });
      } else {
        await storeMessageFile(bestQualityFileName, media.file);
        messageMedias.push({
          bestQualityFileName,
          mimetype: media?.mime,
        });
      }
    }
    message.medias = messageMedias as any;
    await message.save();
  } else if (data.docs) {
    const messageDocs: any[] = [];

    for (let i = 0; i < data.docs.length; i++) {
      try {
        const docInfo = await validateMessageDocFromBuffer(data.docs[i].file);
        data.docs[i] = { ...docInfo, ...data.docs[i] };
      } catch (error: any) {
        socket.emit("send-message-error", { errors: [{ message: error.message }] });
        return;
      }
    }

    for (let i = 0; i < data.docs.length; i++) {
      const doc = data.docs[i];

      // const fileType = await fileTypeFromBuffer(doc.file);
      const fileName = "m_" + message.id + "_" + (i + 1) + "." + doc?.ext;

      await storeMessageFile(fileName, doc.file);

      messageDocs.push({
        fileName,
        mimetype: doc?.mime,
        originalFileName: doc.name,
      });
    }
    //
    //
    //
    //
    message.docs = messageDocs as any;
    await message.save();
  } else if (data.voiceMessage) {
    let fileData: any;

    try {
      fileData = await validateMessageVoiceNoteFromBuffer(data.voiceMessage.data);
    } catch (error: any) {
      socket.emit("send-message-error", { errors: [{ message: error.message }] });
      return;
    }

    const fileName = "m_" + message.id + "." + fileData?.ext;
    await storeMessageFile(fileName, data.voiceMessage.data);

    message.voiceNote!.durationInMs = fileData.durationInMs;
    message.voiceNote!.fileName = fileName;
    await message.save();
  }

  await message.populate("sender");

  if (message.parentMessageId) {
    await message.populate({ path: "parentMessage", populate: { path: "sender" } });
  }
  // message
  const discussion = await DiscussionModel.findOneAndUpdate(
    { _id: discussionId },
    {
      $set: {
        lastMessageId: message._id,
        lastMessageSentAt: message.createdAt,
      },
    },
    { new: true }
  );

  if (discussion !== null) {
    discussion.members = discussion.members.map((member) => ({
      ...member.toObject(),
      unseenDiscussionMessagesCount: member.userId?.equals(loggedInUserId)
        ? member.unseenDiscussionMessagesCount
        : member.unseenDiscussionMessagesCount + 1,
    })) as any;
    await discussion.save();
    await discussion.populate("members.user");
    await discussion.populate("lastMessage");
  }

  socket.emit("send-message-success", { message, discussion });

  socket.to(buildEachUserSelfRoomName(discussionMemberIds)).emit("receive-message", { message, discussion });

  discussionMemberIds = discussionMemberIds.filter((memberId) => memberId !== loggedInUserId);
  await UserModel.updateMany({ _id: { $in: discussionMemberIds } }, { $inc: { unseenDiscussionMessagesCount: 1 } });
};

//
//
//
//
//
//
//
//
//

export const createGroupDiscussionEvent = async (socket: Socket, data: any) => {
  try {
    data = await createGroupDiscussionValidator.validate(data);
  } catch (error) {
    socket.emit("create-group-discussion-error", { message: "Invalid data" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const memberIds = data.memberIds;

  if (memberIds.includes(loggedInUserId)) {
    socket.emit("create-group-discussion-error", { message: "Error" });
    return;
  }

  const users = await UserModel.find({ _id: { $in: memberIds }, active: true });

  if (users.length !== memberIds.length) {
    socket.emit("create-group-discussion-error", { message: "Some users don't exist" });
    return;
  }

  const blockByCreator = (await BlockModel.findOne({
    blockerId: loggedInUserId,
    blockedId: { $in: memberIds },
  }).populate("blocked")) as any;

  if (blockByCreator !== null) {
    socket.emit("create-group-discussion-error", {
      message: `You blocked ${blockByCreator.blocked.displayName}. You can't add him to a group`,
    });
    return;
  }

  const blockByMember = (await BlockModel.findOne({
    blockerId: { $in: memberIds },
    blockedId: loggedInUserId,
  }).populate("blocker")) as any;

  if (blockByMember !== null) {
    socket.emit("create-group-discussion-error", {
      message: `${blockByMember.blocker.displayName} blocked you. You can't add him to a group`,
    });
    return;
  }

  const members = memberIds.map((userId: string) => ({ userId }));

  members.push({ userId: loggedInUserId, isAdmin: true });

  const discussionData: any = {
    name: data.name,
    members,
    creatorId: loggedInUserId,
    lastMessageSentAt: new Date(),
  };

  const discussion = await DiscussionModel.create(discussionData);

  if (!isEmpty(data.picture)) {
    try {
      discussion.picture = await storeDiscussionPicture({ discussionId: discussion.id, file: data.picture.file });
    } catch (error: any) {
      socket.emit("create-group-discussion-error", { message: error.message });
      return;
    }
  }
  await discussion.save();
  await discussion.populate("members.user");
  await discussion.populate("lastMessage");

  const discussionMemberIds = discussion.members.map((m) => m.userId!.toString());

  socket.emit("create-group-discussion-success", { discussion });
  socket
    .to(buildEachUserSelfRoomName(discussionMemberIds))
    .emit("be-added-to-group-discussion-on-creation", { discussion });
};

//
//
//
//
//
//
//
//
//

export const seeDiscussionMessagesEvent = async (socket: Socket, data: any) => {
  //

  try {
    data = await idValidator.validate(data.discussionId);
  } catch (error) {
    socket.emit("see-discussion-messages-error", { message: "Data validation error" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const date = new Date();

  const discussion = await DiscussionModel.findOne({
    _id: data.discussionId,
    members: {
      $elemMatch: { userId: loggedInUserId },
    },
  });
  if (discussion === null) {
    return;
  }
  const userUnseenDiscussionMessagesInThisDiscussion = discussion.members.find((member) =>
    member.userId?.equals(loggedInUserId)
  )!.unseenDiscussionMessagesCount;

  discussion.members = discussion.members.map((member) =>
    member.userId?.equals(loggedInUserId)
      ? {
          ...member.toObject(),
          lastSeenAt: date,
          unseenDiscussionMessagesCount: 0,
        }
      : member.toObject()
  ) as any;

  await discussion.save();

  const user = await UserModel.findByIdAndUpdate(
    loggedInUserId,
    {
      $inc: {
        unseenDiscussionMessagesCount: -userUnseenDiscussionMessagesInThisDiscussion,
      },
    },
    { new: true }
  );
  

  await MessageModel.updateMany(
    {
      discussionId: data.discussionId,
      "viewers.viewerId": {
        $ne: loggedInUserId,
        // $elemMatch: {
        //   viewerId: {
        //   },
        // },
      },
      senderId: {
        $ne: loggedInUserId,
      },
    },
    {
      $push: {
        viewers: { viewerId: loggedInUserId, viewAt: date },
      },
    }
  );

  socket.emit("see-discussion-messages-success", {
    user,
    date,
    discussionId: discussion.id,
    viewerId: loggedInUserId,
  });

  socket.to(buildUserSelfRoomName(loggedInUserId)).emit("see-discussion-messages-success", {
    user,
    date,
    discussionId: discussion.id,
    viewerId: loggedInUserId,
  });

  const discussionMemberIds = discussion.members
    .map((m) => m.userId!.toString())
    .filter((userId) => userId !== loggedInUserId);

  socket.to(buildEachUserSelfRoomName(discussionMemberIds)).emit("discussion-messages-viewed", {
    date,
    discussionId: discussion.id,
    viewerId: loggedInUserId,
  });
};

//
//
//
//
//

export const deleteMessageForMeEvent = async (socket: Socket, data: any) => {
  let discussionId = "";
  let messageId = "";
  try {
    discussionId = await idValidator.validate(data.discussionId);
    messageId = await idValidator.validate(data.messageId);
  } catch (error) {
    socket.emit("delete-message-for-me-error", { message: "Invalid data" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const discussion = await DiscussionModel.findOne({
    _id: discussionId,
    members: {
      $elemMatch: { userId: loggedInUserId },
    },
  });
  if (discussion === null) {
    socket.emit("delete-message-for-me-error", { message: "Discussion not found" });
    return;
  }

  await MessageModel.updateOne(
    { _id: messageId, discussionId, usersWhoDeletedTheMessageForThem: { $nin: loggedInUserId } },
    {
      $push: {
        usersWhoDeletedTheMessageForThem: loggedInUserId,
      },
    }
  );

  socket.emit("delete-message-for-me-success", { message: { id: messageId }, discussion });
  socket
    .to(buildUserSelfRoomName(loggedInUserId))
    .emit("delete-message-for-me-success", { message: { id: messageId }, discussion });
};

//
//
//
//

export const deleteMessageForEverybodyEvent = async (socket: Socket, data: any) => {
  try {
    await idValidator.validate(data.messageId);
  } catch (error) {
    socket.emit("delete-message-for-everybody-error", { message: "Id not valid" });
    return;
  }
  const loggedInUserId = socket.data.session.userId.toString();

  const message = await MessageModel.findById(data.messageId);

  if (message === null) {
    socket.emit("delete-message-for-everybody-error", { message: "Message not found" });
    return;
  }

  let discussion = await DiscussionModel.findOne({ _id: message.discussionId });
  if (discussion === null) {
    socket.emit("delete-message-for-everybody-error", { message: "Message discussion not found" });
    return;
  }

  if (
    !message.senderId?.equals(loggedInUserId) &&
    !discussion.members.find((member) => member.userId?.equals(loggedInUserId))?.isAdmin
  ) {
    socket.emit("delete-message-for-everybody-error", { message: "You are not admin or mesaage sender" });
    return;
  }

  let usersWhoHaventSeenMessage: string[] = [];

  discussion.members = discussion.toObject().members.map((member) => {
    if (message.viewers.find((viewer: any) => member.userId?.equals(viewer.viewerId))) {
      return member.toObject();
    } else {
      usersWhoHaventSeenMessage.push(member.userId!.toString());
      return {
        ...member.toObject(),
        unseenDiscussionMessagesCount:
          member.unseenDiscussionMessagesCount > 0 ? member.unseenDiscussionMessagesCount - 1 : 0,
      };
    }
  }) as any;

  await discussion.save();

  const discussionMemberIds = discussion.members.map((m) => m.userId!.toString());

  await message.deleteOne();

  await discussion.populate("members.user");
  await discussion.populate("lastMessage");

  socket.emit("receive-message-deletion", { message, discussion });
  socket.to(buildEachUserSelfRoomName(discussionMemberIds)).emit("receive-message-deletion", { message, discussion });
  // }

  await UserModel.updateMany(
    { _id: { $in: usersWhoHaventSeenMessage }, unseenDiscussionMessagesCount: { $gt: 0 } },
    { $inc: { unseenDiscussionMessagesCount: -1 } }
  );

  if (message.medias) {
    for (const media of message.medias) {
      await Promise.all([
        deleteMessageFile(media.lowQualityFileName!),
        deleteMessageFile(media.mediumQualityFileName!),
        deleteMessageFile(media.bestQualityFileName!),
      ]);
    }
  }
  if (message.docs) {
    for (const doc of message.docs) {
      await deleteMessageFile(doc.fileName!);
    }
  }
};

//
//
//
//
//
//
//
//
//
//
//
//

export const addMembersToGroupDiscussionEvent = async (socket: Socket, data: any) => {
  const loggedInUserId = socket.data.session.userId.toString();

  let discussionId = "";
  let newMemberIds: string[] = [];

  try {
    const validatedData = await addMembersToGroupDiscussionValidator.validate(data);
    discussionId = validatedData.discussionId;
    newMemberIds = validatedData.newMemberIds;

    // if (newMemberIds) {

    // }
  } catch (error) {
    socket.emit("add-members-to-group-discussion-error", { message: "Invalid data" });
    return;
  }

  if (newMemberIds.includes(loggedInUserId)) {
    socket.emit("add-members-to-group-discussion-error", { message: "Error" });
    return;
  }

  const users = await UserModel.find({ _id: { $in: newMemberIds }, active: true });

  if (users.length !== newMemberIds.length) {
    socket.emit("add-members-to-group-discussion-error", { message: "Some users don't exist" });
    return;
  }

  const blockByCreator = (await BlockModel.findOne({
    blockerId: loggedInUserId,
    blockedId: { $in: newMemberIds },
  }).populate("blocked")) as any;

  if (blockByCreator !== null) {
    socket.emit("add-members-to-group-discussion-error", {
      message: `You blocked ${blockByCreator.blocked.displayName}. You can't add him to a group`,
    });
    return;
  }

  const blockByMember = (await BlockModel.findOne({
    blockerId: { $in: newMemberIds },
    blockedId: loggedInUserId,
  }).populate("blocker")) as any;

  if (blockByMember !== null) {
    socket.emit("add-members-to-group-discussion-error", {
      message: `${blockByMember.blocker.displayName} blocked you. You can't add him to a group`,
    });
    return;
  }

  const discussion = await DiscussionModel.findOne({ _id: discussionId });

  if (discussion === null) {
    socket.emit("add-members-to-group-discussion-error", { message: "Discussion not found" });
    return;
  }

  const memberWhoWantAddNewMembers = discussion.toObject().members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (memberWhoWantAddNewMembers === undefined) {
    socket.emit("add-members-to-group-discussion-error", { message: "You are not member of this discussion" });
    return;
  }

  if (!memberWhoWantAddNewMembers.isAdmin) {
    socket.emit("add-members-to-group-discussion-error", { message: "You are not an admin of this discussion" });
    return;
  }

  if (discussion.members.length + newMemberIds.length > maxMembersInGroupDiscussion) {
    socket.emit("add-members-to-group-discussion-error", {
      message: `The maximum number of members in group discussion is ${maxMembersInGroupDiscussion}`,
    });
    return;
  }

  for (const member of discussion.members) {
    if (newMemberIds.includes(member.userId!.toString())) {
      const user = await UserModel.findById(member.userId);
      await discussion.populate("members.user");
      socket.emit("add-members-to-group-discussion-error", {
        message: "Some users already in group",
        discussion,
        user,
      });
      return;
    }
  }

  // Members before addition of new members
  const oldMemberIds = discussion.members.map((m) => m.userId!.toString());

  discussion.members = [
    ...discussion.toObject().members,
    ...newMemberIds.map((newMemberId) => ({ userId: newMemberId, isAdmin: false })),
  ] as any;

  await discussion.save();

  await discussion.populate("members.user");
  await discussion.populate("lastMessage");

  socket.emit("add-members-to-group-discussion-success", { discussion });

  socket.to(buildEachUserSelfRoomName(newMemberIds)).emit("be-added-to-group-discussion", {
    discussion,
  });

  socket.to(buildEachUserSelfRoomName(oldMemberIds)).emit("new-members-added-to-group-discussion", {
    discussion,
  });
};

//
//
//
//
//
//
//
//
//
//
//

export const removeMemberFromGroupDiscussionEvent = async (socket: Socket, data: any) => {
  const loggedInUserId = socket.data.session.userId.toString();

  let discussionId = "";
  let memberId: string = "";

  try {
    const validatedData = await removeMemberFromGroupDiscussionValidator.validate(data);
    discussionId = validatedData.discussionId;
    memberId = validatedData.memberId;
  } catch (error) {
    socket.emit("remove-member-from-group-discussion-error", { message: "Data validation error" });
    return;
  }

  if (memberId === loggedInUserId) {
    socket.emit("remove-member-from-group-discussion-error", { message: "You can't remove yourself from discussion" });
    return;
  }

  const user = await UserModel.findOne({ _id: memberId, active: true });

  if (user === null) {
    socket.emit("remove-member-from-group-discussion-error", { message: "User not found" });
    return;
  }

  const discussion = await DiscussionModel.findOne({ _id: discussionId });

  if (discussion === null) {
    socket.emit("remove-member-from-group-discussion-error", { message: "Discussion not found" });
    return;
  }

  const memberWhoWantRemoveMember = discussion.members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (memberWhoWantRemoveMember === undefined) {
    socket.emit("remove-member-from-group-discussion-error", {
      message: "You are not member of this discussion",
    });
    return;
  }

  if (!memberWhoWantRemoveMember.isAdmin) {
    socket.emit("remove-member-from-group-discussion-error", {
      message: "You are not an admin of this discussion",
    });
    return;
  }

  const memberToRemove = discussion.members.find(({ userId }) => userId?.equals(memberId));

  discussion.members = [...discussion.toObject().members.filter(({ userId }) => !userId?.equals(memberId))] as any;

  await discussion.save();

  socket.emit("remove-member-from-group-discussion-success", {
    userId: memberId,
  });

  user.unseenDiscussionMessagesCount =
    user.unseenDiscussionMessagesCount > memberToRemove!.unseenDiscussionMessagesCount
      ? user.unseenDiscussionMessagesCount - memberToRemove!.unseenDiscussionMessagesCount
      : 0;
  await user.save();
  socket.to(buildUserSelfRoomName(user.id)).emit("be-removed-from-group-discussion", {
    discussion,
    user,
  });
};

//
//
//
//
//
//
//
//
//
//
//
//
//

export const editGroupDiscussionEvent = async (socket: Socket, data: any) => {
  const loggedInUserId = socket.data.session.userId.toString();

  try {
    data = await editGroupDiscussionValidator.validate(data);
  } catch (error) {
    socket.emit("edit-group-discussion-error", { message: "Data validation error" });
    return;
  }

  //
  //
  const discussion = await DiscussionModel.findById(data.discussionId);
  if (discussion === null) {
    socket.emit("edit-group-discussion-error", { message: "Discussion not found" });
    return;
  }
  if (discussion.name === undefined) {
    socket.emit("edit-group-discussion-error", { message: "You can edit only discussion group" });
    return;
  }

  const memberWhoWantEditGroupDiscussion = discussion
    .toObject()
    .members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (memberWhoWantEditGroupDiscussion === undefined) {
    socket.emit("edit-group-discussion-error", {
      message: "You are not member of this discussion",
    });
    return;
  }
  //
  //

  discussion.name = data.name;
  if (data.picture !== undefined) {
    try {
      discussion.picture = await storeDiscussionPicture({ discussionId: discussion.id, file: data.picture.file });
    } catch (error: any) {
      socket.emit("edit-group-discussion-error", {
        message: error.message,
      });
      return;
    }
  }

  const discussionMemberIds = discussion.members.map((m) => m.userId!.toString());

  await discussion.save();

  socket.emit("edit-group-discussion-success", { discussion });
  socket.to(buildEachUserSelfRoomName(discussionMemberIds)).emit("group-discussion-edited", {
    discussion,
  });
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

export const exitGroupDiscussionEvent = async (socket: Socket, data: any) => {
  let discussionId = "";
  try {
    discussionId = await idValidator.validate(data.discussionId);
  } catch (error) {
    socket.emit("exit-group-discussion-error", { message: "Data validation error" });
    return;
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const discussion = await DiscussionModel.findById(discussionId);

  if (discussion === null) {
    socket.emit("exit-group-discussion-error", { message: "Discussion not found" });
    return;
  }

  if (discussion.name === undefined) {
    socket.emit("exit-group-discussion-error", { message: "You can exit only discussion group" });
    return;
  }

  const memberWhoWantExitDiscussion = discussion
    .toObject()
    .members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (memberWhoWantExitDiscussion === undefined) {
    socket.emit("exit-group-discussion-error", { message: "You are not member of this discussion" });
    return;
  }

  if (memberWhoWantExitDiscussion.userId?.equals(discussion.creatorId)) {
    socket.emit("exit-group-discussion-error", { message: "The group creator can't exist the group" });
    return;
  }

  discussion.members = discussion.members.filter(({ userId }) => !userId?.equals(loggedInUserId)) as any;

  await discussion.save();

  let user = await UserModel.findOne({ _id: loggedInUserId });
  if (user === null) {
    socket.emit("exit-group-discussion-error", { message: "You are not member of this discussion" });
    return;
  }

  if (memberWhoWantExitDiscussion.unseenDiscussionMessagesCount > 0) {
    user.unseenDiscussionMessagesCount =
      user.unseenDiscussionMessagesCount > memberWhoWantExitDiscussion.unseenDiscussionMessagesCount
        ? user.unseenDiscussionMessagesCount - memberWhoWantExitDiscussion.unseenDiscussionMessagesCount
        : 0;
    await user.save();
  }

  socket.emit("exit-group-discussion-success", { discussion, user });

  socket.to(buildUserSelfRoomName(loggedInUserId)).emit("has-exited-group-discussion", {
    discussion,
  });

  const discussionMemberIds = discussion.members.map((m) => m.userId!.toString());

  await discussion.populate("members.user");
  await discussion.populate("lastMessage");

  socket.to(buildEachUserSelfRoomName(discussionMemberIds)).emit("a-member-has-exited-group-discussion", {
    discussion,
  });
};

//
//
//
//
//
//
//
//
//
//
//
//

export const deleteDiscussionEvent = async (socket: Socket, data: any) => {
  let discussionId = "";

  try {
    discussionId = await idValidator.validate(data.discussionId);
  } catch (error) {
    socket.emit("delete-discussion-error", { message: "Data validation error" });
    return;
  }
  const loggedInUserId = socket.data.session.userId.toString();

  const discussion = await DiscussionModel.findById(discussionId);

  if (discussion === null) {
    socket.emit("delete-discussion-error", { message: "Discussion not found" });
    return;
  }

  const memberWhoWantDeleteDiscussion = discussion
    .toObject()
    .members.find(({ userId }) => userId?.equals(loggedInUserId));

  if (memberWhoWantDeleteDiscussion === undefined) {
    socket.emit("delete-discussion-error", { message: "You are not member of this discussion" });
    return;
  }

  if (memberWhoWantDeleteDiscussion.userId?.equals(discussion.creatorId)) {
    socket.emit("delete-discussion-error", { message: "Group creator can't delete his group" });
    return;
  }

  let user = await UserModel.findOne({ _id: loggedInUserId });
  if (user === null) {
    socket.emit("delete-discussion-error", { message: "User not found" });
    return;
  }

  if (memberWhoWantDeleteDiscussion.unseenDiscussionMessagesCount > 0) {
    user.unseenDiscussionMessagesCount =
      user.unseenDiscussionMessagesCount > memberWhoWantDeleteDiscussion.unseenDiscussionMessagesCount
        ? user.unseenDiscussionMessagesCount - memberWhoWantDeleteDiscussion.unseenDiscussionMessagesCount
        : 0;
    await user.save();
  }

  discussion.members = discussion.members.map((member) =>
    member._id?.equals(memberWhoWantDeleteDiscussion._id)
      ? { ...member, unseenDiscussionMessagesCount: 0, hasDeletedDiscussionForHim: true }
      : { ...member }
  ) as any;

  await discussion.save();

  socket.emit("delete-discussion-success", { discussion, user });

  socket.to(buildUserSelfRoomName(loggedInUserId)).emit("delete-discussion-success", {
    discussion,
    user,
  });
};
