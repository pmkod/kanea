import { render } from "@react-email/render";
import { FileTypeResult } from "file-type";
import { FilterQuery } from "mongoose";
import sharp from "sharp";
import { emailVerificationPurposes, emailVerificationTokenFieldName } from "../constants/email-verification-constants";
import { EmailVerification } from "../mail-template/email-verification";
import EmailVerificationModel from "../models/email-verification-model";
import { BlockModel } from "../models/block-model";
import FollowModel from "../models/follow-model";
import NotificationModel from "../models/notification-model";
import PostCommentModel from "../models/post-comment-model";
import PostLikeModel from "../models/post-like-model";
import PostModel from "../models/post-model";
import SessionModel from "../models/session-model";
import UserModel, { User } from "../models/user-model";
import { generateOtp } from "../utils/otp-utils";
import { FieldException } from "../utils/exception-utils";
import { storeFile } from "../utils/file-utils";
import { comparePlainTextToHashedText, hash } from "../utils/hash-utils";
import { sendMail } from "../utils/mail-utils";
import { generateEmailVerificationToken, verifyEmailVerificationToken } from "../utils/token-utils";
import { otpValidator } from "../validators/auth-validators";
import { validateUserProfileImageFromBuffer } from "../validators/file-validator";
import {
  emailValidator,
  idValidator,
  paginationQueryParamsValidator,
  passwordValidator,
  searchQueryParamsValidator,
  userNameValidator,
} from "../validators/shared-validators";
import {
  changeUserPasswordValidator,
  changeUsernameValidator,
  updateUserProfileValidator,
} from "../validators/user-validators";
import PostCommentLikeModel from "../models/post-comment-like-model";
import { maxNumberOfAttemptsForOtp } from "../constants/otp-constants";
import { addDay } from "@formkit/tempo";
import {
  imageCompressionToBestQualityPercentage,
  imageCompressionToLowQualityPercentage,
  imageCompressionToMediumQualityPercentage,
} from "../constants/image-constants";
import { FastifyReply, FastifyRequest } from "fastify";
import { MultipartFile } from "@fastify/multipart";
import { getEmailVerificationTokenFromRequest } from "../utils/email-verification-utils";

//
//
//
//
//

export const getLoggedInUser = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.session.userId;

  const user = await UserModel.findById(userId).select([
    "id",
    "displayName",
    "userName",
    "profilePicture.lowQualityFileName",
    "active",
    "unseenNotificationsCount",
    "unseenDiscussionMessagesCount",
    "allowOtherUsersToSeeMyOnlineStatus",
  ]);

  if (user === null || !user.active) {
    reply.status(400).send({ message: "Error" });
    return;
  }

  delete user.active;

  reply.send({ user });
};

//
//
//
//
//

export const getUsers = async (request: FastifyRequest, reply: FastifyReply) => {
  let { q, limit } = await searchQueryParamsValidator.validate(request.query);
  const loggedInUserId = request.session.userId;

  const filter: FilterQuery<User> = { active: true };
  if (!limit) {
    limit = 5;
  }
  if (q) {
    filter.$or = [{ displayName: { $regex: q, $options: "i" } }, { userName: { $regex: q, $options: "i" } }];
  }

  let users = await UserModel.find(filter)
    .select(["id", "displayName", "userName", "profilePicture.lowQualityFileName"])
    .limit(limit);
  users = users.filter((u) => !u._id.equals(loggedInUserId));

  const userIds = users.map((u) => u._id.toString());

  const follows = await FollowModel.find({ followerId: loggedInUserId, followedId: { $in: userIds } });
  const followedUserIds = follows.map((f) => f.followedId?.toString());

  users = users.map((u) => {
    const mutatedUser: any = {
      ...u.toObject(),
      followedByLoggedInUser: followedUserIds.includes(u._id.toString()),
    };

    if (u._id.equals(loggedInUserId)) {
      delete mutatedUser.followedByLoggedInUser;
    }

    return mutatedUser;
  });

  reply.send({ users });
};

//
//
//
//
//

export const getUserSuggestionsToFollow = async (request: FastifyRequest, reply: FastifyReply) => {
  const { limit, firstPageRequestedAt } = await paginationQueryParamsValidator.validate(request.query);

  const loggedInUserId = request.session.userId;

  const filter: FilterQuery<User> = { active: true, createdAt: { $lte: firstPageRequestedAt } };

  const usersLoggedInUserFollow = await FollowModel.find({ followerId: loggedInUserId });
  const usersLoggedInUserFollowIds = usersLoggedInUserFollow.map((f) => f.followedId?.toString());
  filter._id = { $nin: [...usersLoggedInUserFollowIds, loggedInUserId] };

  const users = await UserModel.find(filter)
    .select(["id", "displayName", "userName", "profilePicture.lowQualityFileName"])
    .limit(limit);

  reply.send({ users });
};

//
//
//
//
//

export const updateUserProfile = async (
  request: FastifyRequest<{
    Body: {
      displayName: any;
      userName: any;
      bio: any;
      profilePicture?: MultipartFile;
    };
  }>,
  reply: FastifyReply
) => {
  const { displayName, userName, bio } = await updateUserProfileValidator.validate({
    displayName: request.body.displayName.value,
    userName: request.body.userName.value,
    bio: request.body.bio.value,
  });

  let profilePictureBuffer: Buffer | undefined = request.body.profilePicture
    ? await request.body.profilePicture.toBuffer()
    : undefined;

  const userId = request.session.userId;

  let profilePictureQualities = undefined;
  let imageInfos: FileTypeResult | undefined = undefined;
  if (profilePictureBuffer !== undefined) {
    imageInfos = await validateUserProfileImageFromBuffer(profilePictureBuffer);
    profilePictureQualities = {
      lowQualityFileName: "upp_" + userId + "_" + imageCompressionToLowQualityPercentage + "." + imageInfos.ext,
      mediumQualityFileName: "upp_" + userId + "_" + imageCompressionToMediumQualityPercentage + "." + imageInfos.ext,
      bestQualityFileName: "upp_" + userId + "_" + imageCompressionToBestQualityPercentage + "." + imageInfos.ext,
    };
  }
  let user = null;
  try {
    user = await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          displayName,
          userName,
          bio,
          profilePicture: profilePictureQualities,
        },
      },
      { new: true }
    );
  } catch (error) {
    throw Error("This username is already taken");
  }
  if (profilePictureQualities !== undefined && profilePictureBuffer !== undefined && imageInfos !== undefined) {
    const lowQualityFile = await sharp(profilePictureBuffer)
      .toFormat(imageInfos.ext as any, { quality: imageCompressionToLowQualityPercentage })
      .withMetadata()
      .toBuffer();
    //
    const mediumQualityFile = await sharp(profilePictureBuffer)
      .toFormat(imageInfos.ext as any, { quality: imageCompressionToMediumQualityPercentage })
      .withMetadata()
      .toBuffer();
    //
    const bestQualityFile = await sharp(profilePictureBuffer)
      .toFormat(imageInfos.ext as any, { quality: imageCompressionToBestQualityPercentage })
      .withMetadata()
      .toBuffer();
    //

    await Promise.all([
      storeFile(profilePictureQualities.lowQualityFileName, lowQualityFile),
      storeFile(profilePictureQualities.mediumQualityFileName, mediumQualityFile),
      storeFile(profilePictureQualities.bestQualityFileName, bestQualityFile),
    ]);
  }

  reply.status(200).send({
    user: {
      displayName,
      userName,
      bio,
      profilePicture: user.profilePicture,
    },
  });
};

//
//
//
//
//

export const getUserByUserName = async (
  request: FastifyRequest<{ Params: { userName: string } }>,
  reply: FastifyReply
) => {
  const userName = await userNameValidator.validate(request.params.userName);
  const userId = request.session.userId;

  const user = await UserModel.findOne({ userName, active: true }).select([
    "id",
    "displayName",
    "userName",
    "profilePicture.lowQualityFileName",
    "profilePicture.bestQualityFileName",
    "postsCount",
    "followersCount",
    "followingCount",
    "bio",
  ]);

  if (user === null) {
    throw Error("User not found");
  }

  const follow = await FollowModel.findOne({ followedId: user.id, followerId: userId });
  const checkIfHasBlockedLoggedInUser = await BlockModel.findOne({
    blockerId: user.id,
    blockedId: userId,
  });
  const checkIfBlockedByLoggedInUser = await BlockModel.findOne({
    blockerId: userId,
    blockedId: user.id,
  });

  let followedByLoggedInUser = undefined;
  let blockedByLoggedInUser = undefined;
  let hasBlockedLoggedInUser = undefined;

  if (!user._id.equals(userId)) {
    if (follow !== null) followedByLoggedInUser = true;
    else followedByLoggedInUser = false;
    if (checkIfHasBlockedLoggedInUser !== null) hasBlockedLoggedInUser = true;
    else hasBlockedLoggedInUser = false;
    if (checkIfBlockedByLoggedInUser !== null) blockedByLoggedInUser = true;
    else blockedByLoggedInUser = false;
  }

  const mutatedUser: any = {
    ...user.toObject(),
  };

  if (hasBlockedLoggedInUser) {
    delete mutatedUser.bio;
    delete mutatedUser.postsCount;
    delete mutatedUser.followingCount;
    delete mutatedUser.followersCount;
  }

  const userToSend = {
    ...mutatedUser,
    followedByLoggedInUser,
    blockedByLoggedInUser,
    hasBlockedLoggedInUser,
  };

  reply.send({ user: userToSend });
};

//
//
//
//
//

export const getUserFollowers = async (
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const userId = await idValidator.validate(request.params.userId);

  const limit = query.limit || 10;

  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const follows = await FollowModel.find({
    followedId: userId,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select(["followerId"])
    .populate({
      path: "follower",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .skip(startIndex)
    .limit(limit + 1)
    .sort({ createdAt: "desc" });

  const nextPage = follows.length > limit ? page + 1 : undefined;

  if (nextPage) {
    follows.pop();
  }

  reply.send({ follows, nextPage, page });
};

//
//
//
//
//

export const getUserFollowing = async (
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const userId = await idValidator.validate(request.params.userId);

  const limit = query.limit || 10;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const follows = await FollowModel.find({
    followerId: userId,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select(["followedId"])
    .populate({
      path: "followed",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .skip(startIndex)
    .limit(limit + 1)
    .sort({ createdAt: "desc" });

  const nextPage = follows.length > limit ? page + 1 : undefined;

  if (nextPage) {
    follows.pop();
  }

  reply.send({ follows, nextPage, page });
};

//
//
//
//
//

export const getUserPosts = async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
  const userId = await idValidator.validate(request.params.userId);
  const loggedInUserId = request.session.userId;

  const checkIfFetchedUserBlockedLoggedInUser = await BlockModel.exists({
    blockerId: userId,
    blockedId: loggedInUserId,
  });

  if (checkIfFetchedUserBlockedLoggedInUser !== null) {
    throw Error(" This user blocked you");
  }

  const query = await paginationQueryParamsValidator.validate(request.query);

  const limit = query.limit || 10;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const filter: any = {
    visible: true,
    publisherId: userId,
    createdAt: { $lte: query.firstPageRequestedAt },
  };

  const posts = await PostModel.find(filter)
    .select([
      "id",
      "medias.mimetype",
      "medias.lowQualityFileName",
      "medias.mediumQualityFileName",
      "medias.bestQualityFileName",
      ,
      "likesCount",
      "commentsCount",
    ])
    .skip(startIndex)
    .limit(limit + 1)
    .sort({ createdAt: "desc" });

  const nextPage = posts.length > limit ? page + 1 : undefined;

  if (nextPage) {
    posts.pop();
  }

  reply.send({ posts, nextPage, page });
};

//
//
//
//
//

export const getUserLikedPosts = async (
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const userId = await idValidator.validate(request.params.userId);
  const loggedInUserId = request.session.userId;

  if (!loggedInUserId.equals(userId)) {
    throw Error("User's likes are private");
  }

  const limit = query.limit || 10;
  const page = query.page || 1;
  const startIndex = (page - 1) * limit;

  const postLikes = await PostLikeModel.find({
    likerId: userId,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select(["postId"])
    .populate({
      path: "post",
      match: { visible: true },
      select: [
        "id",
        "medias.mimetype",
        "medias.lowQualityFileName",
        "medias.mediumQualityFileName",
        "medias.bestQualityFileName",
        ,
        "likesCount",
        "commentsCount",
      ],
    })
    .sort({ createdAt: "desc" })
    .skip(startIndex)
    .limit(limit + 1);

  const nextPage = postLikes.length > limit ? page + 1 : undefined;

  if (nextPage) {
    postLikes.pop();
  }

  // postLikes[0].post = null;

  reply.send({ postLikes, nextPage, page });
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

export const seeNotifications = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.session.userId;

  await UserModel.updateOne(
    { _id: userId },
    { $set: { unseenNotificationsCount: 0, notificationsSeenAt: new Date() } }
  );

  await NotificationModel.updateMany(
    { receiverId: userId, seen: false },
    {
      $set: {
        seen: true,
        seenAt: new Date(),
      },
    }
  );
  reply.send({
    message: "Success",
  });
};

//
//
//
//
//

export const getUserFollowingTimeLine = async (request: FastifyRequest, reply: FastifyReply) => {
  const query = await paginationQueryParamsValidator.validate(request.query);
  const limit = query.limit;
  const page = query.page || 1;
  const userId = request.session.userId;
  const following = await FollowModel.find({ followerId: userId });
  const followingIds = following.map(({ followedId }) => followedId?.toString());
  const startIndex = (page - 1) * limit;
  const posts = await PostModel.find({
    publisherId: { $in: followingIds },
    visible: true,
    createdAt: { $lte: query.firstPageRequestedAt },
  })
    .select([
      "id",
      "text",
      "medias.bestQualityFileName",
      "medias.mediumQualityFileName",
      "medias.lowQualityFileName",
      "medias.mimetype",
      "likesCount",
      "commentsCount",
      "publisherId",
      "createdAt",
    ])
    .populate({
      path: "publisher",
      select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
    })
    .skip(startIndex)
    .sort({ createdAt: "desc" })
    .limit(limit + 1);
  const nextPage = posts.length > limit ? page + 1 : undefined;

  if (nextPage) {
    posts.pop();
  }

  const postIds = posts.map((post) => post.id);

  const postIdsInPostsListLoggedInUserLiked = (
    await PostLikeModel.find({ postId: { $in: postIds }, likerId: userId })
  ).map(({ postId }) => postId?.toString());

  const postsToSend: any[] = [];

  for (const post of posts) {
    let someComments = await PostCommentModel.find({ postId: post.id, parentPostCommentId: { $exists: false } })
      .select([
        "id",
        "commenterId",
        "text",
        "descendantPostCommentsCount",
        "likesCount",
        "createdAt",
        "mostDistantParentPostCommentId",
        "parentPostCommentId",
        "postId",
      ])
      .limit(3)
      .populate({
        path: "commenter",
        select: ["id", "displayName", "userName", "profilePicture.lowQualityFileName"],
      })
      .sort({ createdAt: "desc" });

    const commentIds = someComments.map(({ id }) => id);

    const postCommentIdsInPostCommentsListLoggedInUserLiked = (
      await PostCommentLikeModel.find({ postCommentId: { $in: commentIds }, likerId: userId })
    ).map(({ postCommentId }) => postCommentId?.toString());

    someComments = someComments.map((comment) => ({
      ...comment.toObject(),
      likedByLoggedInUser: postCommentIdsInPostCommentsListLoggedInUserLiked.includes(comment.id) ? true : false,
    })) as any;

    postsToSend.push({
      ...post.toObject(),
      likedByLoggedInUser: postIdsInPostsListLoggedInUserLiked.includes(post.id) ? true : false,
      someComments,
    });
  }

  reply.send({ posts: postsToSend, page, nextPage });
};

//
//
//
//
//

export const changePassword = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = await changeUserPasswordValidator.validate(request.body);
  const userId = request.session.userId;

  const user = await UserModel.findById(userId).select("+password");

  if (!user) {
    throw Error("User not found");
  }

  const isCurrentPasswordValid = comparePlainTextToHashedText(data.currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new FieldException("currentPassword", { message: "Incorrect password" });
  }

  user.password = hash(data.newPassword);

  await user.save();

  const sessionId = request.session.sessionId;

  await SessionModel.deleteMany({
    userId,
    sessionId: { $ne: sessionId },
  });

  reply.send({ message: "Password changed" });
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

export const changeUsername = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = await changeUsernameValidator.validate(request.body);
  const userId = request.session.userId;

  const user = await UserModel.findById(userId).select("+password");

  if (!user) {
    throw Error("User not found");
  }

  const isCurrentPasswordValid = comparePlainTextToHashedText(data.password, user.password);
  if (!isCurrentPasswordValid) {
    throw new FieldException("password", { message: "Incorrect password" });
  }

  if (data.newUsername === user.userName) {
    throw new FieldException("newUsername", { message: "This username is your current username" });
  }

  try {
    user.userName = data.newUsername;
    await user.save();
  } catch (error) {
    throw new FieldException("newUsername", { message: "This username is already taken" });
  }

  reply.send({ user: { userName: user.userName } });
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

export const changeEmail = async (
  request: FastifyRequest<{
    Body: {
      newEmail: string;
      password: string;
    };
  }>,
  reply: FastifyReply
) => {
  const currentEmailVerificationToken = await getEmailVerificationTokenFromRequest(request);
  const userId = request.session.userId;

  const ip = request.ip;
  const agent = request.headers["user-agent"];

  let email = "";

  if (request.body.hasOwnProperty("newEmail") && request.body.hasOwnProperty("password")) {
    email = await emailValidator.validate(request.body.newEmail);
    const password = await passwordValidator.validate(request.body.password);
    const user = await UserModel.findById(userId).select("+password");
    if (user === null) {
      throw Error("Something went wrong, try later.");
    }

    const isPasswordExact = comparePlainTextToHashedText(password, user.password);

    if (!isPasswordExact) {
      throw new FieldException("password", { message: "Incorrect password" });
    }

    const userWithTheNewEmail = await UserModel.findOne({ email, active: true }).select("+email");

    if (userWithTheNewEmail !== null) {
      throw new FieldException("newEmail", { message: "Email already taken" });
    }
  } else if (currentEmailVerificationToken) {
    const { id } = verifyEmailVerificationToken(currentEmailVerificationToken);
    const emailVerification = await EmailVerificationModel.findOne({ _id: id, verified: false, ip, agent });
    email = emailVerification.changeEmailData.email;
  } else {
    throw Error("Something went wrong, try later.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastSuccessfullChangeEmailRequestOfTheDay = await EmailVerificationModel.countDocuments({
    purpose: emailVerificationPurposes.changeEmail,
    userId,
    createdAt: {
      $gte: today.toISOString(),
      $lt: addDay(today, 1).toISOString(),
    },
    verified: true,
  });

  if (lastSuccessfullChangeEmailRequestOfTheDay >= 5) {
    throw Error("Something went wrong, try later.");
  }

  const lastChangeEmailRequestOfTheDayNotVerified = await EmailVerificationModel.countDocuments({
    purpose: emailVerificationPurposes.changeEmail,
    userId,
    createdAt: {
      $gte: today.toISOString(),
      $lt: addDay(today, 1).toISOString(),
    },
    ip,
    verified: false,
  });

  if (lastChangeEmailRequestOfTheDayNotVerified >= 20) {
    throw Error("Something went wrong, try later.");
  }

  const otp = generateOtp();

  //
  //
  const emailVerification = await EmailVerificationModel.create({
    userId,
    otp,
    purpose: emailVerificationPurposes.changeEmail,
    changeEmailData: {
      email,
    },
    ip,
    agent,
  });

  const emailVerificationToken = generateEmailVerificationToken(emailVerification.id);

  await sendMail({
    subject: "Email change request",
    text: "Verification otp for email change",
    to: email,
    html: render(EmailVerification({ otp })),
  });

  const jsonResponse = { message: "Success" };
  jsonResponse[emailVerificationTokenFieldName] = emailVerificationToken;

  reply
    //! .setCookie(emailVerificationTokenCookie.name, emailVerificationToken, emailVerificationTokenCookie.options)
    .send(jsonResponse);
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

export const changeEmailVerification = async (
  request: FastifyRequest<{ Body: { otp: string } }>,
  reply: FastifyReply
) => {
  let emailVerificationToken = await getEmailVerificationTokenFromRequest(request);
  const otp = await otpValidator.validate(request.body.otp);

  const { id } = verifyEmailVerificationToken(emailVerificationToken);

  const emailVerification = await EmailVerificationModel.findOne({
    _id: id,
    purpose: emailVerificationPurposes.changeEmail,
  });
  //
  //
  if (!emailVerification) {
    throw Error("Not found");
  }
  //
  //
  if (emailVerification.verified === true) {
    throw Error("Otp already verified");
  }
  //
  //
  if (emailVerification.attempt >= maxNumberOfAttemptsForOtp) {
    throw Error("The maximum number of attempts has been reached");
  }
  //
  //
  if (otp !== emailVerification.otp) {
    await EmailVerificationModel.findByIdAndUpdate(id, { $inc: { attempt: 1 } });
    throw Error("Icorrect otp");
  }

  //
  //

  const user = await UserModel.findOne({ _id: emailVerification.userId, active: true }).select("+email");

  //
  //

  if (user === null) {
    throw Error("User not found");
  }

  //
  //

  emailVerification.attempt = emailVerification.attempt + 1;
  emailVerification.verified = true;
  emailVerification.verifiedAt = new Date();
  await emailVerification.save();

  //
  //

  user.email = emailVerification.changeEmailData.email;
  //
  //
  try {
    await user.save();
  } catch (error) {
    throw Error("Email already taken");
  }

  reply
    // .clearCookie(emailVerificationTokenCookie.name)
    .send({
      message: "Email changed",
    });
};
