import { FastifyRequest, FastifyReply } from "fastify";
import { publicFileDestination } from "../constants/file-constants";
import { streamFile } from "../utils/file-utils";

//
//
//
//
//

export const streamPublicFile = async (
  request: FastifyRequest<{ Params: { fileName: string } }>,
  reply: FastifyReply
) => {
  await streamFile({
    request,
    reply,
    fileName: request.params.fileName,
    fileDir: publicFileDestination,
  });
};
