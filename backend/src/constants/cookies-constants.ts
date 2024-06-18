import { CookieSerializeOptions } from "@fastify/cookie";
import { sessionIdFieldName, sessionMaxAgeInSec } from "./session-constants";
import { emailVerificationTokenDurationInSec } from "./token-constants";
import { emailVerificationTokenFieldName } from "./email-verification-constants";

type MyCookie = {
  name: string;
  options: CookieSerializeOptions;
};

// const isCookiesSecure = readEnvVar("NODE_ENV") === "production";

export const sessionIdCookie: MyCookie = {
  name: sessionIdFieldName,
  options: {
    path: "/",
    httpOnly: true,
    maxAge: sessionMaxAgeInSec,
    secure: true,
    partitioned: true,
    sameSite: "none",
  },
};

export const emailVerificationTokenCookie: MyCookie = {
  name: emailVerificationTokenFieldName,
  options: {
    path: "/",
    httpOnly: true,
    maxAge: emailVerificationTokenDurationInSec,
    sameSite: "none",
    secure: true,
    partitioned: true,
  },
};
