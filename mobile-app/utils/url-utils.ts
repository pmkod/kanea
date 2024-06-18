import { baseFileUrl } from "@/configs";

export const buildPublicFileUrl = ({ fileName }: { fileName: string }) => {
  return baseFileUrl + fileName;
};
