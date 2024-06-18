import { baseFileUrl } from "@/configs";

export const buildPostImageUrl = ({ fileName }: { fileName: string }) => {
  return baseFileUrl + fileName;
};

export const buildPostVideoUrl = ({ fileName }: { fileName: string }) => {
  return baseFileUrl + fileName;
};
