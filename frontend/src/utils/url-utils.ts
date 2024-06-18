import { baseFileUrl } from "@/configs";

export const buildProfilePictureUrl = ({ fileName }: { fileName: string }) =>
  baseFileUrl + fileName;

export const wrapAllUrlInTextWithATag = (text: string) => {
  // return text.replace(
  //   /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm,
  //   (link) => {
  //     return `<a href="${link}" target="_blank" rel="noopener noreferrer" class="border-b border-gray-300 hover:border-gray-400">${link}</a>`;
  //   }
  // );
  return text;
};
