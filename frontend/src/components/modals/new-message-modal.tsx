"use client";
import { useModal, create } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import { ChangeEventHandler, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { User } from "@/types/user";
import { getUsersRequest } from "@/services/user-service";
import { useQuery } from "@tanstack/react-query";
import { usersQueryKey } from "@/constants/query-keys";
import { useRouter } from "next/navigation";
import {
  UserOptionItem,
  UserOptionItemLoader,
} from "../items/user-option-item";
import { checkIfDiscussionBetweenMeAndAnUserExistRequest } from "@/services/discussion-service";
import { TbLoader2 } from "react-icons/tb";
import { ModalSearchInput } from "../core/modal-search-input";

const NewMessageModal = create(() => {
  const modal = useModal();
  const router = useRouter();

  const [q, setQ] = useState("");
  const [debouncedQ] = useDebouncedValue(q, 400);
  const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setQ(e.target.value || "");
  };

  const [isCheckingIfDiscussionExist, setIsCheckingIfDiscussionExist] =
    useState(false);

  const { data, isSuccess, isLoading, isPending } = useQuery({
    queryKey: [usersQueryKey, `q=${debouncedQ}`],
    queryFn: () => getUsersRequest({ q: debouncedQ }),
    enabled: debouncedQ.length > 0,
  });

  const handleOpenChange = (open: boolean) =>
    open ? modal.show() : modal.hide();

  const openDiscussion = async (user: User) => {
    setIsCheckingIfDiscussionExist(true);
    try {
      const data = await checkIfDiscussionBetweenMeAndAnUserExistRequest(
        user.id
      );

      modal.hide();
      router.push(`/discussions/${data.discussion.id}`);
    } catch (error) {
      const searchParams = new URLSearchParams();
      searchParams.set("memberId", user.id);
      searchParams.set("memberDisplayName", user.displayName);
      searchParams.set("memberUserName", user.userName);
      if (user.profilePicture) {
        searchParams.set(
          "memberLowQualityProfilePictureName",
          user.profilePicture.lowQualityFileName
        );
        searchParams.set(
          "memberBestQualityProfilePictureName",
          user.profilePicture.bestQualityFileName
        );
      }
      modal.hide();
      router.push(`/discussions/new?${searchParams.toString()}`);
    }
    setIsCheckingIfDiscussionExist(false);
  };

  return (
    <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogClose />
          <DialogTitle>New message</DialogTitle>
          {isCheckingIfDiscussionExist && (
            <div className="absolute top-1/2 right-6 transform -translate-y-1/2 pt-1.5">
              <div className="animate-spin text-xl">
                <TbLoader2 />
              </div>
            </div>
          )}
        </DialogHeader>
        <div className="pb-2">
          <div>
            <ModalSearchInput
              placeholder="Search user"
              onChange={handleSearchInputChange}
            />
          </div>
          <div className="pt-2 flex flex-col gap-y-px px-2 h-[60vh] overflow-auto">
            {isLoading ? (
              <>
                <UserOptionItemLoader />
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
                  onSelect={openDiscussion}
                />
              ))
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default NewMessageModal;
