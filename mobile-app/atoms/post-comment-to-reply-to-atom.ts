import { PostComment } from "@/types/post-comment";
import { atom } from "jotai";

export const postCommentToReplyToAtom = atom<PostComment | undefined>(
  undefined
);
