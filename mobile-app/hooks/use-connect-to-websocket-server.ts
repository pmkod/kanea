import { webSocketServerUrl } from "@/configs";
import { sessionIdFieldName } from "@/constants/session-constants";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useLoggedInUser } from "./use-logged-in-user";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import * as SecureStore from "expo-secure-store";

export const useConnectToWebSocketServer = () => {
  const [webSocket, setWebSocket] = useAtom(webSocketAtom);

  const { isSuccess } = useLoggedInUser({ enabled: false });

  useEffect(() => {
    if (isSuccess) {
      setWebSocket(
        io(webSocketServerUrl, {
          withCredentials: true,
          secure: true,
          extraHeaders: {
            Authorization: "Session " + SecureStore.getItem(sessionIdFieldName),
          },
        })
      );
    }
    return () => {
      webSocket?.disconnect();
    };
  }, [isSuccess]);
};
