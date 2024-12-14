import Fastify from "fastify";
import * as mongoose from "mongoose";
import fastifyCookie from "@fastify/cookie";
import { Session } from "./types/session";
import { MONDODB_DB_NAME, MONGODB_URL, PORT } from "./configs";
import { apiRoutes } from "./routes/api-routes";
import { corsOptions } from "./configs/cors";
import { handleError } from "./middlewares/error-midllewares";
import { readEnvVar } from "./utils/env-utils";
import { setupWebSocket } from "./web-socket";
import { fastifyMultipart } from "@fastify/multipart";
import { fastifyCors } from "@fastify/cors";
import { bodyLimit } from "./configs/body";
import { fastifyHelmet } from "@fastify/helmet";
import fastifyCaching from "@fastify/caching";
import fastifyRateLimit from "@fastify/rate-limit";


const fastify = Fastify({ bodyLimit, trustProxy: true });
fastify.register(fastifyRateLimit, {
  max: 200,
  timeWindow: "1 minute",
});
fastify.register(fastifyCors, corsOptions);
fastify.register(fastifyCaching, { privacy: fastifyCaching.privacy.PRIVATE });
fastify.register(fastifyHelmet, {
  crossOriginResourcePolicy: false,
});
fastify.register(fastifyCookie, { secret: readEnvVar("COOKIE_SIGNING_SECRET") });

fastify.register(fastifyMultipart, {
  attachFieldsToBody: true,
  limits: {
    files: 4,
    fileSize: bodyLimit,
  },
});
fastify.decorateRequest("session", null);
fastify.register(apiRoutes, { prefix: "/v1" });
fastify.setErrorHandler(handleError);
const startApp = async () => {
  try {
    await mongoose.connect(MONGODB_URL, {
      autoIndex: true,
      autoCreate: true,
      dbName: MONDODB_DB_NAME
    });

    fastify.listen({ port: PORT, host: readEnvVar("HOST") });

    setupWebSocket(fastify.server);
    console.log(`Server started`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

startApp();

declare module "fastify" {
  interface FastifyRequest {
    session: Session;
  }
}
