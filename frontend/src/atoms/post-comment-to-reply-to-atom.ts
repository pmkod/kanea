import { atom } from "jotai";
import { PostComment } from "../types/post-comment";

export const postCommentToReplyToAtom = atom<PostComment | undefined>(
  undefined
);
