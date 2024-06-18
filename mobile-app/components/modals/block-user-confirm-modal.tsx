import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { User } from "@/types/user";
import { Button } from "../core/button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useNetInfo } from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { Post } from "@/types/post";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { homeScreenName } from "@/constants/screens-names-constants";
import {
  ConfirmModalDescription,
  ConfirmModal,
  ConfirmModalFooter,
  ConfirmModalTitle,
} from "../core/confirm-modal";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";

export const BlockUserConfirmModal = NiceModal.create(
  ({ user, currentScreenName }: { user: User; currentScreenName: string }) => {
    const modal = useModal();

    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const webSocket = useAtomValue(webSocketAtom);

    const network = useNetInfo();

    const blockUser = () => {
      if (!network.isConnected) {
        return;
      }
      setIsLoading(true);
      webSocket?.emit("block-user", {
        userToBlockId: user?.id,
      });
    };

    const blockUserSuccessEvent = (eventData: {
      blockedUser: User;
      userWhoBlocked: User;
    }) => {
      if (eventData.blockedUser.id === user?.id) {
        modal.hide();
        setIsLoading(false);

        if (currentScreenName === homeScreenName) {
          queryClient.setQueryData(
            [followingTimelineQueryKey],
            (qData: any) => {
              return {
                ...qData,
                pages: qData.pages.map((pageData: any) => ({
                  ...pageData,
                  posts: pageData.posts.filter(
                    (postInData: Post) => postInData.publisherId !== user.id
                  ),
                })),
              };
            }
          );
        }
      }
    };

    const blockUserErrorEvent = (eventData: { message: string }) => {
      Toast.show({ text2: eventData.message });
      setIsLoading(false);
    };

    useListenWebsocketEvent({
      name: "block-user-success",
      handler: blockUserSuccessEvent,
    });
    useListenWebsocketEvent({
      name: "block-user-error",
      handler: blockUserErrorEvent,
    });

    return (
      <ConfirmModal hide={modal.hide} visible={modal.visible}>
        <ConfirmModalTitle>Block @{user.userName}</ConfirmModalTitle>
        <ConfirmModalDescription>Are you sure ?</ConfirmModalDescription>

        <ConfirmModalFooter>
          <Button
            fullWidth
            size="lg"
            text="Block"
            onPress={blockUser}
            isLoading={isLoading}
          />
          <Button
            fullWidth
            size="lg"
            variant="outline"
            text="Cancel"
            onPress={modal.hide}
            disabled={isLoading}
          />
        </ConfirmModalFooter>
      </ConfirmModal>
    );
  }
);
