import { readEnvVar } from "../utils/env-utils";

export const PORT = Number(readEnvVar("PORT"));
// export const WEBSOCKET_SERVER_PORT = Number(readEnvVar("WEBSOCKET_SERVER_PORT"));
// export const API_SERVER_DOMAIN = readEnvVar("API_SERVER_DOMAIN");
// export const WEBSOCKET_SERVER_URL = readEnvVar("WEBSOCKET_SERVER_URL");

export const NODE_ENV = readEnvVar("NODE_ENV");
export const EMAIL_VERIFICATION_TOKEN_KEY = readEnvVar("EMAIL_VERIFICATION_TOKEN_KEY");

export const MONGODB_URL = readEnvVar("MONGODB_URL");
export const MONDODB_DB_NAME = readEnvVar("MONDODB_DB_NAME");

export const CLIENT_APP_ORIGIN = readEnvVar("CLIENT_APP_ORIGIN");

export const S3_DISCUSSIONS_BUCKET_NAME = readEnvVar("S3_DISCUSSIONS_BUCKET_NAME");
export const S3_MESSAGES_BUCKET_NAME = readEnvVar("S3_MESSAGES_BUCKET_NAME");
export const S3_PUBLICS_BUCKET_NAME = readEnvVar("S3_PUBLICS_BUCKET_NAME");


export const S3_ENDPOINT = readEnvVar("S3_ENDPOINT");

export const S3_ACCESS_KEY = readEnvVar("S3_ACCESS_KEY");
 
export const S3_SECRET_KEY = readEnvVar("S3_SECRET_KEY");

export const S3_PORT = Number(readEnvVar("S3_PORT"));