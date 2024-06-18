"use client";
import { Button } from "@/components/core/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { baseFileUrl } from "@/configs";
import { loggedInUserQueryKey, usersQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import {
  getUserByUserNameRequest,
  updateUserProfileRequest,
} from "@/services/user-service";
import { getNameInitials } from "@/utils/user-utils";
import { editUserProfileSchema } from "@/validation-schema/user-schemas";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import { Separator } from "../core/separator";
import { Textarea } from "../core/textarea";
import { useToast } from "../core/use-toast";

const EditUserProfileModal = NiceModal.create(() => {
  const modal = useModal();
  const { toast } = useToast();
  const params = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: loggedInUserData } = useLoggedInUser({ enabled: false });
  const { data: userData, isSuccess } = useQuery({
    queryKey: [usersQueryKey, params.userName],
    queryFn: () => getUserByUserNameRequest(loggedInUserData!.user.userName),
    refetchOnMount: true,
    enabled: loggedInUserData !== undefined,
  });
  // modal

  const form = useForm<z.infer<typeof editUserProfileSchema>>({
    resolver: zodResolver(editUserProfileSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      displayName: userData?.user.displayName,
      userName: userData?.user?.userName,
      bio: userData?.user.bio,
      // profilePicture: loggedInUser
    },
  });

  const handleOpenChange = (open: boolean) =>
    open ? modal.show() : modal.hide();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) => updateUserProfileRequest(data),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => ({
        ...qData,
        user: {
          ...qData.user,
          displayName: data.user.displayName,
          userName: data.user.userName,
          profilePicture: data.user.profilePicture,
        },
      }));
      if (data.user.userName === userData?.user.userName) {
        queryClient.setQueryData(
          [usersQueryKey, params.userName],
          (qData: any) => ({
            ...qData,
            user: {
              ...qData.user,
              displayName: data.user.displayName,
              bio: data.user.bio,
              profilePicture: data.user.profilePicture,
            },
          })
        );
      } else {
        router.push("/users/" + data.user.userName);
      }
      toast({
        colorScheme: "success",
        description: "Profile updated",
      });
      modal.hide();
    },
    onError: (error: any, variables, context) => {
      toast({
        colorScheme: "destructive",
        description: error.errors[0].message,
      });
    },
  });

  const selectedProfilePicture = form.watch("profilePicture");

  const selectProfilePicture = () => {
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
      form.setValue("profilePicture", profilePicture);
      input.removeEventListener("change", handleProfilePictureSelect);
    };

    input.addEventListener("change", handleProfilePictureSelect);
    input.click();
  };

  const save = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      const data = form.getValues();
      const formData = new FormData();
      formData.append("displayName", data.displayName);
      formData.append("userName", data.userName);
      if (data.bio) {
        formData.append("bio", data.bio);
      }
      if (data.profilePicture !== undefined) {
        formData.append("profilePicture", data.profilePicture.file);
      }
      mutate(formData);
    }
  };

  return (
    <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogClose />
          <DialogTitle>Edit profile</DialogTitle>

          <Button onClick={save} isLoading={isPending}>
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
                    Profile picture{" "}
                  </FormLabel>

                  <div className="col-span-3 flex items-center gap-x-3">
                    <Avatar className="w-20 h-20">
                      <AvatarImage
                        src={
                          selectedProfilePicture?.url ||
                          (isSuccess && loggedInUserData?.user.profilePicture
                            ? baseFileUrl +
                              loggedInUserData?.user.profilePicture
                                .lowQualityFileName
                            : "")
                        }
                        alt={`@${loggedInUserData?.user?.userName}`}
                      />
                      <AvatarFallback className="text-3xl">
                        {getNameInitials(loggedInUserData?.user?.displayName!)}
                      </AvatarFallback>
                    </Avatar>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={selectProfilePicture}
                    >
                      Choose profile picture
                    </Button>
                  </div>
                </div>
                <Separator />
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem className="mb-3 grid gap-x-4 grid-cols-4">
                      <FormLabel className="mt-1 text-sm">Name</FormLabel>
                      <div className="col-span-3">
                        <FormControl className="w-full">
                          <Input
                            placeholder="Enter the new name"
                            size="lg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem className="mb-3 grid gap-x-4 grid-cols-4">
                      <FormLabel className="mt-1 text-sm">Username</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input
                            placeholder="Enter the new username"
                            size="lg"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Separator />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="mb-3 grid gap-x-4 grid-cols-4">
                      <FormLabel className="mt-1 text-sm">Bio</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Textarea
                            className="pt-1.5"
                            placeholder="Enter the new bio"
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
});

export default EditUserProfileModal;
