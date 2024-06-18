import { webSocketAtom } from "@/atoms/web-socket-atom";
import { discussionsQueryKey } from "@/constants/query-keys";
import { Discussion } from "@/types/discussion";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useState } from "react";
import Toast from "react-native-toast-message";
import {
  ConfirmModalDescription,
  ConfirmModal,
  ConfirmModalFooter,
  ConfirmModalTitle,
} from "../core/confirm-modal";
import { Button } from "../core/button";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";

export const ExitDiscussionGroupConfirmModal = NiceModal.create(
  ({ discussion }: { discussion: Discussion }) => {
    const modal = useModal();

    const network = useNetInfo();
    const [isLoading, setIsLoading] = useState(false);

    // const router = useRouter();
    const navigation = useNavigation();

    const queryClient = useQueryClient();

    const webSocket = useAtomValue(webSocketAtom);

    const exitGroupDiscussion = () => {
      if (!network.isConnected) {
        return;
      }
      setIsLoading(true);
      webSocket?.emit("exit-group-discussion", {
        discussionId: discussion.id,
      });
    };

    const exitGroupDiscussionSuccessEvent = () => {
      setIsLoading(false);
      modal.hide();
      queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any) => ({
            ...pageData,
            discussions: pageData.discussions.filter(
              (disc: Discussion) => disc.id !== discussion.id
            ),
          })),
        };
      });
      //   router.push("/discussions");
      navigation.goBack();
      navigation.goBack();
      Toast.show({ type: "success", text2: "User removed" });
    };

    const exitGroupDiscussionErrorEvent = ({
      message,
    }: {
      message: string;
    }) => {
      setIsLoading(false);
      Toast.show({ type: "error", text2: message });
    };

    useListenWebsocketEvent({
      name: "exit-group-discussion-success",
      handler: exitGroupDiscussionSuccessEvent,
    });
    useListenWebsocketEvent({
      name: "exit-group-discussion-error",
      handler: exitGroupDiscussionErrorEvent,
    });

    return (
      <ConfirmModal hide={modal.hide} visible={modal.visible}>
        <ConfirmModalTitle>Exit group</ConfirmModalTitle>
        <ConfirmModalDescription>Are you sure?</ConfirmModalDescription>

        <ConfirmModalFooter>
          <Button
            fullWidth
            size="lg"
            text="Confirm"
            onPress={exitGroupDiscussion}
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
