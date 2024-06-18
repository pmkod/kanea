import * as DialogPrimitive from "@radix-ui/react-dialog";
import { baseFileUrl } from "@/configs";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { httpClient } from "@/services/http-client";
import { Message } from "@/types/message";
import { durationFromNow } from "@/utils/datetime-utils";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import { getNameInitials } from "@/utils/user-utils";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { nanoid } from "nanoid";
import Link from "next/link";
import { PiDownloadSimple, PiX } from "react-icons/pi";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import { IconButton } from "../core/icon-button";
import { CSSProperties } from "react";
import { DialogOverlay } from "../core/dialog";
import { downloadFile } from "@/utils/file-utils";

const ChatMessageMediaModal = NiceModal.create(
  ({ message, mediaIndex }: { mediaIndex: number; message: Message }) => {
    const modal = useModal();

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const handleDownloadFile = () => {
      downloadFile(
        buildMessageFileUrl({
          discussionId: message.discussionId,
          messageId: message.id,
          fileName: message.medias[mediaIndex].bestQualityFileName,
        }),
        nanoid() +
          "." +
          message.medias[mediaIndex].bestQualityFileName.split(".").pop()
      );
    };

    const mediaInlineStyle: CSSProperties = {
      maxHeight: "calc(100vh - 112px)",
      width: "auto",
      objectFit: "contain",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 220,
    };

    return (
      <DialogPrimitive.Root
        open={modal.visible}
        onOpenChange={handleOpenChange}
      >
        <DialogPrimitive.Portal>
          <DialogOverlay className="z-[210]" />
          <DialogPrimitive.Content>
            <>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-[230] w-[700px] max-w-full mx-auto p-2 h-14 px-4 flex items-center justify-between">
                <div className="flex gap-x-4">
                  <IconButton
                    variant="ghost"
                    onClick={modal.hide}
                    className="text-[#ffffff] hover:bg-[#6b7280]"
                  >
                    <PiX className="#ffffff" />
                  </IconButton>

                  <div className="flex items-center gap-x-2">
                    <Avatar asChild className="w-9 h-9">
                      <Link href={`/users/${message.sender?.userName}`}>
                        <AvatarImage
                          src={
                            message.sender && message.sender.profilePicture
                              ? baseFileUrl +
                                message.sender.profilePicture.lowQualityFileName
                              : ""
                          }
                          alt={`@${message.sender.userName}`}
                        />
                        <AvatarFallback>
                          {getNameInitials(message.sender?.displayName!)}
                        </AvatarFallback>
                      </Link>
                    </Avatar>
                    <div className="text-white flex-1 leading-none">
                      <Link
                        href={`/users/${message.sender?.userName}`}
                        className="block text-xs font-semibold mb-1 text-[#ffffff]"
                      >
                        {message.sender?.displayName}
                        {/* {durationFromNow(message.createdAt)} */}
                      </Link>
                      <Link
                        href={`/users/${message.sender?.userName}`}
                        className="block text-xs text-[#ffffff]"
                      >
                        <span className="text-xs">@</span>
                        <span>{message.sender?.userName}</span>
                      </Link>
                    </div>
                  </div>
                </div>

                <IconButton
                  onClick={handleDownloadFile}
                  variant="ghost"
                  className="text-[#ffffff] hover:bg-[#6b7280]"
                >
                  <PiDownloadSimple className="#ffffff" />
                </IconButton>
              </div>
              {acceptedImageMimetypes.includes(
                message.medias[mediaIndex].mimetype
              ) ? (
                <img
                  src={buildMessageFileUrl({
                    discussionId: message.discussionId,
                    messageId: message.id,
                    fileName: message.medias[mediaIndex].bestQualityFileName,
                  })}
                  style={mediaInlineStyle}
                  alt=""
                />
              ) : acceptedVideoMimetypes.includes(
                  message.medias[mediaIndex].mimetype
                ) ? (
                <video controls style={mediaInlineStyle}>
                  <source
                    src={buildMessageFileUrl({
                      discussionId: message.discussionId,
                      messageId: message.id,
                      fileName: message.medias[mediaIndex].bestQualityFileName,
                    })}
                    type={message.medias[mediaIndex].mimetype}
                  />
                </video>
              ) : null}
              {message.text && message.text.length > 0 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-[230] w-[700px] max-w-full mx-auto  py-1 h-14 text-lg text-[#ffffff] truncate text-center">
                  {message.text}
                </div>
              )}
            </>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }
);

export default ChatMessageMediaModal;
