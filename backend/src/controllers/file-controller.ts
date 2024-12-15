import { FastifyRequest, FastifyReply } from "fastify";
import { streamFile } from "../utils/file-utils";
import { S3_PUBLICS_BUCKET_NAME } from "../configs";

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
    bucketName: S3_PUBLICS_BUCKET_NAME,
  });
};
