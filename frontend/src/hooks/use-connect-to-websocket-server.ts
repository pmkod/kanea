import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { webSocketServerUrl } from "@/configs";
import { sessionIdFieldName } from "@/constants/session-constants";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useLoggedInUser } from "./use-logged-in-user";

export const useConnectToWebSocketServer = () => {
  const [webSocket, setWebSocket] = useAtom(webSocketAtom);

  const { isSuccess } = useLoggedInUser();

  useEffect(() => {
    if (isSuccess) {
      setWebSocket(
        io(webSocketServerUrl, {
          withCredentials: true,
          secure: true,
          extraHeaders: {
            Authorization:
              "Session " + localStorage.getItem(sessionIdFieldName),
          },
        })
      );
    }
    return () => {
      webSocket?.disconnect();
    };
  }, [isSuccess]);
};
