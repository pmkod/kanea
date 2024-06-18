import { unlink, writeFile } from "node:fs/promises";
import { discussionFileDestination, messageFilesDestination, publicFileDestination } from "../constants/file-constants";
import path from "path";
import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import { RecordNotFoundException } from "./exception-utils";
import mime from "mime";
import { APPWRIRE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_BUCKET_ID, APPWRITE_ENDPOINT, NODE_ENV } from "../configs";
import { nodeEnvs } from "../constants/node-envs-constants";
import { Client, Storage, InputFile } from "node-appwrite";
import { fileNameValidator } from "../validators/file-validator";
import { Readable, Stream } from "stream";
// Payload
// Functions

const appwriteClient = new Client();

appwriteClient.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRIRE_PROJECT_ID).setKey(APPWRITE_API_KEY);

const appwriteStorage = new Storage(appwriteClient);

export const storeFile = async (name: string, buffer: Buffer) => {
  if (NODE_ENV === nodeEnvs.production) {
    let fileAlreadyExist = false;
    try {
      await appwriteStorage.getFile(APPWRITE_BUCKET_ID, name);
      fileAlreadyExist = true;
    } catch (error) {}
    try {
      if (fileAlreadyExist) {
        await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID, name);
      }
    } catch (error) {
      console.log(error);
    }
    try {
      await appwriteStorage.createFile(APPWRITE_BUCKET_ID, name, InputFile.fromBuffer(buffer, name));
    } catch (error) {
      console.log(error);
    }
  } else {
    await writeFile(publicFileDestination + name, buffer);
  }
};

//

export const deleteFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID, name);
    } else {
      await unlink(path.join(publicFileDestination, name));
    }
  } catch (error) {}
};

//

export const storeMessageFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await appwriteStorage.createFile(APPWRITE_BUCKET_ID, name, InputFile.fromBuffer(buffer, name));
    } else {
      await writeFile(path.join(messageFilesDestination, name), buffer);
    }
  } catch (error) {}
};

//

export const deleteMessageFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID, name);
    } else {
      await unlink(path.join(messageFilesDestination, name));
    }
  } catch (error) {}
};

export const storeDiscussionFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await appwriteStorage.createFile(APPWRITE_BUCKET_ID, name, InputFile.fromBuffer(buffer, name));
    } else {
      await writeFile(path.join(discussionFileDestination, name), buffer);
    }
  } catch (error) {}
};

//

export const deleteDiscussionFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await appwriteStorage.deleteFile(APPWRITE_BUCKET_ID, name);
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
    const arrBuffer = await appwriteStorage.getFileDownload(APPWRITE_BUCKET_ID, fileName);
    const buffer = Buffer.from(arrBuffer);

    if (!range) {
      reply.type(mimeType).send(buffer);
      return;
    }

    const fileSize = buffer.byteLength;
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

    // reply.raw.writeHead(206, headers);
    reply.headers(headers);
    // reply
    reply.send(buffer.subarray(start, end));
    // const stream = fs.createReadStream(buffer.subarray(start, end));
    // const stream = new Readable();
    // new ReadableStream(arrBuffer).
    // stream.pipe(reply.raw);
    // stream.push();
    // stream.
    // stream.read(2)
    // const fileStream = fs.createReadStream(buffer, { start, end, autoClose: true });
    // reply.raw.pipe()
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
