"use client";
import { Button } from "@/components/core/button";
import CreateGroupDiscussionModal from "@/components/modals/create-group-discussion-modal";
import NewMessageModal from "@/components/modals/new-message-modal";
import { show } from "@ebay/nice-modal-react";
import { MdOutlineGroupAdd } from "react-icons/md";
import { RiMailAddLine } from "react-icons/ri";

export const Buttons = () => {
  "use client";
  const openNewMessageModal = () => {
    show(NewMessageModal);
  };
  const openCreateGroupDiscussionModal = () => {
    show(CreateGroupDiscussionModal);
  };
  return (
    <>
      <div className="mb-3">
        <Button
          variant="outline"
          size="xl"
          onClick={openCreateGroupDiscussionModal}
        >
          <div className="mr-3">
            <MdOutlineGroupAdd />
          </div>
          New group
        </Button>
      </div>
      <Button size="xl" onClick={openNewMessageModal}>
        <div className="mr-3">
          <RiMailAddLine />
        </div>
        New message
      </Button>
    </>
  );
};
