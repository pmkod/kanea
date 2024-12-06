import { render } from "@react-email/render";
import { emailVerificationTokenCookie } from "../constants/cookies-constants";
import { generateOtp } from "../utils/otp-utils";
import { comparePlainTextToHashedText, hash } from "../utils/hash-utils";
import { createSession, desactivateSession } from "../utils/session-utils";
import { generateEmailVerificationToken, verifyEmailVerificationToken } from "../utils/token-utils";
import {
  completeSignupValidator,
  loginValidator,
  otpValidator,
  passwordResetValidator,
  signupValidator,
} from "../validators/auth-validators";
import { addMinute } from "@formkit/tempo";
import { emailVerificationPurposes, emailVerificationTokenFieldName } from "../constants/email-verification-constants";
import { EmailVerification } from "../mail-template/email-verification";
import PasswordResetMail from "../mail-template/password-reset-mail";
import EmailVerificationModel from "../models/email-verification-model";
import UserModel from "../models/user-model";
import { Exception, FieldException } from "../utils/exception-utils";
import { sendMail } from "../utils/mail-utils";
import { emailValidator, passwordValidator } from "../validators/shared-validators";
import { LoginAttemptModel } from "../models/login-attempt-model";
import { maxNumberOfAttemptsForOtp } from "../constants/otp-constants";
import LoginMail from "../mail-template/login-mail";
import { FastifyReply, FastifyRequest } from "fastify";
import { getEmailVerificationTokenFromRequest } from "../utils/email-verification-utils";
import { sessionIdFieldName } from "../constants/session-constants";
import SessionModel from "../models/session-model";

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

export const login = async (
  request: FastifyRequest<{
    Body: Object;
  }>,
  reply: FastifyReply
) => {
  const currentEmailVerificationToken = await getEmailVerificationTokenFromRequest(request);
  const agent = request.headers["user-agent"];
  const ip = request.ip;
  let user = null;
  if (request.body.hasOwnProperty("email") && request.body.hasOwnProperty("password")) {
    const { email, password } = await loginValidator.validate(request.body);
    user = await UserModel.findOne({ email, active: true }).select("+email +password");
    let loginFailed = false;
    if (user === null) {
      loginFailed = true;
    } else {
      const passwordIsValid = comparePlainTextToHashedText(password, user.password);
      loginFailed = !passwordIsValid;
    }

    if (loginFailed) {
      await LoginAttemptModel.create({ ip, success: false, email, agent });
      throw new Exception("Email or password incorrect");
    }
    await LoginAttemptModel.create({ ip, success: true, email, agent });
  } else if (currentEmailVerificationToken) {
    const { id } = verifyEmailVerificationToken(currentEmailVerificationToken);
    const emailVerification = await EmailVerificationModel.findOne({ _id: id });
    const lastEmailVerificationForLogin = await EmailVerificationModel.find({
      purpose: emailVerificationPurposes.login,
      userId: emailVerification.userId,
      verified: false,
    }).limit(4);
    if (lastEmailVerificationForLogin.length === 4) {
      reply
        .clearCookie(emailVerificationTokenCookie.name)
        .status(400)
        .send({ errors: [{ message: "You must log in you again", reason: "must_login_again" }] });
      return;
    }
    if (emailVerification === null || emailVerification.verified) {
      throw Error("Something went wrong");
    }
    user = await UserModel.findOne({ _id: emailVerification.userId, active: true }).select("+email");
  } else {
    throw new Exception("Something went wrong");
  }

  const otp = generateOtp();

  const emailVerification = await EmailVerificationModel.create({
    otp,
    purpose: emailVerificationPurposes.login,
    ip,
    agent,
    userId: user.id,
  });

  const emailVerificationToken = generateEmailVerificationToken(emailVerification.id);

  await sendMail({
    subject: "Verification for login",
    text: "Hi, here's the verification otp to login",
    to: user.email,
    html: render(LoginMail({ otp })),
  });

  const jsonResponse = { message: "Success" };
  jsonResponse[emailVerificationTokenFieldName] = emailVerificationToken;

  reply.send(jsonResponse);
};

//
//
//
//

export const emailVerificationForLogin = async (
  request: FastifyRequest<{ Body: { otp: string } }>,
  reply: FastifyReply
) => {
  const emailVerificationToken = await getEmailVerificationTokenFromRequest(request);
  const otp = await otpValidator.validate(request.body.otp);

  const { id } = verifyEmailVerificationToken(emailVerificationToken);
  const ip = request.ip;
  const agent = request.headers["user-agent"];

  const emailVerification = await EmailVerificationModel.findOne({
    _id: id,
    purpose: emailVerificationPurposes.login,
    verified: false,
  });

  if (!emailVerification) {
    throw Error("Error");
  }

  if (emailVerification.attempt >= maxNumberOfAttemptsForOtp) {
    throw Error("The maximum number of attempts has been reached");
  }

  if (otp !== emailVerification.otp) {
    await EmailVerificationModel.findByIdAndUpdate(id, {
      $inc: { attempt: 1 },
    });
    throw Error("Incorrect otp");
  }

  emailVerification.attempt = emailVerification.attempt + 1;
  emailVerification.verified = true;
  emailVerification.verifiedAt = new Date();
  await emailVerification.save();

  const sessionId = await createSession({ userId: emailVerification.userId, agent, ip });
  const jsonResponse = {
    message: "success",
  };
  jsonResponse[sessionIdFieldName] = sessionId;
  reply
    //! .setCookie(sessionIdCookie.name, sessionId, sessionIdCookie.options)
    //! .clearCookie(emailVerificationTokenCookie.name)
    .send(jsonResponse);
};

//
//
//
//

export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  await desactivateSession(request.session.sessionId);
  reply
    //! .clearCookie(sessionIdCookie.name)
    .send({ message: "Logout success" });
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

export const signup = async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
  const { email } = await signupValidator.validate(request.body);

  const ip = request.ip;
  const agent = request.headers["user-agent"];

  const user = await UserModel.findOne({
    email,
  });

  if (user !== null) {
    throw Error("Email already taken");
  }

  const date = addMinute(new Date(), -5).toISOString();

  const lastSignups = await EmailVerificationModel.find({
    signupData: {
      email,
    },
    purpose: emailVerificationPurposes.signup,
    ip,
    agent,
    createdAt: {
      $gte: date,
    },
    verified: false,
  });

  if (lastSignups.length >= 5) {
    throw Error("Something went wrong, try later.");
  }

  const otp = generateOtp();

  const emailVerification = await EmailVerificationModel.create({
    otp,
    ip,
    purpose: emailVerificationPurposes.signup,
    agent,
    signupData: {
      email,
    },
  });

  const emailVerificationToken = generateEmailVerificationToken(emailVerification.id);

  await sendMail({
    subject: "Verification for signup",
    text: "Hi, here's the verification otp for your signup",
    to: email,
    html: render(EmailVerification({ otp })),
  });

  const jsonResponse = { message: "Success" };
  jsonResponse[emailVerificationTokenFieldName] = emailVerificationToken;

  reply.send(jsonResponse);
  //! .setCookie(emailVerificationTokenCookie.name, emailVerificationToken, emailVerificationTokenCookie.options)
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

export const emailVerificationForSignup = async (
  request: FastifyRequest<{ Body: { otp: string } }>,
  reply: FastifyReply
) => {
  const emailVerificationToken = await getEmailVerificationTokenFromRequest(request);
  const otp = await otpValidator.validate(request.body.otp);

  const { id } = verifyEmailVerificationToken(emailVerificationToken);

  const emailVerification = await EmailVerificationModel.findOne({
    _id: id,
    purpose: emailVerificationPurposes.signup,
    verified: false,
  });

  if (!emailVerification) {
    throw Error("Error");
  }

  if (emailVerification.attempt >= maxNumberOfAttemptsForOtp) {
    throw Error("The maximum number of attempts has been reached");
  }

  if (otp !== emailVerification.otp) {
    await EmailVerificationModel.findByIdAndUpdate(id, {
      $inc: { attempt: 1 },
    });
    throw Error("incorrect otp");
  }

  emailVerification.attempt = emailVerification.attempt + 1;
  emailVerification.verified = true;
  emailVerification.verifiedAt = new Date();
  await emailVerification.save();
  reply.status(200).send({
    message: "Success",
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
export const completeSignup = async (
  request: FastifyRequest<{ Body: { [key: string]: string } }>,
  reply: FastifyReply
) => {
  const { displayName, userName, password } = await completeSignupValidator.validate(request.body);
  const emailVerificationToken = await getEmailVerificationTokenFromRequest(request);

  let id = "";
  try {
    const payload = verifyEmailVerificationToken(emailVerificationToken);
    id = payload.id;
  } catch (error) {
    throw Error("Something went wrong. Please restart the signup process");
  }
  const ip = request.ip;
  const agent = request.headers["user-agent"];
  const emailVerification = await EmailVerificationModel.findOne({
    _id: id,
    purpose: emailVerificationPurposes.signup,
    verified: true,
  });

  if (!emailVerification) {
    throw Error("Error");
  }

  if (emailVerification.signupData && emailVerification.signupData.signupCompletedAt !== undefined) {
    throw Error("Error");
  }

  let user = null;
  try {
    user = await UserModel.create({
      email: emailVerification.signupData.email,
      displayName,
      userName,
      password: hash(password),
      active: true,
      emailVerified: true,
    });
  } catch (error) {
    throw new FieldException("userName", { message: "Username already taken" });
  }

  await EmailVerificationModel.updateOne(
    { _id: id },
    {
      $set: {
        userId: user!.id,
        "signupData.signupCompletedAt": new Date(),
      },
    }
  );

  const sessionId = await createSession({ userId: user!._id, agent, ip });

  const jsonResponse = {
    message: "Success",
  };
  jsonResponse[sessionIdFieldName] = sessionId;

  //! .setCookie(sessionIdCookie.name, sessionId, sessionIdCookie.options)
  //! .clearCookie(emailVerificationTokenCookie.name)
  reply.status(201).send(jsonResponse);
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

export const passwordReset = async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
  const { email } = await passwordResetValidator.validate(request.body);

  const user = await UserModel.findOne({ email, active: true }).select("+email");

  if (user === null) {
    throw Error("the email you gave us is unknown");
  }

  const ip = request.ip;
  const agent = request.headers["user-agent"];
  const date = addMinute(new Date(), -5).toISOString();

  const lastEmailVerificationForPasswordReset = await EmailVerificationModel.find({
    userId: user.id,
    purpose: emailVerificationPurposes.passwordReset,
    ip,
    agent,
    createdAt: {
      $gte: date,
    },
    verified: false,
  });

  if (lastEmailVerificationForPasswordReset.length >= 5) {
    throw Error("Something went wrong, try later.");
  }

  const otp = generateOtp();

  const emailVerification = await EmailVerificationModel.create({
    otp,
    userId: user.id,
    purpose: emailVerificationPurposes.passwordReset,
    agent,
    ip,
  });

  const emailVerificationToken = generateEmailVerificationToken(emailVerification.id);

  try {
    await sendMail({
      subject: "Password reset request",
      text: "Verification otp for password reset",
      to: user.email,
      html: render(PasswordResetMail({ otp })),
    });
  } catch (error) {}

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

export const emailVerificationForPasswordReset = async (
  request: FastifyRequest<{ Body: { otp: string } }>,
  reply: FastifyReply
) => {
  const emailVerificationToken = await getEmailVerificationTokenFromRequest(request);
  const otp = await otpValidator.validate(request.body.otp);

  const { id } = verifyEmailVerificationToken(emailVerificationToken);
  const emailVerification = await EmailVerificationModel.findOne({
    _id: id,
    purpose: emailVerificationPurposes.passwordReset,
    verified: false,
  });

  if (!emailVerification) {
    throw Error("Error");
  }
  if (emailVerification.attempt >= maxNumberOfAttemptsForOtp) {
    throw Error("The maximum number of attempts has been reached");
  }
  if (otp !== emailVerification.otp) {
    await EmailVerificationModel.findByIdAndUpdate(id, { $inc: { attempt: 1 } });
    throw Error("incorrect otp");
  }

  emailVerification.attempt = emailVerification.attempt + 1;
  emailVerification.verified = true;
  emailVerification.verifiedAt = new Date();
  await emailVerification.save();

  reply.status(200).send({ message: "Succès" });
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

export const newPassword = async (request: FastifyRequest<{ Body: { newPassword: string } }>, reply: FastifyReply) => {
  const emailVerificationToken = await getEmailVerificationTokenFromRequest(request);
  const newPassword = await passwordValidator.validate(request.body.newPassword);

  let id = "";
  try {
    let payload = verifyEmailVerificationToken(emailVerificationToken);
    id = payload.id;
  } catch (error) {
    throw Error("Something went wrong. Please restart the password reset process");
  }

  const ip = request.ip;
  const agent = request.headers["user-agent"];

  const emailVerification = await EmailVerificationModel.findOne({
    _id: id,
    purpose: emailVerificationPurposes.passwordReset,
    verified: true,
  });
  if (!emailVerification) {
    throw Error("Error");
  }
  if (emailVerification.passwordResetData.resetAt !== undefined) {
    throw Error("Aready reset");
  }

  //
  //
  const user = await UserModel.findOneAndUpdate(
    { _id: emailVerification.userId, active: true },
    {
      $set: {
        password: hash(newPassword),
      },
    },
    {
      returnOriginal: true,
    }
  ).select("+password");
  //
  if (user === null) {
    throw Error("User not found");
  }

  await EmailVerificationModel.findByIdAndUpdate(id, {
    $set: {
      passwordResetData: {
        prevPassword: user.password,
        resetAt: new Date(),
      },
    },
  });

  await SessionModel.updateMany(
    {
      userId: emailVerification.userId,
    },
    {
      $set: {
        active: false,
      },
    }
  );

  const sessionId = await createSession({ userId: emailVerification.userId, agent, ip });
  const jsonResponse = { message: "Success" };
  jsonResponse[sessionIdFieldName] = sessionId;
  reply
    //! .clearCookie(emailVerificationTokenCookie.name)
    //! .setCookie(sessionIdCookie.name, sessionId, sessionIdCookie.options)
    .send(jsonResponse);
};
