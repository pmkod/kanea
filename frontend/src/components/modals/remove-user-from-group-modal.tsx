import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { discussionsQueryKey } from "@/constants/query-keys";
import { Discussion } from "@/types/discussion";
import { User } from "@/types/user";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useNetwork } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
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

export const RemoveUserFromGroupModal = NiceModal.create(
  ({ discussion, user }: { discussion: Discussion; user: User }) => {
    const modal = useModal();
    const webSocket = useAtomValue(webSocketAtom);
    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast();

    const queryClient = useQueryClient();

    const networkStatus = useNetwork();

    const removeUserFromTheGroupDiscussion = () => {
      if (networkStatus.online) {
        setIsLoading(true);
        webSocket?.emit("remove-member-from-group-discussion", {
          discussionId: discussion.id,
          memberId: user.id,
        });
      }
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
      toast({ colorScheme: "success", description: "User removed" });
    };

    const removeMemberFromGroupDiscussionErrorEvent = ({
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
        "remove-member-from-group-discussion-success",
        removeMemberFromGroupDiscussionSuccessEvent
      );
      webSocket?.on(
        "remove-member-from-group-discussion-error",
        removeMemberFromGroupDiscussionErrorEvent
      );
      return () => {
        webSocket?.off(
          "remove-member-from-group-discussion-success",
          removeMemberFromGroupDiscussionSuccessEvent
        );
        webSocket?.off(
          "remove-member-from-group-discussion-error",
          removeMemberFromGroupDiscussionErrorEvent
        );
      };
    }, [webSocket]);

    return (
      <AlertDialog open={modal.visible} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove <span className="font-semibold">{user.displayName}</span>{" "}
              from the group
            </AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={removeUserFromTheGroupDiscussion}
              isLoading={isLoading}
            >
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
);
