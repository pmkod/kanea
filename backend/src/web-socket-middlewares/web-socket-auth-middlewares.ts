import { Server, Socket } from "socket.io";
import { getActiveSession, getSessionIdFromIncomingMessage } from "../utils/session-utils";
import { buildUserSelfRoomName } from "../utils/web-socket-utils";
import { updateOnlineStatusEvent } from "../web-socket-events/online-status-events";
// import { sessionIdCookie } from "../constants/cookies-constants";

export const webSocketSessionAuth = async (socket: Socket, next: any) => {
  try {
    //! const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const sessionId = await getSessionIdFromIncomingMessage(socket.request);
    socket.data.session = await getActiveSession(sessionId);
    socket.emit("auth-to-websocket-server-success");
    await socket.join(buildUserSelfRoomName(socket.data.session.userId.toString()));

    next();
  } catch (error) {
    socket.disconnect(true);
  }
};

export const requireWebsocketAuth = async (io: Server<any>, socket: Socket, next: any) => {
  try {
    socket.data.session = await getActiveSession(socket.data.session.sessionId);
    next();
  } catch (error) {
    await updateOnlineStatusEvent(io, socket);
    socket.disconnect();
  }
};
