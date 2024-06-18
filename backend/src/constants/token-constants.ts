import ms from "ms";

export const emailVerificationTokenDurationInMs = ms("20m");
export const emailVerificationTokenDurationInSec = emailVerificationTokenDurationInMs / 1000;
