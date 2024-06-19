import { readEnvVar } from "../utils/env-utils";

export const PORT = Number(readEnvVar("PORT"));
// export const WEBSOCKET_SERVER_PORT = Number(readEnvVar("WEBSOCKET_SERVER_PORT"));
// export const API_SERVER_DOMAIN = readEnvVar("API_SERVER_DOMAIN");
// export const WEBSOCKET_SERVER_URL = readEnvVar("WEBSOCKET_SERVER_URL");

export const EMAIL_VERIFICATION_TOKEN_KEY = readEnvVar("EMAIL_VERIFICATION_TOKEN_KEY");

export const MONGODB_URL = readEnvVar("MONGODB_URL");

export const CLIENT_APP_ORIGIN = readEnvVar("CLIENT_APP_ORIGIN");

export const GOOGLE_APP_PASSWORD = readEnvVar("GOOGLE_APP_PASSWORD");
export const MY_EMAIL = readEnvVar("MY_EMAIL");
export const NODE_ENV = readEnvVar("NODE_ENV");

export const F0_SECRET_KEY = readEnvVar("F0_SECRET_KEY");
