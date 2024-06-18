import vine from "@vinejs/vine";
import bytes from "bytes";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { fileTypeFromBuffer } from "file-type";
import * as mm from "music-metadata";
import { isEqual } from "radash";

dayjs.extend(duration);

//
//

export const fileNameValidator = vine.compile(vine.string().regex(new RegExp("^[a-zA-Z0-9._]+$")).maxLength(300));

//
//

const jpeg = { ext: "jpg", mime: "image/jpeg" };
const png = { ext: "png", mime: "image/png" };
const mp4 = { ext: "mp4", mime: "video/mp4" };
const avi = { ext: "avi", mime: "video/x-msvideo" };

const webm = { ext: "webm", mime: "video/webm" };
const opus = { ext: "opus", mime: "audio/opus" };
//
//

export const validatePostMediaFromBuffer = async (buffer: Buffer) => {
  //
  const maxPostImageSize = bytes("4MB");
  const maxPostVideoSize = bytes("10MB");

  if (!Buffer.isBuffer(buffer)) {
    throw Error("Invalid file");
  }
  const data = await fileTypeFromBuffer(buffer);

  if (data === undefined) {
    throw Error("Error");
  }

  const isValidImage = isEqual(data, jpeg) || isEqual(data, png);
  const isValidVideo = isEqual(data, mp4) || isEqual(data, avi);

  if (!isValidImage && !isValidVideo) {
    throw Error("Invalid file");
  }

  const mediaSize = buffer.byteLength;

  if (isValidImage) {
    if (mediaSize > maxPostImageSize) {
      throw Error(`Maximum size of image you can publish is ${bytes(maxPostImageSize).toLowerCase()}`);
    }
  } else {
    if (mediaSize > maxPostVideoSize) {
      throw Error(`Maximum size of video you can publish is ${bytes(maxPostVideoSize).toLowerCase()}`);
    }
  }

  return data;
};

//
//
//
//
//
//

export const maxProfilePictureSize = bytes("3MB");
export const validateUserProfileImageFromBuffer = async (buffer: Buffer) => {
  if (!Buffer.isBuffer(buffer)) {
    throw Error("Invalid file");
  }
  const data = await fileTypeFromBuffer(buffer);
  if (data === undefined) {
    throw Error("Error");
  }

  if (!isEqual(data, jpeg) && !isEqual(png, data)) {
    throw Error("Invalid file");
  }

  const size = buffer.byteLength;
  if (size > maxProfilePictureSize) {
    throw Error(`Maximum size of image you can put is ${bytes(maxProfilePictureSize).toLowerCase()}`);
  }
  return data;
};

//
//
//
//
//
//

export const validateGroupPictureFromBuffer = async (buffer: Buffer) => {
  const maxGroupPictureSize = bytes("4MB");
  if (!Buffer.isBuffer(buffer)) {
    throw Error("Invalid file");
  }
  const data = await fileTypeFromBuffer(buffer);
  if (data === undefined) {
    throw Error("Error");
  }

  if (!isEqual(data, jpeg) && !isEqual(png, data)) {
    throw Error("Invalid file");
  }

  const size = buffer.byteLength;
  if (size > maxGroupPictureSize) {
    throw Error(`Maximum size of image you can put is ${bytes(maxGroupPictureSize).toLowerCase()}`);
  }
  return data;
};

//
//
//
//
//
//

export const validateMessageMediaFromBuffer = async (buffer: Buffer) => {
  const maxMessageImageSize = bytes("4MB");
  const maxMessageVideoSize = bytes("10MB");

  if (!Buffer.isBuffer(buffer)) {
    throw Error("Invalid file");
  }
  const data = await fileTypeFromBuffer(buffer);

  if (data === undefined) {
    throw Error("Error");
  }

  const isValidImage = isEqual(data, jpeg) || isEqual(data, png);
  const isValidVideo = isEqual(data, mp4) || isEqual(data, avi);

  if (!isValidImage && !isValidVideo) {
    throw Error("Invalid file");
  }

  const mediaSize = buffer.byteLength;

  if (isValidImage) {
    if (mediaSize > maxMessageImageSize) {
      throw Error(`Maximum size of image you can send is ${bytes(maxMessageImageSize).toLowerCase()}`);
    }
  } else {
    if (mediaSize > maxMessageVideoSize) {
      throw Error(`Maximum size of video you can send is ${bytes(maxMessageVideoSize).toLowerCase()}`);
    }
  }

  return data;
};

//
//
//
//
//

export const validateMessageDocFromBuffer = async (buffer: Buffer) => {
  const maxMessageDocSize = bytes("4MB");

  if (!Buffer.isBuffer(buffer)) {
    throw Error("Invalid file");
  }
  const data = await fileTypeFromBuffer(buffer);

  if (data === undefined) {
    throw Error("Error");
  }

  const mediaSize = buffer.byteLength;

  if (mediaSize > maxMessageDocSize) {
    throw Error(`Maximum size of doc you can send is ${bytes(maxMessageDocSize).toLowerCase()}`);
  }
  return data;
};

//
//
//
//
//

export const validateMessageVoiceNoteFromBuffer = async (buffer: Buffer) => {
  const maxSize = bytes("4MB");
  if (!Buffer.isBuffer(buffer)) {
    throw Error("Invalid file");
  }
  const data: any = await fileTypeFromBuffer(buffer);

  const size = buffer.byteLength;

  if (data === undefined) {
    throw Error("Error");
  }

  if (!isEqual(data, webm) && !isEqual(data, opus)) {
    throw Error("Invalid file");
  }

  if (size > maxSize) {
    throw Error(`Maximum size of voice note you can send is ${bytes(maxSize).toLowerCase()}`);
  }

  const metadata = await mm.parseBuffer(buffer);

  const maxMilliseconds = 120 * 1000;

  if (metadata.format.duration && metadata.format.duration > maxMilliseconds / 1000) {
    throw Error(`Audios may not exceed ${dayjs.duration(maxMilliseconds).format("mm minutes ss sec")}`);
  }

  data.durationInMs = Math.floor(metadata.format.duration! * 1000);
  return data;
};
