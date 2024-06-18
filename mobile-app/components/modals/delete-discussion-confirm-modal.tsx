import { Discussion } from "@/types/discussion";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  ConfirmModalDescription,
  ConfirmModal,
  ConfirmModalFooter,
  ConfirmModalTitle,
} from "../core/confirm-modal";
import { Button } from "../core/button";
import { useState } from "react";
import { useNetInfo } from "@react-native-community/netinfo";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { useAtomValue } from "jotai";
import Toast from "react-native-toast-message";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";
import { useNavigation } from "@react-navigation/native";

export const DeleteDiscussionConfirmModal = NiceModal.create(
  ({ discussion }: { discussion: Discussion }) => {
    const modal = useModal();
    const navigation = useNavigation();

    const webSocket = useAtomValue(webSocketAtom);

    const networkStatus = useNetInfo();
    const [isLoading, setIsLoading] = useState(false);

    const deleteDiscussion = () => {
      if (!networkStatus.isConnected) {
        return;
      }
      setIsLoading(true);
      webSocket?.emit("delete-discussion", {
        discussionId: discussion.id,
      });
    };

    const deleteDiscussionSuccessEvent = () => {
      setIsLoading(false);
      modal.hide();
      navigation.goBack();
      navigation.goBack();
    };

    const deleteDiscussionErrorEvent = ({ message }: { message: string }) => {
      setIsLoading(false);
      Toast.show({ type: "error", text2: message });
    };
    useListenWebsocketEvent({
      name: "delete-discussion-success",
      handler: deleteDiscussionSuccessEvent,
    });
    useListenWebsocketEvent({
      name: "delete-discussion-error",
      handler: deleteDiscussionErrorEvent,
    });

    return (
      <ConfirmModal hide={modal.hide} visible={modal.visible}>
        <ConfirmModalTitle>Delete discussion</ConfirmModalTitle>
        <ConfirmModalDescription>
          This conversation will be deleted fo you. Other people in the
          discussion will still be able to see it.
        </ConfirmModalDescription>

        <ConfirmModalFooter>
          <Button
            fullWidth
            size="lg"
            text="Confirm"
            onPress={deleteDiscussion}
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
