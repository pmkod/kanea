import { CorsOptions } from "cors";
import { CLIENT_APP_ORIGIN } from ".";
import { FastifyCorsOptions } from "@fastify/cors";

const allowedHeaders = [
  "Content-Type",
  "Accept",
  "Accept-Language",
  "Origin",
  "Content-Length",
  "Range",
  "User-Agent",
  "Content-Language",
  "X-Forwarded-For",
  "X-Forwarded-Host",
  "Connection",
  "Access-Control-Allow-Origin",
  "Access-Control-Allow-Headers",
  "Content-Range",
  "Accept-Ranges",
  "Authorization",
];

export const corsOptions: FastifyCorsOptions = {
  origin: CLIENT_APP_ORIGIN,
  credentials: true,
  methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders,
};

export const webSocketCorsOptions: CorsOptions = {
  origin: CLIENT_APP_ORIGIN,
  credentials: true,
  methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders,
};
