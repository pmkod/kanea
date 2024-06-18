import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { Discussion } from "@/types/discussion";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useNetwork } from "@mantine/hooks";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../core/alert-dialog";
import { Button } from "../core/button";
import { useToast } from "../core/use-toast";

export const DeleteDiscussionModal = NiceModal.create(
  ({ discussion }: { discussion: Discussion }) => {
    const modal = useModal();
    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const webSocket = useAtomValue(webSocketAtom);

    const { toast } = useToast();

    const networkStatus = useNetwork();
    const [isLoading, setIsLoading] = useState(false);

    const deleteDiscussion = () => {
      if (networkStatus.online) {
        setIsLoading(true);
        webSocket?.emit("delete-discussion", {
          discussionId: discussion.id,
        });
      }
    };

    const deleteDiscussionSuccessEvent = () => {
      setIsLoading(false);
      modal.hide();
    };

    const deleteDiscussionErrorEvent = ({ message }: { message: string }) => {
      setIsLoading(false);
      modal.hide();
      toast({ colorScheme: "destructive", description: message });
    };

    useEffect(() => {
      webSocket?.on("delete-discussion-success", deleteDiscussionSuccessEvent);
      webSocket?.on("delete-discussion-error", deleteDiscussionErrorEvent);
      return () => {
        webSocket?.off(
          "delete-discussion-success",
          deleteDiscussionSuccessEvent
        );
        webSocket?.off("delete-discussion-error", deleteDiscussionErrorEvent);
      };
    }, [webSocket]);

    return (
      <AlertDialog open={modal.visible} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete discussion</AlertDialogTitle>
            <AlertDialogDescription>
              This conversation will be deleted fo you. Other people in the
              discussion will still be able to see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={() => deleteDiscussion()} isLoading={isLoading}>
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);
