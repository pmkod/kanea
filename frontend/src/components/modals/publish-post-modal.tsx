"use client";
import { webSocketAtom } from "@/app/(main)/_web-socket-atom";
import { baseFileUrl } from "@/configs";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import {
  acceptedImageMimetypes,
  acceptedVideoMimetypes,
} from "@/constants/file-constants";
import { followingTimelineQueryKey } from "@/constants/query-keys";
import { useLoggedInUser } from "@/hooks/use-logged-in-user";
import { Media } from "@/types/media";
import { Post } from "@/types/post";
import { getNameInitials } from "@/utils/user-utils";
import {
  maxPostTextLength,
  publishPostSchema,
} from "@/validation-schema/post-schemas";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom, useAtomValue } from "jotai";
import { usePathname } from "next/navigation";
import {
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
} from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  PiCornersOut,
  PiImage,
  PiPlayFill,
  PiSmiley,
  PiX,
} from "react-icons/pi";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "../core/avatar";
import { Button } from "../core/button";
import { Form, FormControl, FormField, FormItem } from "../core/form";
import { IconButton } from "../core/icon-button";
import { Textarea } from "../core/textarea";
import { useToast } from "../core/use-toast";
import { EmojiDropdown } from "../dropdown/emoji-dropdown/emoji-dropdown";
import MediaDisplayModal from "./media-display-modal";
import { CSS } from "@dnd-kit/utilities";

//
//
//
//
//

const PublishPostModal = NiceModal.create(() => {
  const modal = useModal();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { toast } = useToast();
  const webSocket = useAtomValue(webSocketAtom);
  const [isPublishing, setIsPublishing] = useState(false);
  const [textInputCursorIndex, setTextInputCursorIndex] = useState(0);
  const [isEmojiDropdownOpen, setIsEmojiDropdownOpen] = useState(false);

  const { data: loggedInUserData } = useLoggedInUser({
    enabled: false,
  });

  const form = useForm<z.infer<typeof publishPostSchema>>({
    resolver: zodResolver(publishPostSchema),
    // mode: "onChange",
    defaultValues: {
      medias: [],
      text: "",
    },
  });

  const selectedMedias = form.watch("medias");

  const selectPhotoOrVideo = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg, video/mp4";
    input.multiple = true;
    const maxMediasCount = 4;

    const handleMediaSelect = (event: Event) => {
      const files = input.files;

      if (!files || files?.length === 0) {
        return;
      }
      if (selectedMedias.length + files!.length > maxMediasCount) {
        toast({
          colorScheme: "destructive",
          title: `The maximum number of media for a post is ${maxMediasCount}`,
        });
        return;
      }

      const newMedias: any[] = [];
      for (let i = 0; i < files.length; i++) {
        const element = files[i];
        const media: Media = {
          id:
            selectedMedias.length > 0
              ? selectedMedias[selectedMedias.length - 1].id + 1 + i
              : 1 + i,
          file: element,
          url: URL.createObjectURL(element),
        };
        newMedias.push(media);
      }
      form.setValue("medias", [...selectedMedias, ...newMedias]);
      input.removeEventListener("change", handleMediaSelect);
    };

    input.addEventListener("change", handleMediaSelect);
    input.click();
  };

  const removeMedia = (id: number) => {
    const newMedias = selectedMedias.filter((media) => media.id !== id);
    form.setValue("medias", newMedias);
  };

  const publishPost = (data: z.infer<typeof publishPostSchema>) => {
    setIsPublishing(true);
    webSocket?.emit("publish-post", {
      text: data.text,
      medias: data.medias,
    });
  };

  const handleMouseUp: MouseEventHandler<HTMLTextAreaElement> = (e) => {
    setTextInputCursorIndex(e.currentTarget.selectionStart);
  };

  const handleKeyUp: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    setTextInputCursorIndex(e.currentTarget.selectionStart);
  };

  const publishPostSuccessEvent = (eventData: { post: Post }) => {
    toast({
      colorScheme: "success",
      description: "Post published successfully",
    });
    if (pathname === "/home") {
      const followingTimelineState = queryClient.getQueryState([
        followingTimelineQueryKey,
      ]);
      if (followingTimelineState?.status === "success") {
        queryClient.setQueryData([followingTimelineQueryKey], (qData: any) => {
          return {
            ...qData,
            pages: qData.pages.map((pageData: any, pageIndex: number) => ({
              ...pageData,
              posts:
                pageIndex === 0
                  ? [eventData.post, ...pageData.posts]
                  : [...pageData.posts],
            })),
          };
        });
      }
    }

    form.setValue("text", "");
    form.setValue("medias", []);
    setIsPublishing(false);
    modal.hide();
  };

  const handleEmojiSelect = (emojiObject: any) => {
    const text = form
      .getValues("text")!
      .split("")
      .toSpliced(textInputCursorIndex, 0, emojiObject.native)
      .join("");

    form.setValue("text", text);
    setTextInputCursorIndex(
      (prevState) => prevState + emojiObject.native.length
    );
  };

  const publishPostErrorEvent = ({
    errors,
  }: {
    errors: { message: string }[];
  }) => {
    setIsPublishing(false);
    toast({ colorScheme: "destructive", description: errors[0].message });
  };

  const postTextLength =
    form.getValues("text") !== undefined ? form.getValues("text")!.length : 0;

  const isPublishButtonDisabled = selectedMedias.length === 0;

  useEffect(() => {
    webSocket?.on("publish-post-success", publishPostSuccessEvent);
    webSocket?.on("publish-post-error", publishPostErrorEvent);

    return () => {
      webSocket?.off("publish-post-success", publishPostSuccessEvent);
      webSocket?.off("publish-post-error", publishPostErrorEvent);
    };
  }, [webSocket]);

  const onSubmit: SubmitHandler<z.infer<typeof publishPostSchema>> = async (
    data
  ) => {
    publishPost(data);
  };

  const handleClickOutsideModal = () => {
    modal.hide();
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active.id !== over?.id) {
      const activeIndex = selectedMedias.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = selectedMedias.findIndex(
        (item) => item.id === over?.id
      );
      form.setValue(
        "medias",
        arrayMove(selectedMedias, activeIndex, overIndex)
      );
    }
  };

  useEffect(() => {
    form.setValue("text", "");
    form.setValue("medias", []);
  }, [modal.visible]);

  return (
    <div
      className={`fixed inset-0 ${
        !modal.visible && "invisible"
      } z-40 overflow-x-hidden`}
    >
      <div
        onClick={handleClickOutsideModal}
        className={`w-full h-full bg-gray-800 opacity-50 z-[400] ${
          !modal.visible && "invisible"
        }
        ${isEmojiDropdownOpen && "pointer-events-none"}
        `}
      ></div>
      <div
        className={`absolute top-0 sm:top-10 left-1/2 transform -translate-x-1/2 z-[410] pb-4 h-screen sm:h-max w-full sm:w-[560px] sm:rounded-md bg-white`}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="relative flex items-center justify-between pl-3 pr-5 py-3.5 text-center">
              <IconButton variant="ghost" onClick={modal.hide} type="button">
                <PiX />
              </IconButton>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg md:text-xl font-bold leading-none text-left tracking-tight">
                New post
              </div>
              <div className="sm:hidden">
                <Button
                  size="sm"
                  type="submit"
                  disabled={isPublishButtonDisabled}
                  isLoading={isPublishing}
                >
                  Publish
                </Button>
              </div>
            </div>
            <div className="px-5 py-2">
              <div className="flex gap-x-5">
                <Avatar className="w-10 h-10 mt-1">
                  <AvatarImage
                    src={
                      loggedInUserData && loggedInUserData.user.profilePicture
                        ? baseFileUrl +
                          loggedInUserData.user.profilePicture
                            .lowQualityFileName
                        : ""
                    }
                  />
                  <AvatarFallback>
                    {getNameInitials(loggedInUserData?.user.displayName!)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormControl>
                        <FormItem>
                          <Textarea
                            onKeyUp={handleKeyUp}
                            onMouseUp={handleMouseUp}
                            className="w-full tracking-wide h-44 leading-none border-transparent focus:border-transparent text-base resize-none"
                            placeholder="What's new ?"
                            {...field}
                          ></Textarea>
                        </FormItem>
                      </FormControl>
                    )}
                  />
                  {postTextLength > maxPostTextLength && (
                    <div className="text-sm text-red-500 mt-1.5 pl-3">
                      Max text length for post is {maxPostTextLength}
                    </div>
                  )}
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedMedias}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="flex gap-x-2 gap-y-2 mt-2 flex-wrap">
                        {selectedMedias?.map((item) => (
                          <SelectedMediaItem
                            key={item.id}
                            media={item}
                            remove={() => removeMedia(item.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={selectPhotoOrVideo}
                >
                  <PiImage />
                  <span className="ml-2 text-sm cursor-pointer">
                    Add images / videos
                  </span>
                </Button>

                <EmojiDropdown
                  handleEmojiSelect={handleEmojiSelect}
                  onOpenChange={setIsEmojiDropdownOpen}
                >
                  <IconButton
                    type="button"
                    variant="outline"
                    className="text-xl"
                  >
                    <PiSmiley />
                  </IconButton>
                </EmojiDropdown>
              </div>
              <div className="hidden sm:block">
                <Button
                  type="submit"
                  disabled={isPublishButtonDisabled}
                  isLoading={isPublishing}
                >
                  Publish
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
});

export default PublishPostModal;

//
//
//
//
//
//
//
//
//

interface SelectedMediaItemProps {
  media: Media;
  remove: () => void;
}

const SelectedMediaItem = ({ media, remove }: SelectedMediaItemProps) => {
  const isImage = acceptedImageMimetypes.includes(media.file!.type);
  const isVideo = acceptedVideoMimetypes.includes(media.file!.type);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: media.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const openMediaDisplayModal: MouseEventHandler<HTMLDivElement> = (e) => {
    NiceModal.show(MediaDisplayModal, { media });
  };

  const onRemove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    remove();
  };

  return (
    <div className="relative" style={style}>
      <div className="absolute top-1 right-1 flex gap-x-0.5">
        <div
          className="rounded-full z-30 text-sm text-[#ffffff] bg-[#1d2424] p-1 cursor-pointer"
          onClick={openMediaDisplayModal}
        >
          {isImage ? <PiCornersOut /> : isVideo ? <PiPlayFill /> : null}
        </div>
        <div
          className="rounded-full z-30 text-sm text-[#ffffff] bg-[#1d2424] p-1 cursor-pointer"
          onClick={onRemove}
        >
          <PiX />
        </div>
      </div>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="rounded w-24 overflow-hidden aspect-square"
      >
        {isImage && (
          <img src={media.url} alt="" className="w-full h-full object-cover" />
        )}
        {isVideo && (
          <video className="w-full h-full object-cover">
            <source src={media.url} type={media.file?.type} />
          </video>
        )}
      </div>
    </div>
  );
};
