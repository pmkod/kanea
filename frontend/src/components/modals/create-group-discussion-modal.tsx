"use client";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { discussionsQueryKey, usersQueryKey } from "@/constants/query-keys";
import { getUsersRequest } from "@/services/user-service";
import { Discussion } from "@/types/discussion";
import { User } from "@/types/user";
import {
  createGroupDiscussionSchema,
  maxMembersInGroupDiscussionOnCreation,
} from "@/validation-schema/discussion-schema";
import { create, useModal } from "@ebay/nice-modal-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedValue, useNetwork } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { usePathname } from "next/navigation";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { PiMagnifyingGlass, PiUsersThree, PiX } from "react-icons/pi";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import { Button } from "../core/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import { Input } from "../core/input";
import { Separator } from "../core/separator";
import { useToast } from "../core/use-toast";
import {
  UserOptionItem,
  UserOptionItemLoader,
} from "../items/user-option-item";
import { ModalSearchInput } from "../core/modal-search-input";
import { SelectedUserBubbleItem } from "../items/selected-user-bubble-item";

//
//
//
//
//
//

const CreateGroupDiscussionModal = create(() => {
  const modal = useModal();
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const network = useNetwork();
  const pathname = usePathname();

  const [isCreating, setIsCreating] = useState(false);

  const webSocket = useAtomValue(webSocketAtom);

  const queryClient = useQueryClient();

  useEffect(() => {
    form.setValue("name", "");
    form.setValue("members", []);
    form.setValue("picture", undefined);
  }, [modal.visible]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      modal.show();
    } else {
      modal.hide();
      setStep(1);
    }
  };

  const form = useForm<z.infer<typeof createGroupDiscussionSchema>>({
    resolver: zodResolver(createGroupDiscussionSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      members: [],
      name: "",
    },
  });

  const createGroupDiscussion = () => {
    if (!network.online) {
      toast({
        colorScheme: "destructive",
        description: "You are offline",
      });
      return;
    }
    setIsCreating(true);
    const memberIds = selectedUsers.map((u) => u.id);
    const data: any = {
      name: form.getValues("name"),
      memberIds,
    };
    const picture = form.getValues("picture");
    if (picture) {
      data.picture = { file: picture.file };
    }
    webSocket?.emit("create-group-discussion", data);
  };

  const next = async () => {
    const isNameValid = await form.trigger("name");
    const isPictureValid = await form.trigger("picture");
    if (isNameValid && isPictureValid) {
      setStep((prevState) => prevState + 1);
    }
  };

  const [q, setQ] = useState("");
  const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQ(e.target.value || "");
  };
  const [debouncedQ] = useDebouncedValue(q, 400);

  const { data, isSuccess, isLoading, isPending } = useQuery({
    queryKey: [usersQueryKey, `q=${debouncedQ}`],
    queryFn: () => getUsersRequest({ q: debouncedQ }),
    enabled: debouncedQ.length > 0,
  });

  const selectedPicture = form.watch("picture");
  const selectedUsers = form.watch("members");

  const selectUser = async (user: User) => {
    const membersValid =
      form.getValues("members").length < maxMembersInGroupDiscussionOnCreation;
    if (!membersValid) {
      toast({
        colorScheme: "destructive",
        description: `You can choose a maximum of ${maxMembersInGroupDiscussionOnCreation} members`,
      });
      return;
    }
    form.setValue("members", [...selectedUsers, user]);
    if (searchInputRef.current?.value) {
      searchInputRef.current.value = "";
    }
  };

  const unSelectUser = (user: User) => {
    form.setValue(
      "members",
      selectedUsers.filter((u) => u.id !== user.id)
    );
  };

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

  const isUserSelected = (user: User) => {
    return selectedUsers.find((u) => u.id === user.id) !== undefined;
  };

  const createGroupDiscussionSuccessEvent = (eventData: {
    discussion: Discussion;
  }) => {
    const discussionQueryState = queryClient.getQueryState([
      discussionsQueryKey,
    ]);
    if (
      pathname.startsWith("/discussions") &&
      discussionQueryState?.status === "success"
    ) {
      queryClient.setQueryData([discussionsQueryKey], (qData: any) => {
        return {
          ...qData,
          pages: qData.pages.map((pageData: any, pageIndex: number) => ({
            ...pageData,
            discussions:
              pageIndex === 0
                ? [eventData.discussion, ...pageData.discussions]
                : pageData.discussions,
          })),
        };
      });
    }
    toast({ colorScheme: "success", description: "Group created" });
    modal.hide();
    setIsCreating(false);
  };

  const createGroupDiscussionError = (eventData: { message: string }) => {
    toast({ colorScheme: "destructive", description: eventData.message });
    setIsCreating(false);
  };

  useEffect(() => {
    webSocket?.on(
      "create-group-discussion-success",
      createGroupDiscussionSuccessEvent
    );
    webSocket?.on("create-group-discussion-error", createGroupDiscussionError);

    return () => {
      webSocket?.off(
        "create-group-discussion-success",
        createGroupDiscussionSuccessEvent
      );
      webSocket?.on(
        "create-group-discussion-error",
        createGroupDiscussionError
      );
    };
  }, [webSocket]);

  return (
    <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogClose />
          <DialogTitle>Create group discussion</DialogTitle>
          {step === 1 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button isLoading={isCreating} onClick={createGroupDiscussion}>
              Create
            </Button>
          )}
        </DialogHeader>
        {step === 1 ? (
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
                        <AvatarImage src={selectedPicture?.url} />
                        <AvatarFallback className="text-4xl">
                          <PiUsersThree />
                        </AvatarFallback>
                      </Avatar>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectGroupPicture}
                      >
                        Choose group picture
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
                              placeholder="Choose a name for your group"
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
        ) : (
          <div className="pb-2">
            <ModalSearchInput
              placeholder="Search for a user to add"
              ref={searchInputRef}
              onChange={handleSearchInputChange}
            />
            <div
              className={`px-4 flex items-center gap-5 overflow-x-auto
              ${selectedUsers.length > 0 ? "pt-5 pb-4 border-b" : ""}
              `}
            >
              {selectedUsers.map((user) => (
                <SelectedUserBubbleItem
                  key={user.id}
                  user={user}
                  onRemove={() => unSelectUser(user)}
                />
              ))}
            </div>
            <div className="pt-2 flex flex-col gap-y-px px-2 h-[50vh] overflow-auto">
              {isLoading ? (
                <>
                  <UserOptionItemLoader />
                  <UserOptionItemLoader />
                  <UserOptionItemLoader />
                  <UserOptionItemLoader />
                  <UserOptionItemLoader />
                </>
              ) : isPending ? (
                <div className="pt-10 text-center text-gray-500">
                  Start to search user
                </div>
              ) : isSuccess && data.users.length === 0 ? (
                <div className="pt-10 text-center text-gray-500">
                  No user found for this search
                </div>
              ) : isSuccess ? (
                data.users.map((user) => (
                  <UserOptionItem
                    key={user.id}
                    user={user}
                    onSelect={selectUser}
                    disabled={isUserSelected(user)}
                  />
                ))
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

export default CreateGroupDiscussionModal;
