import { Discussion } from "@/types/discussion";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { ChangeEventHandler, useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";

import { Button } from "@/components/core/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { useToast } from "../core/use-toast";

import { Input } from "@/components/core/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "../core/separator";

import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { buildDiscussionFileUrl } from "@/utils/discussion-utils";
import { editGroupDiscussionSchema } from "@/validation-schema/discussion-schema";
import { useNetwork } from "@mantine/hooks";
import { useAtomValue } from "jotai";
import { PiUsersThree } from "react-icons/pi";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";

const EditGroupDiscussionModal = NiceModal.create(
  ({ discussion }: { discussion: Discussion }) => {
    const modal = useModal();

    const { toast } = useToast();
    const network = useNetwork();

    const [isLoading, setIsLoading] = useState(false);
    const webSocket = useAtomValue(webSocketAtom);

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const selectGroupPicture = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png, image/jpeg";

      const handleProfilePictureSelect = (event: Event) => {
        const files = input.files;

        if (!files || files?.length === 0) {
          return;
        }
        const element = files[0];
        const profilePicture = {
          file: element,
          url: URL.createObjectURL(element),
        };
        form.setValue("picture", profilePicture);
        input.removeEventListener("change", handleProfilePictureSelect);
      };

      input.addEventListener("change", handleProfilePictureSelect);
      input.click();
    };

    useEffect(() => {
      // form.setValue("name", discussion.name!);
      form.setValue("picture", undefined);
    }, [modal.visible]);

    const form = useForm<z.infer<typeof editGroupDiscussionSchema>>({
      resolver: zodResolver(editGroupDiscussionSchema),
      mode: "onSubmit",
      reValidateMode: "onSubmit",

      defaultValues: {
        name: discussion?.name,
      },
    });

    const selectedPicture = form.watch("picture");

    const onSubmit: SubmitHandler<
      z.infer<typeof editGroupDiscussionSchema>
    > = async (data) => {
      if (!network.online) {
        toast({ colorScheme: "destructive", description: "You are offline" });
        return;
      }
      setIsLoading(true);
      const dataToSend = {
        name: data.name,
        discussionId: discussion.id,
      } as any;
      if (selectedPicture !== undefined) {
        dataToSend.picture = { file: data.picture?.file };
      }
      webSocket?.emit("edit-group-discussion", dataToSend);
    };

    const editGroupDiscussionSuccessEvent = (eventData: {
      discussion: Discussion;
    }) => {
      // modal.resolve();
      setIsLoading(false);
      toast({ colorScheme: "success", description: "Group discussion edited" });
      modal.hide();
    };

    const editGroupDiscussionErrorEvent = (eventData: { message: string }) => {
      setIsLoading(false);
      toast({ colorScheme: "destructive", description: eventData.message });
      modal.hide();
    };

    useEffect(() => {
      webSocket?.on(
        "edit-group-discussion-success",
        editGroupDiscussionSuccessEvent
      );
      webSocket?.on(
        "edit-group-discussion-error",
        editGroupDiscussionErrorEvent
      );

      if (modal.visible === false) {
        webSocket?.off(
          "edit-group-discussion-success",
          editGroupDiscussionSuccessEvent
        );
        webSocket?.off(
          "edit-group-discussion-error",
          editGroupDiscussionErrorEvent
        );
      }
      return () => {
        webSocket?.off(
          "edit-group-discussion-success",
          editGroupDiscussionSuccessEvent
        );
        webSocket?.off(
          "edit-group-discussion-error",
          editGroupDiscussionErrorEvent
        );
      };
    }, [webSocket, modal.visible]);

    return (
      <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogClose />
            <DialogTitle>Edit group</DialogTitle>

            <Button
              type="submit"
              onClick={() => form.handleSubmit(onSubmit)}
              isLoading={isLoading}
            >
              Save
            </Button>
          </DialogHeader>
          <div className="px-3.5 pb-6">
            <Form {...form}>
              <form>
                <div className="grid gap-4 pb-4 pt-2">
                  <Separator />

                  <div className="mb-3 grid gap-x-4 grid-cols-4">
                    <FormLabel className="mt-1 text-sm">
                      Group picture
                    </FormLabel>

                    <div className="col-span-3 flex items-center gap-x-3">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={
                            selectedPicture?.url ||
                            (discussion.picture
                              ? buildDiscussionFileUrl({
                                  discussionId: discussion.id,
                                  fileName:
                                    discussion.picture.lowQualityFileName,
                                })
                              : "")
                          }
                        />
                        <AvatarFallback className="text-4xl">
                          <PiUsersThree />
                        </AvatarFallback>
                      </Avatar>

                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={selectGroupPicture}
                      >
                        Edit group picture
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mb-3 grid gap-x-4 grid-cols-4">
                        <FormLabel className="mt-1 text-sm">Name</FormLabel>
                        <div className="col-span-3">
                          <FormControl className="w-full">
                            <Input
                              placeholder="Type a new group name"
                              size="lg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default EditGroupDiscussionModal;
