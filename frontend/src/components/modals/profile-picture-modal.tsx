import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { DialogOverlay } from "../core/dialog";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { PiX } from "react-icons/pi";
import { IconButton } from "../core/icon-button";

const ProfilePictureModal = NiceModal.create(
  ({ pictureUrl }: { pictureUrl: string }) => {
    const modal = useModal();

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    // const { width, height } = useViewportSize();

    // const calculatePictureWidth = () => {
    //   let min = width;
    //   if (width < height) {
    //     min = width;
    //   } else if (width > height) {
    //     min = height;
    //   }
    //   return min;
    // };

    return (
      <>
        <DialogPrimitive.Root
          open={modal.visible}
          onOpenChange={handleOpenChange}
        >
          <DialogPrimitive.Portal>
            <DialogOverlay className="z-[110]" />
            <DialogPrimitive.Content>
              <div className="absolute z-[120] top-0 left-1/2 transform -translate-x-1/2 w-[550px] max-w-full h-12 flex items-center">
                <IconButton
                  onClick={modal.hide}
                  variant="ghost"
                  className="text-[#ffffff] hover:bg-[#6b7280]"
                  size="lg"
                >
                  <PiX />
                </IconButton>
                <div className="flex-1 h-full" onClick={modal.hide}></div>
              </div>

              <img
                src={pictureUrl}
                alt=""
                style={{
                  // width: calculatePictureWidth() * 0.86,
                  height: "min(96vw, calc(96vh - 48px))",
                  borderRadius: 500,
                }}
                className="absolute z-[120] top-12 left-1/2 transform -translate-x-1/2 aspect-square object-cover rounded-full"
              />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </>
    );
  }
);

export default ProfilePictureModal;
