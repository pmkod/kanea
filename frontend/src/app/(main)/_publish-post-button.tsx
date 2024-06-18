import PublishPostModal from "@/components/modals/publish-post-modal";
import NiceModal from "@ebay/nice-modal-react";
import { PiPlus } from "react-icons/pi";

export const PublishPostButton = () => {
  const openPublishPostModal = () => {
    NiceModal.show(PublishPostModal);
  };
  return (
    <button
      onClick={openPublishPostModal}
      className="w-14 aspect-square cursor-pointer fixed z-40 text-white bottom-20 right-8 rounded-full text-2xl bg-gray-900 hover:bg-gray-800 flex md:hidden items-center justify-center"
    >
      <PiPlus />
    </button>
  );
};
