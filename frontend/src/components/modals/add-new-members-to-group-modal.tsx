import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { usersQueryKey } from "@/constants/query-keys";
import { getUsersRequest } from "@/services/user-service";
import { Discussion } from "@/types/discussion";
import { User } from "@/types/user";
import { maxMembersInGroupDiscussion } from "@/validation-schema/discussion-schema";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useDebouncedValue, useNetwork } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import { PiMagnifyingGlass } from "react-icons/pi";
import { Button } from "../core/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import { Input } from "../core/input";
import { useToast } from "../core/use-toast";
import {
  UserOptionItem,
  UserOptionItemLoader,
} from "../items/user-option-item";
import { ModalSearchInput } from "../core/modal-search-input";
import { SelectedUserBubbleItem } from "../items/selected-user-bubble-item";

const AddNewMembersToGroupModal = NiceModal.create(
  ({ discussion }: { discussion: Discussion }) => {
    const modal = useModal();
    const { toast } = useToast();
    const [isAddingNewMembers, setIsAddingNewMembers] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const webSocket = useAtomValue(webSocketAtom);
    const network = useNetwork();

    const [selectedUsers, setSelectedUsers] = useState<Map<string, User>>(
      new Map()
    );

    const addUsersToGroupDiscussion = async () => {
      if (!network.online) {
        toast({ colorScheme: "destructive", description: "You are offline" });
        return;
      }
      setIsAddingNewMembers(true);
      const newMemberIds = Array.from(selectedUsers.values()).map((u) => u.id);
      webSocket?.emit("add-members-to-group-discussion", {
        newMemberIds,
        discussionId: discussion.id,
      });
    };

    const [q, setQ] = useState("");
    const handleSearchInputChange: ChangeEventHandler<HTMLInputElement> = (
      e
    ) => {
      setQ(e.target.value || "");
    };
    const [debouncedQ] = useDebouncedValue(q, 400);

    const { data, isSuccess, isLoading, isPending } = useQuery({
      queryKey: [usersQueryKey, `q=${debouncedQ}`],
      queryFn: () => getUsersRequest({ q: debouncedQ }),
      enabled: debouncedQ.length > 0,
    });

    const selectUser = (user: User) => {
      const membersValid =
        discussion.members.length + selectedUsers.size <
        maxMembersInGroupDiscussion;
      if (!membersValid) {
        toast({
          colorScheme: "destructive",
          description: `You can't add more members`,
        });
        return;
      }
      if (isUserAlreadyInGroupDiscussion(user)) {
        toast({
          colorScheme: "destructive",
          description: "User already in group",
        });
        return;
      }
      setSelectedUsers((prevState) => {
        prevState.set(user.id, user);
        return new Map(prevState);
      });
      if (searchInputRef.current?.value) {
        searchInputRef.current.value = "";
      }
    };

    const unSelectUser = (user: User) => {
      setSelectedUsers((prevState) => {
        prevState.delete(user.id);
        return new Map(prevState);
      });
    };

    const addMembersToGroupDiscussionSuccess = (eventData: {
      discussion: Discussion;
    }) => {
      toast({ colorScheme: "success", description: "New members added" });
      modal.hide();
      setIsAddingNewMembers(false);
    };

    const isUserAlreadyInGroupDiscussion = (user: User) => {
      if (isSuccess) {
        if (
          discussion.members.find(({ userId }) => userId === user.id) !==
          undefined
        ) {
          return true;
        }
      }
      return false;
    };

    const addMembersToGroupDiscussionError = (eventData: {
      message: string;
      user?: User;
    }) => {
      if (eventData.user) {
        toast({
          colorScheme: "destructive",
          description: `${eventData.user.displayName} already in group`,
        });
      } else {
        toast({ colorScheme: "destructive", description: eventData.message });
      }
      setIsAddingNewMembers(false);
    };

    useEffect(() => {
      webSocket?.on(
        "add-members-to-group-discussion-success",
        addMembersToGroupDiscussionSuccess
      );
      webSocket?.on(
        "add-members-to-group-discussion-error",
        addMembersToGroupDiscussionError
      );
      return () => {
        webSocket?.off(
          "add-members-to-group-discussion-success",
          addMembersToGroupDiscussionSuccess
        );
        webSocket?.off(
          "add-members-to-group-discussion-error",
          addMembersToGroupDiscussionError
        );
      };
    }, [webSocket]);

    return (
      <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogClose />
            <DialogTitle>Add new members</DialogTitle>

            <Button
              isLoading={isAddingNewMembers}
              disabled={selectedUsers.size === 0}
              onClick={addUsersToGroupDiscussion}
            >
              Add
            </Button>
          </DialogHeader>
          <div className="pb-2">
            <ModalSearchInput
              placeholder="Search for a person to add"
              ref={searchInputRef}
              onChange={handleSearchInputChange}
            />
            <div
              className={`px-4 flex items-center gap-5 overflow-x-auto
              ${selectedUsers.size > 0 ? "pt-5 pb-4 border-b" : ""}
              `}
            >
              {Array.from(selectedUsers.values()).map((user) => (
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
                  Search user
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
                    disabled={selectedUsers.has(user.id)}
                  />
                ))
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default AddNewMembersToGroupModal;
