import ms from "ms";

export const minSessionIdLength = 700;
export const maxSessionIdLength = 1000;
export const sessionMaxAgeInMs = ms("26d");
export const sessionMaxAgeInSec = sessionMaxAgeInMs / 1000;

export const sessionIdFieldName = "sessionId";
