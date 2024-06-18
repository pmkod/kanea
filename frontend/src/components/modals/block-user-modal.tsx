import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { Post } from "@/types/post";
import { User } from "@/types/user";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useNetwork } from "@mantine/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { usePathname } from "next/navigation";
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

export const BlockUserModal = NiceModal.create(({ user }: { user: User }) => {
  const modal = useModal();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const handleOpenChange = (open: boolean) =>
    open ? modal.show() : modal.hide();

  const webSocket = useAtomValue(webSocketAtom);

  const { toast } = useToast();

  const network = useNetwork();
  const [isLoading, setIsLoading] = useState(false);

  const blockUser = () => {
    if (!network.online) {
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

      if (pathname === "/home") {
        queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
          return {
            ...qData,
            pages: qData.pages.map((pageData: any) => ({
              ...pageData,
              posts: pageData.posts.filter(
                (postInData: Post) => postInData.publisherId !== user.id
              ),
            })),
          };
        });
      }
    }
  };

  const blockUserErrorEvent = (eventData: { message: string }) => {
    toast({ description: eventData.message });
    setIsLoading(false);
  };

  useEffect(() => {
    webSocket?.on("block-user-success", blockUserSuccessEvent);
    webSocket?.on("block-user-error", blockUserErrorEvent);
    return () => {
      webSocket?.off("block-user-success", blockUserSuccessEvent);
      webSocket?.off("block-user-error", blockUserErrorEvent);
    };
  }, [webSocket]);

  return (
    <AlertDialog open={modal.visible} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block @{user.userName}</AlertDialogTitle>
          <AlertDialogDescription>Are you sure?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={blockUser} isLoading={isLoading}>
            Confirm
          </Button>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
