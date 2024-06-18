import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

export const useListenWebsocketEvent = ({
  name,
  handler,
  enabled = true,
}: {
  name: string;
  handler: (eventData: any) => void;
  enabled?: boolean;
}) => {
  const webSocket = useAtomValue(webSocketAtom);

  useEffect(() => {
    if (enabled) {
      webSocket?.on(name, handler);
    }

    return () => {
      webSocket?.off(name, handler);
    };
  }, [webSocket, enabled, name, handler]);
};
