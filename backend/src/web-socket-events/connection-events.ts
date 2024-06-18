import { Server, Socket } from "socket.io";
import { updateOnlineStatusEvent } from "./online-status-events";

//
//
//
//

export const disconnectEvent = async (io: Server<any>, socket: Socket) => {
  await updateOnlineStatusEvent(io, socket);
};
