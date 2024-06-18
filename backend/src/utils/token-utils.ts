import jwt from "jsonwebtoken";
import { EMAIL_VERIFICATION_TOKEN_KEY } from "../configs";
import { emailVerificationTokenDurationInMs } from "../constants/token-constants";

//
//
//

//
//
//

export const generateEmailVerificationToken = (id: string) => {
  return jwt.sign({ id }, EMAIL_VERIFICATION_TOKEN_KEY!, {
    expiresIn: emailVerificationTokenDurationInMs / 1000,
  });
};

export const verifyEmailVerificationToken = (token: string) => {
  try {
    const payload = jwt.verify(token, EMAIL_VERIFICATION_TOKEN_KEY!) as any;
    return { id: payload.id };
  } catch (error) {
    throw Error("Something went wrong, try to get a new otp");
  }
};
