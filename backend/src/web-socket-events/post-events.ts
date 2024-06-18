import { Socket } from "socket.io";
import { publishPostValidator } from "../validators/post-validator";
import PostModel from "../models/post-model";
import sharp from "sharp";
import { storeFile } from "../utils/file-utils";
import UserModel from "../models/user-model";
import { validatePostMediaFromBuffer } from "../validators/file-validator";
import { acceptedImageMimetypes } from "../constants/file-constants";
import {
  imageCompressionToLowQualityPercentage,
  imageCompressionToMediumQualityPercentage,
  imageCompressionToBestQualityPercentage,
} from "../constants/image-constants";

export const publishPostEvent = async (socket: Socket, data: any) => {
  let text: string | undefined = "";
  let medias: { file: any; ext: string; mime: string }[] = [];
  try {
    const validatedData = await publishPostValidator.validate(data);
    text = validatedData.text && validatedData.text.length > 0 ? validatedData.text : undefined;
    medias = validatedData.medias as any;
  } catch (error: any) {
    socket.emit("publish-post-error", { errors: error.messages });
    return;
  }

  for (let i = 0; i < medias.length; i++) {
    try {
      const mediaInfo = await validatePostMediaFromBuffer(medias[i].file);
      medias[i] = { ...medias[i], ...mediaInfo };
    } catch (error: any) {
      socket.emit("publish-post-error", { errors: [{ message: error.message }] });
      return;
    }
  }

  const loggedInUserId = socket.data.session.userId.toString();

  const post = await PostModel.create({
    publisherId: loggedInUserId,
    text,
  });

  const postMedias: any[] = [];

  for (let i = 0; i < medias.length; i++) {
    const media = medias[i];
    const lowQualityFileName =
      "p_" + post.id + "_" + imageCompressionToLowQualityPercentage + "_" + (i + 1) + "." + media.ext;
    const mediumQualityFileName =
      "p_" + post.id + "_" + imageCompressionToMediumQualityPercentage + "_" + (i + 1) + "." + media.ext;
    const bestQualityFileName =
      "p_" + post.id + "_" + imageCompressionToBestQualityPercentage + "_" + (i + 1) + "." + media.ext;
    const mimetype = media.mime;

    if (acceptedImageMimetypes.includes(media.mime)) {
      let lowQualityFile = await sharp(media.file)
        .toFormat(media.ext as any, { quality: imageCompressionToLowQualityPercentage })
        .withMetadata()
        .toBuffer();

      let mediumQualityFile = await sharp(media.file)
        .toFormat(media.ext as any, { quality: imageCompressionToMediumQualityPercentage })
        .withMetadata()
        .toBuffer();
      let bestQualityFile = await sharp(media.file)
        .toFormat(media.ext as any, { quality: imageCompressionToBestQualityPercentage })
        .withMetadata()
        .toBuffer();

      await Promise.all([
        storeFile(lowQualityFileName, lowQualityFile),
        storeFile(mediumQualityFileName, mediumQualityFile),
        storeFile(bestQualityFileName, bestQualityFile),
      ]);
      postMedias.push({
        lowQualityFileName,
        mediumQualityFileName,
        bestQualityFileName,
        mimetype,
      });
    } else {
      const mimetype = media.mime;

      await storeFile(bestQualityFileName, media.file);
      postMedias.push({
        bestQualityFileName,
        mimetype,
      });
    }
  }
  await UserModel.findByIdAndUpdate(loggedInUserId, { $inc: { postsCount: 1 } });

  const updatedPost = await PostModel.findByIdAndUpdate(
    post.id,
    {
      $set: {
        medias: postMedias,
      },
    },
    { new: true }
  ).populate("publisher");

  const postToSend = { ...updatedPost?.toObject(), someComments: [], likedByLoggedInUser: false };

  socket.emit("publish-post-success", { post: postToSend });
};
