import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { Media } from "@/types/media";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { PiX } from "react-icons/pi";
import { IconButton } from "../core/icon-button";
import { CSSProperties } from "react";

const MediaDisplayModal = NiceModal.create(({ media }: { media: Media }) => {
  const modal = useModal();

  const isImage = acceptedImageMimetypes.includes(media.file!.type);
  const isVideo = acceptedVideoMimetypes.includes(media.file!.type);

  const handleOpenChange = (open: boolean) =>
    open ? modal.show() : modal.hide();

  const mediaInlineStyle: CSSProperties = {
    maxHeight: "calc(100vh - 48px)",
    width: "auto",
    objectFit: "contain",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    padding: "24px 0px",
    zIndex: 120,
    height: "100%",
  };

  return (
    <DialogPrimitive.Root open={modal.visible} onOpenChange={handleOpenChange}>
      {/* <DialogOverlay /> */}
      <DialogPrimitive.Portal>
        <div className="fixed inset-0 w-full h-full bg-gray-900 opacity-70 z-[110]"></div>
        <DialogPrimitive.Content>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 px-3 z-[130] mx-auto w-[700px] max-w-full h-12 flex items-center">
            <IconButton
              onClick={modal.hide}
              variant="ghost"
              className="text-[#ffffff] hover:bg-[#6b7280]"
            >
              <PiX className="#ffffff" />
            </IconButton>
            <div className="flex-1 h-full" onClick={modal.hide}></div>
          </div>

          {isImage ? (
            <img src={media.url} alt="" style={mediaInlineStyle} />
          ) : isVideo ? (
            <video controls src={media.url} style={mediaInlineStyle}></video>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
});

export default MediaDisplayModal;
