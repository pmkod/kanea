import { unlink, writeFile } from "node:fs/promises";
import { discussionFileDestination, messageFilesDestination, publicFileDestination } from "../constants/file-constants";
import path from "path";
import { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";
import { RecordNotFoundException } from "./exception-utils";
import mime from "mime";
import { NODE_ENV, SUPABASE_API_KEY, SUPABASE_PROJECT_URL } from "../configs";
import { nodeEnvs } from "../constants/node-envs-constants";
import {
  discussionsFilesBucketName,
  messagesFilesBucketName,
  publicFilesBucketName,
} from "../constants/bucket-constants";
import { fileNameValidator } from "../validators/file-validator";
import { createClient } from "@supabase/supabase-js";
import { Readable } from "stream";

// Create Supabase client
const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_API_KEY, {});

export const storeFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await supabase.storage.from(publicFilesBucketName).upload(name, buffer, {
        upsert: true,
        contentType: mime.getType(name),
      });
    } else {
      await writeFile(publicFileDestination + name, buffer);
    }
  } catch (error) {
  }
};

//

export const deleteFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await supabase.storage.from(publicFilesBucketName).remove([name]);
    } else {
      await unlink(path.join(publicFileDestination, name));
    }
  } catch (error) {}
};

//

export const storeMessageFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      // await f0.set(name, buffer);
      await supabase.storage.from(messagesFilesBucketName).upload(name, buffer, {
        contentType: mime.getType(name),
      });
    } else {
      await writeFile(path.join(messageFilesDestination, name), buffer);
    }
  } catch (error) {}
};

//

export const deleteMessageFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await supabase.storage.from(messagesFilesBucketName).remove([name]);
    } else {
      await unlink(path.join(messageFilesDestination, name));
    }
  } catch (error) {}
};

//

export const storeDiscussionFile = async (name: string, buffer: Buffer) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      await supabase.storage.from(discussionsFilesBucketName).upload(name, buffer, {
        contentType: mime.getType(name),
      });
    } else {
      await writeFile(path.join(discussionFileDestination, name), buffer);
    }
  } catch (error) {}
};

//

export const deleteDiscussionFile = async (name: string) => {
  try {
    if (NODE_ENV === nodeEnvs.production) {
      // await f0.delete(name);
      await supabase.storage.from(discussionsFilesBucketName).remove([name]);
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
  bucketName,
}: {
  request: FastifyRequest;
  reply: FastifyReply;
  fileName: string;
  fileDir: typeof publicFileDestination | typeof discussionFileDestination | typeof messageFilesDestination;
  bucketName: typeof publicFilesBucketName | typeof discussionsFilesBucketName | typeof messagesFilesBucketName;
}) => {
  fileName = await fileNameValidator.validate(fileName);
  const mimeType = mime.getType(fileName);
  const range = request.headers.range;

  if (NODE_ENV === nodeEnvs.production) {
    // const arrBuffer = await f0.get(fileName, { as: "buffer" });
    const { data, error } = await supabase.storage.from(bucketName).download(fileName);
    if (error) {
      throw new RecordNotFoundException("Image not found");
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    // const fileSize = buffer.byteLength;
    if (!range) {
      reply.type(mimeType).send(buffer);
      return;
    }

    // reply.hijack();
    // const chunkSize = 10 ** 6;
    // const start = Number(range.replace(/\D/g, ""));
    // const end = Math.min(start + chunkSize, fileSize - 1);
    // const contentLength = end - start + 1;
    // const headers = {
    //   "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    //   "Accept-Ranges": "bytes",
    //   "Content-Length": contentLength,
    //   "Content-Type": mimeType,
    //   // "Transfer-Encoding": "chunked",
    // };
    // reply.raw.writeHead(206, headers);
    // const stream = Readable.from(buffer.subarray(start, end));
    // return stream.pipe(reply.raw);
    // const stream = Readable.from(buffer);
    reply.type(mimeType).send(buffer);
    return;
    // const stream = fs.createReadStream(buffer, { start, end });

    // stream.on("end", () => {
    // reply.raw.end();
    // reply.raw.destroy();
    // });
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
    reply.hijack();

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
