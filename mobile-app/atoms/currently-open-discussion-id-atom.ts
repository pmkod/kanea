import { atom } from "jotai";

export const currentlyOpenDiscussionIdAtom = atom<string | undefined>(
  undefined
);
