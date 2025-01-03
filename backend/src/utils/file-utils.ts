import { unlink, writeFile } from "node:fs/promises";
import { discussionFileDestination, messageFilesDestination, publicFileDestination } from "../constants/file-constants";
import path from "path";
import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import { RecordNotFoundException } from "./exception-utils";
import mime from "mime";
import {  S3_ACCESS_KEY, S3_DISCUSSIONS_BUCKET_NAME, S3_ENDPOINT, S3_MESSAGES_BUCKET_NAME, S3_PORT, S3_PUBLICS_BUCKET_NAME, S3_SECRET_KEY } from "../configs";
import { fileNameValidator } from "../validators/file-validator";
import * as Minio from "minio";
import { Readable } from "stream";
import { readEnvVar } from "./env-utils";
import { createReadStream } from "node:fs";

// Create Supabase client




const minioClient = new Minio.Client({
	endPoint: S3_ENDPOINT,
	port: S3_PORT,
	useSSL: false,
	accessKey: S3_ACCESS_KEY,
	secretKey: S3_SECRET_KEY,
});



export const storeFile = async (name: string, buffer: Buffer) => {
  await minioClient.putObject(S3_PUBLICS_BUCKET_NAME, name, buffer);
};

//

export const deleteFile = async (name: string) => {
  await minioClient.removeObject(S3_PUBLICS_BUCKET_NAME, name);
};

//

export const storeMessageFile = async (name: string, buffer: Buffer) => {
  await minioClient.putObject(S3_MESSAGES_BUCKET_NAME, name, buffer);

};

//

export const deleteMessageFile = async (name: string) => {
  await minioClient.removeObject(S3_MESSAGES_BUCKET_NAME, name);

};

//

export const storeDiscussionFile = async (name: string, buffer: Buffer) => {
  await minioClient.putObject(S3_DISCUSSIONS_BUCKET_NAME, name, buffer);

};

//

export const deleteDiscussionFile = async (name: string) => {
  await minioClient.removeObject(S3_DISCUSSIONS_BUCKET_NAME, name);

};

export const streamFile = async ({
  request,
  reply,
  fileName,
  bucketName,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  fileName: string;
  bucketName: typeof S3_MESSAGES_BUCKET_NAME | typeof S3_DISCUSSIONS_BUCKET_NAME | typeof S3_PUBLICS_BUCKET_NAME;
}) => {  
  fileName = await fileNameValidator.validate(fileName);

  try {
    const file = await minioClient.getObject(bucketName, fileName)
    reply.header('Content-Type', 'application/octet-stream')
    return reply.send(file)
  } catch (error) {
    return reply.code(500).send({ error: 'Stream error' })
  }
};

// export const downloadFilesFromFile0 = async () => {
//   const dir = process.cwd() + "/files";
//   const downloadDirExist = fs.existsSync(dir);
//   if (!downloadDirExist) {
//     fs.mkdirSync(dir);
//   }

//   let hasNextPage = true;
//   let filesDownloaded = 0;
//   while (hasNextPage) {
//     const { files, hasMore } = await f0.list();
//     hasNextPage = hasMore;
//     for (const file of files) {
//       // const arrBuffer = await f0.get(file.name, { as: "buffer" });
//       // const buffer = Buffer.from(arrBuffer);
//       // fs.writeFileSync(dir + "/" + file.name, buffer);
//       await f0.delete(file.name);
//       filesDownloaded += 1;
//     }
//   }
// };

// export const uploadFilesToSupabase = async () => {
//   const dir = process.cwd() + "/files/";
//   const files = fs.readdirSync(dir);

//   for (const fileName of files) {
//     try {
//       const file = fs.readFileSync(dir + fileName);
//       if (fileName.startsWith("upp") || fileName.startsWith("p")) {
//         await supabase.storage.from(publicFilesBucketName).upload(fileName, file);
//       } else if (fileName.startsWith("m")) {
//         await supabase.storage.from(messagesFilesBucketName).upload(fileName, file);
//       } else if (fileName.startsWith("d")) {
//         await supabase.storage.from(discussionsFilesBucketName).upload(fileName, file);
//       }
//       fs.unlinkSync(dir + fileName);
//       // await f0.set(fileName, file);
//     } catch (error) {}
//   }

//   // await f0.set("", "")
// };
