import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { Button } from "@/components/core/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/core/dialog";
import { Message } from "@/types/message";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useNetwork } from "@mantine/hooks";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useToast } from "../core/use-toast";

const DeleteChatMessageModal = NiceModal.create(
  ({ message }: { message: Message }) => {
    //
    const forEveryBody = "for-everybody";
    const forMe = "for-me";
    const [isDeleting, setIsDeleting] = useState(false);
    const network = useNetwork();
    //
    const webSocket = useAtomValue(webSocketAtom);
    const { toast } = useToast();
    const deleteModeChoices = [
      {
        slug: forEveryBody,
        title: "For everybody",
        description:
          "This message will be removed for all participants in the discussion. Some may have already seen or forwarded it. Removed messages can still be included in reports.",
      },
      {
        slug: forMe,
        title: "For me",
        description:
          "This message will be deleted for you. Other people will still be able to see it in the discussion.",
      },
    ];
    const modal = useModal();
    const [selectedDeleteMode, setSelectedDeleteMode] = useState<
      string | undefined
    >(undefined);

    useEffect(() => {
      if (selectedDeleteMode !== undefined) {
        setSelectedDeleteMode(undefined);
      }
    }, [modal.visible]);

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const selectDeleteMode = (mode: string) => {
      setSelectedDeleteMode(mode);
    };

    const deleteMessage = () => {
      if (!network.online) {
        toast({ colorScheme: "destructive", description: "You are offline" });
        return;
      }
      setIsDeleting(true);
      if (selectedDeleteMode === forEveryBody) {
        webSocket?.emit("delete-message-for-everybody", {
          messageId: message.id,
        });
      } else {
        webSocket?.emit("delete-message-for-me", {
          messageId: message.id,
          discussionId: message.discussionId,
        });
      }
    };

    const cancel = () => {
      modal.hide();
    };

    const receiveMessageDeletionEvent = (eventData: { message: Message }) => {
      setIsDeleting(false);
      modal.hide();
    };
    const deleteMessageForEverybodyErrorEvent = (eventData: {
      message: string;
    }) => {
      setIsDeleting(false);
      toast({ colorScheme: "destructive", description: eventData.message });
    };

    //
    //
    //
    //

    const deleteMessageForMeSuccessEvent = (eventData: {
      message: Message;
    }) => {
      setIsDeleting(false);
      modal.hide();
    };
    const deleteMessageForMeErrorEvent = (eventData: { message: string }) => {
      setIsDeleting(false);
      toast({ colorScheme: "destructive", description: eventData.message });
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
      <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
        <DialogContent className="top-4 h-max w-60">
          <DialogHeader>
            <DialogClose />
            <DialogTitle>Message deletion</DialogTitle>
          </DialogHeader>
          <div className="px-4">
            <div className="flex flex-col gap-y-4 mt-8 mb-10">
              {deleteModeChoices.map((deleteModeChoice) => (
                <DeleteModeChoice
                  key={deleteModeChoice.title}
                  {...deleteModeChoice}
                  selectDeleteMode={selectDeleteMode}
                  selectable={true}
                  selected={selectedDeleteMode === deleteModeChoice.slug}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-y-2 mb-4">
              <Button
                variant="default"
                onClick={deleteMessage}
                isLoading={isDeleting}
                disabled={selectedDeleteMode === undefined}
              >
                Delete
              </Button>
              <Button variant="outline" onClick={cancel}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default DeleteChatMessageModal;

interface DeleteModeChoiceProps {
  title: string;
  description: string;
  slug: string;
  selected: boolean;
  selectable: boolean;
  selectDeleteMode: (mode: string) => void;
}

const DeleteModeChoice = ({
  title,
  slug,
  description,
  selectDeleteMode,
  selected,
  selectable = true,
}: DeleteModeChoiceProps) => {
  const handleSelectDeleteMode = () => {
    selectDeleteMode(slug);
  };
  return (
    <div
      className={`cursor-pointer flex gap-x-3 group ${
        !selectable && "opacity-50"
      }`}
      onClick={handleSelectDeleteMode}
    >
      <div className="rounded-full border-2 border-gray-900 w-6 h-6 flex justify-center items-center">
        <div
          className={`w-3 h-3 rounded-full ${
            selected ? "bg-gray-900" : "group-hover:bg-gray-300"
          }`}
        ></div>
      </div>
      <div className="flex-1">
        <div className="leading-none pt-1 font-bold">{title}</div>
        <div className="text-sm mt-1.5 text-gray-700">{description}</div>
      </div>
    </div>
  );
};
