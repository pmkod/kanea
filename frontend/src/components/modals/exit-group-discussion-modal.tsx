import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { discussionsQueryKey } from "@/constants/query-keys";
import { Discussion } from "@/types/discussion";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useNetwork } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useRouter } from "next/navigation";
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

export const ExitGroupDiscussionModal = NiceModal.create(
  ({ discussion }: { discussion: Discussion }) => {
    const modal = useModal();

    const network = useNetwork();
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();

    const webSocket = useAtomValue(webSocketAtom);

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const { toast } = useToast();

    const exitGroupDiscussion = () => {
      if (!network.online) {
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
      router.push("/discussions");
      toast({ colorScheme: "success", description: "User removed" });
    };

    const exitGroupDiscussionErrorEvent = ({
      message,
    }: {
      message: string;
    }) => {
      setIsLoading(false);
      modal.hide();
      toast({ colorScheme: "destructive", description: message });
    };

    useEffect(() => {
      webSocket?.on(
        "exit-group-discussion-success",
        exitGroupDiscussionSuccessEvent
      );
      webSocket?.on(
        "exit-group-discussion-error",
        exitGroupDiscussionErrorEvent
      );
      return () => {
        webSocket?.off(
          "exit-group-discussion-success",
          exitGroupDiscussionSuccessEvent
        );
        webSocket?.off(
          "exit-group-discussion-error",
          exitGroupDiscussionErrorEvent
        );
      };
    }, [webSocket]);

    return (
      <AlertDialog open={modal.visible} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit group</AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button onClick={() => exitGroupDiscussion()} isLoading={isLoading}>
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);
