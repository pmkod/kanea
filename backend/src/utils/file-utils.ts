import { unlink, writeFile } from "node:fs/promises";
import { discussionFileDestination, messageFilesDestination, publicFileDestination } from "../constants/file-constants";
import path from "path";
import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import { RecordNotFoundException } from "./exception-utils";
import mime from "mime";
import { F0_SECRET_KEY, NODE_ENV } from "../configs";
import { nodeEnvs } from "../constants/node-envs-constants";
import { fileNameValidator } from "../validators/file-validator";
import { f0, File0 } from "file0";
import { Readable } from "stream";

import { pipeline } from "stream";

f0.config.secretKey = F0_SECRET_KEY;

export const storeFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await f0.set(name, buffer);
    } else {
      await writeFile(publicFileDestination + name, buffer);
    }
  } catch (error) {
    console.log(error);
  }
};

//

export const deleteFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await f0.delete(name);
    } else {
      await unlink(path.join(publicFileDestination, name));
    }
  } catch (error) {}
};

//

export const storeMessageFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await f0.set(name, buffer);
    } else {
      await writeFile(path.join(messageFilesDestination, name), buffer);
    }
  } catch (error) {}
};

//

export const deleteMessageFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await f0.delete(name);
    } else {
      await unlink(path.join(messageFilesDestination, name));
    }
  } catch (error) {}
};

export const storeDiscussionFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await f0.set(name, buffer);
    } else {
      await writeFile(path.join(discussionFileDestination, name), buffer);
    }
  } catch (error) {}
};

//

export const deleteDiscussionFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await f0.delete(name);
    } else {
      await unlink(path.join(discussionFileDestination, name));
    }
  } catch (error) {}
};

export const streamFile = async ({
  request,
  reply,
  fileName,
  fileDir,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  fileName: string;
  fileDir: string;
}) => {
  fileName = await fileNameValidator.validate(fileName);
  const mimeType = mime.getType(fileName);
  const range = request.headers.range;
  if (NODE_ENV === nodeEnvs.production) {
    const arrBuffer = await f0.get(fileName, { as: "buffer" });
    const buffer = Buffer.from(arrBuffer);
    const fileSize = buffer.byteLength;
    if (!range) {
      reply.type(mimeType).send(buffer);
      return;
    }

    const chunkSize = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": mimeType,
    };

    reply.raw.writeHead(206, headers);
    // Readable.fromWeb(buffer)
    // const indexOfNullByte = buffer.filter(a);
    const stream = fs.createReadStream(buffer, { start, end });
    return reply.send(stream);
    // return pipeline(stream, reply.raw, (err) => {
    //   console.log(err);
    //   throw Error("File stream error");
    // });
    // const readable = new Readable();
    // readable._read = () => {};
    // readable.push(buffer);
    // readable.push(null);
    // const stream = fs.createReadStream(buffer, { start, end });
    // stream.pipe(reply.raw.socket);
    // reply.send(request.raw)
  } else {
    const filePath = fileDir + fileName;
    const fileExist = fs.existsSync(filePath);

    if (!fileExist) {
      throw new RecordNotFoundException("File not found");
    }

    if (!range) {
      const file = fs.readFileSync(filePath);
      reply.type(mimeType).send(file);
      return;
    }

    const fileSize = fs.statSync(filePath).size;
    const chunkSize = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, fileSize - 1);
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": mimeType,
    };

    reply.raw.writeHead(206, headers);
    const fileStream = fs.createReadStream(filePath, { start, end });
    fileStream.pipe(reply.raw);
  }
};

// export const downloadFiles = async () => {
//   const dir = process.cwd() + "/files";
//   const downloadDirExist = fs.existsSync(dir);
//   if (!downloadDirExist) {
//     fs.mkdirSync(dir);
//   }

//   const { files, total } = await appwriteStorage.listFiles(APPWRITE_BUCKET_ID, []);
//   let filesDownloaded = 0;
//   for (const file of files) {
//     const arrBuffer = await appwriteStorage.getFileDownload(APPWRITE_BUCKET_ID, file.name);
//     const buffer = Buffer.from(arrBuffer);
//     fs.writeFileSync(dir + "/" + file.name, buffer);
//     console.log(file.name + " downloaded");
//     await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID, file.name);
//     filesDownloaded += 1;
//   }

//   console.log(filesDownloaded);
// };

// export const uploadFilesToFile0 = async () => {
//   const dir = process.cwd() + "/files/";
//   const files = fs.readdirSync(dir);
//   // console.log(files);
//   for (const fileName of files) {
//     try {
//       const file = fs.readFileSync(dir + fileName);
//       await f0.set(fileName, file);
//     } catch (error) {}
//   }
//   // await f0.set("", "")
// };
