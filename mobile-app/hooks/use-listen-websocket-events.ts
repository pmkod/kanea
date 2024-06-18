import { useListenWebsocketEvent } from "./use-listen-websocket-event";

export const useListenWebsocketEvents = (
  events: {
    name: string;
    handler: (eventData: any) => void;
    enabled?: boolean;
  }[]
) => {
  for (const event of events) {
    useListenWebsocketEvent(event);
  }
};
