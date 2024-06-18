import { atom } from "jotai";
import { Socket } from "socket.io-client";

export const webSocketAtom = atom<Socket | undefined>(undefined);
