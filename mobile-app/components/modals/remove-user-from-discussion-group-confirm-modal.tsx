import { webSocketAtom } from "@/atoms/web-socket-atom";
import { User } from "@/types/user";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useNetInfo } from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import {
  ConfirmModalDescription,
  ConfirmModal,
  ConfirmModalFooter,
  ConfirmModalTitle,
} from "../core/confirm-modal";
import { Button } from "../core/button";
import { useState } from "react";
import { discussionsQueryKey } from "@/constants/query-keys";
import { Discussion } from "@/types/discussion";
import Toast from "react-native-toast-message";
import { useListenWebsocketEvent } from "@/hooks/use-listen-websocket-event";

export const RemoveUserFromDiscussionGroupConfirmModal = NiceModal.create(
  ({ user, discussion }: { user: User; discussion: Discussion }) => {
    const modal = useModal();
    const queryClient = useQueryClient();
    const webSocket = useAtomValue(webSocketAtom);
    const network = useNetInfo();
    const [isLoading, setIsLoading] = useState(false);

    const removeUserFromTheGroupDiscussion = () => {
      if (!network.isConnected) {
        return;
      }
      setIsLoading(true);
      webSocket?.emit("remove-member-from-group-discussion", {
        discussionId: discussion.id,
        memberId: user.id,
      });
    };

    const removeMemberFromGroupDiscussionSuccessEvent = () => {
      setIsLoading(false);
      modal.hide();
      queryClient.setQueryData(
        [discussionsQueryKey, discussion.id],
        (qData: any) => {
          return {
            ...qData,
            discussion: {
              ...qData.discussion,
              members: qData.discussion.members.filter(
                ({ userId }: any) => userId !== user.id
              ),
            },
          };
        }
      );
      Toast.show({ type: "success", text2: "User removed" });
    };

    const removeMemberFromGroupDiscussionErrorEvent = ({
      message,
    }: {
      message: string;
    }) => {
      setIsLoading(false);
      // modal.hide();
      Toast.show({ type: "error", text2: message });
    };

    useListenWebsocketEvent({
      name: "remove-member-from-group-discussion-success",
      handler: removeMemberFromGroupDiscussionSuccessEvent,
    });
    useListenWebsocketEvent({
      name: "remove-member-from-group-discussion-error",
      handler: removeMemberFromGroupDiscussionErrorEvent,
    });

    return (
      <ConfirmModal hide={modal.hide} visible={modal.visible}>
        <ConfirmModalTitle>
          Remove @{user.userName} from the group
        </ConfirmModalTitle>
        <ConfirmModalDescription>Are you sure?</ConfirmModalDescription>

        <ConfirmModalFooter>
          <Button
            fullWidth
            size="lg"
            text="Confirm"
            onPress={removeUserFromTheGroupDiscussion}
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
