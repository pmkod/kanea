import sharp from "sharp";
import { validateGroupPictureFromBuffer } from "../validators/file-validator";
import { storeDiscussionFile } from "./file-utils";
import {
  imageCompressionToBestQualityPercentage,
  imageCompressionToLowQualityPercentage,
  imageCompressionToMediumQualityPercentage,
} from "../constants/image-constants";

export const storeDiscussionPicture = async ({ file, discussionId }: { file: Buffer; discussionId: string }) => {
  const fileType = await validateGroupPictureFromBuffer(file);
  const pictureQualities = {} as any;
  pictureQualities.lowQualityFileName =
    "d_" + discussionId + "_" + imageCompressionToLowQualityPercentage + "." + fileType.ext;
  pictureQualities.mediumQualityFileName =
    "d_" + discussionId + "_" + imageCompressionToMediumQualityPercentage + "." + fileType.ext;
  pictureQualities.bestQualityFileName =
    "d_" + discussionId + "_" + imageCompressionToMediumQualityPercentage + "." + fileType.ext;

  const lowQualityFile = await sharp(file)
    .toFormat(fileType.ext as any, { quality: imageCompressionToLowQualityPercentage })
    .withMetadata()
    .toBuffer();

  const mediumQualityFile = await sharp(file)
    .toFormat(fileType.ext as any, { quality: imageCompressionToMediumQualityPercentage })
    .withMetadata()
    .toBuffer();

  const bestQualityFile = await sharp(file)
    .toFormat(fileType.ext as any, { quality: imageCompressionToBestQualityPercentage })
    .withMetadata()
    .toBuffer();

  await Promise.all([
    await storeDiscussionFile(pictureQualities.lowQualityFileName, lowQualityFile),
    await storeDiscussionFile(pictureQualities.mediumQualityFileName, mediumQualityFile),
    await storeDiscussionFile(pictureQualities.bestQualityFileName, bestQualityFile),
  ]);

  return pictureQualities;
};
