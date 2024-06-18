"use client";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { deletePostRequest } from "@/services/post-service";
import { Post } from "@/types/post";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../core/alert-dialog";
import { Button } from "../core/button";

export const DeletePostModal = NiceModal.create(({ post }: { post: Post }) => {
  const modal = useModal();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const handleOpenChange = (open: boolean) =>
    open ? modal.show() : modal.hide();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deletePostRequest(post.id),
    onSuccess: (data, variables, context) => {
      if (pathname === `/posts/${post.id}`) {
        router.push(`/users/${loggedInUserData?.user.userName}`);
      } else if (pathname === `/home`) {
        queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
          return {
            ...qData,
            pages: qData.pages.map((pageData: any) => ({
              ...pageData,
              posts: pageData.posts.filter(
                (postInData: Post) => postInData.id !== data.post.id
              ),
            })),
          };
        });
      }

      modal.hide();
    },
  });

  const confirm = () => {
    mutate();
  };
  const cancel = () => {
    modal.hide();
    // mutate()
  };

  return (
    <AlertDialog open={modal.visible} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete post</AlertDialogTitle>
          <AlertDialogDescription>Are you sure ?</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-y-2">
          <Button onClick={confirm} isLoading={isPending}>
            Confirmer
          </Button>
          <Button variant="outline" onClick={cancel}>
            Annuler
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
});
