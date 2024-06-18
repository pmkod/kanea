import { Post } from "@/types/post";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { Button } from "../core/button";
import { useNavigation } from "@react-navigation/native";
import {
  ConfirmModal,
  ConfirmModalDescription,
  ConfirmModalFooter,
  ConfirmModalTitle,
} from "../core/confirm-modal";
import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { webSocketAtom } from "@/atoms/web-socket-atom";
import { useNetInfo } from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { Message } from "@/types/message";

export const DeleteMessageConfirmModal = NiceModal.create(
  ({ message }: { message: Message }) => {
    const modal = useModal();
    const hideModal = () => modal.hide();
    const network = useNetInfo();
    const webSocket = useAtomValue(webSocketAtom);
    const [isDeletingForMe, setIsDeletingForMe] = useState(false);
    const [isDeletingForEveryBody, setIsDeletingForEveryBody] = useState(false);

    const deleteMessageForMe = () => {
      if (!network.isConnected) {
        Toast.show({ type: "error", text2: "You are offline" });
        return;
      }
      setIsDeletingForMe(true);

      webSocket?.emit("delete-message-for-me", {
        messageId: message.id,
        discussionId: message.discussionId,
      });
    };

    const deleteMessageForEveryBody = () => {
      if (!network.isConnected) {
        Toast.show({ type: "error", text2: "You are offline" });
        return;
      }
      setIsDeletingForEveryBody(true);
      webSocket?.emit("delete-message-for-everybody", {
        messageId: message.id,
      });
    };

    const receiveMessageDeletionEvent = () => {
      setIsDeletingForEveryBody(false);
      modal.hide();
    };
    const deleteMessageForEverybodyErrorEvent = (eventData: {
      message: string;
    }) => {
      setIsDeletingForEveryBody(false);
      Toast.show({ type: "error", text2: eventData.message });
    };

    //
    //
    //
    //

    const deleteMessageForMeSuccessEvent = (eventData: {
      message: Message;
    }) => {
      setIsDeletingForMe(false);
      modal.hide();
    };
    const deleteMessageForMeErrorEvent = (eventData: { message: string }) => {
      setIsDeletingForMe(false);
      Toast.show({ type: "error", text2: eventData.message });
    };

    useEffect(() => {
      webSocket?.on(
        "delete-message-for-me-success",
        deleteMessageForMeSuccessEvent
      );
      webSocket?.on(
        "delete-message-for-me-error",
        deleteMessageForMeErrorEvent
      );
      webSocket?.on("receive-message-deletion", receiveMessageDeletionEvent);
      webSocket?.on(
        "delete-message-for-everybody-error",
        deleteMessageForEverybodyErrorEvent
      );
      return () => {
        webSocket?.off(
          "delete-message-for-me-success",
          deleteMessageForMeSuccessEvent
        );
        webSocket?.off(
          "delete-message-for-me-error",
          deleteMessageForMeErrorEvent
        );
        webSocket?.off("receive-message-deletion", receiveMessageDeletionEvent);
        webSocket?.off(
          "delete-message-for-everybody-error",
          deleteMessageForEverybodyErrorEvent
        );
      };
    }, [webSocket]);

    return (
      <ConfirmModal visible={modal.visible} hide={modal.hide}>
        <ConfirmModalTitle>Delete message</ConfirmModalTitle>
        <ConfirmModalDescription>Are you sure ?</ConfirmModalDescription>

        <ConfirmModalFooter>
          <Button
            text="Delete for me"
            onPress={deleteMessageForMe}
            isLoading={isDeletingForMe}
            disabled={isDeletingForEveryBody}
          />
          <Button
            text="Delete for every body"
            onPress={deleteMessageForEveryBody}
            isLoading={isDeletingForEveryBody}
            disabled={isDeletingForMe}
          />
          <Button
            variant="outline"
            onPress={hideModal}
            text="Cancel"
            disabled={isDeletingForMe || isDeletingForEveryBody}
          />
        </ConfirmModalFooter>
      </ConfirmModal>
    );
  }
);
