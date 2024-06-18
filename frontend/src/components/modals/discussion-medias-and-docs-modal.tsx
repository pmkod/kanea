import {
  discussionsQueryKey,
  messagesWithDocsQueryKey,
  messagesWithMediasQueryKey,
} from "@/constants/query-keys";
import {
  getDiscussionMessagesWithDocsRequest,
  getDiscussionMessagesWithMediasRequest,
} from "@/services/discussion-service";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { buildMessageFileUrl } from "@/utils/discussion-utils";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { PiDownloadSimple, PiFileFill, PiPlayFill } from "react-icons/pi";
import { useInView } from "react-intersection-observer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
} from "../core/dialog";
import Loader from "../core/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../core/tabs";
import ChatMessageMediaModal from "./chat-message-media-modal";
import { Skeleton } from "../core/skeleton";
import { downloadFile } from "@/utils/file-utils";

const DiscussionMediasAndDocsModal = NiceModal.create(
  ({ discussion }: { discussion: Discussion }) => {
    const modal = useModal();

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();
    return (
      <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader className="mb-0">
            <DialogClose />
          </DialogHeader>
          <div className="px-2 pb-4">
            <Tabs defaultValue="medias">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="medias">Medias</TabsTrigger>
                <TabsTrigger value="docs">Docs</TabsTrigger>
              </TabsList>
              <TabsContent value="medias">
                <MediasTab discussion={discussion} />
              </TabsContent>
              <TabsContent value="docs">
                <DocsTab discussion={discussion} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default DiscussionMediasAndDocsModal;

const firstPageRequestedAtForMediasAtom = atom(new Date());

const MediasTab = ({ discussion }: { discussion: Discussion }) => {
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtForMediasAtom
  );

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const { data, isSuccess, isLoading, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      initialPageParam: 1,
      queryKey: [
        discussionsQueryKey,
        discussion.id,
        messagesWithMediasQueryKey,
      ],
      queryFn: (query) =>
        getDiscussionMessagesWithMediasRequest(discussion.id, {
          page: query.pageParam,
          firstPageRequestedAt,
        }),
      getNextPageParam: (lastPage, _) => {
        return lastPage.nextPage;
      },
    });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5 auto-rows-min h-[68vh] overflow-y-auto">
        {isLoading ? (
          <>
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
            <Skeleton className="w-full h-full aspect-square rounded-sm" />
          </>
        ) : isSuccess &&
          (data.pages[0].messages.length === 0 ||
            data.pages[0].messages[0].medias.length === 0) ? (
          <div className="pt-10 text-center col-start-1 col-end-4 text-sm text-gray-700">
            No media
          </div>
        ) : isSuccess ? (
          data?.pages.map((page) =>
            page.messages.map((message) =>
              message.medias.map((media) => (
                <MediaItem
                  key={media.bestQualityFileName}
                  media={media}
                  message={message}
                />
              ))
            )
          )
        ) : null}
      </div>
      {isFetchingNextPage && (
        <div className="flex justify-center pb-2">
          <Loader />
        </div>
      )}
      {hasNextPage && <div className="h-16" ref={ref}></div>}
    </div>
  );
};

const MediaItem = ({
  media,
  message,
}: {
  message: Message;
  media: Message["medias"][0];
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
    rootMargin: "200px",
  });

  const openMediaModal = () => {
    const mediaIndex = message.medias.findIndex(
      (m) => m.lowQualityFileName === media.lowQualityFileName
    );
    NiceModal.show(ChatMessageMediaModal, { mediaIndex, message });
  };

  return (
    <div
      ref={ref}
      key={media.lowQualityFileName}
      className="w-full aspect-square cursor-pointer bg-gray-200"
      onClick={openMediaModal}
    >
      {media.mimetype.startsWith("video") ? (
        <div className="relative w-full h-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-2 text-white bg-gray-900 cursor-pointer">
            <PiPlayFill />
          </div>
          <video
            src={
              inView
                ? buildMessageFileUrl({
                    discussionId: message.discussionId,
                    fileName: media.lowQualityFileName,
                    messageId: message.id,
                  })
                : ""
            }
            className="w-full h-full object-cover"
          ></video>
        </div>
      ) : (
        <img
          src={
            inView
              ? buildMessageFileUrl({
                  discussionId: message.discussionId,
                  fileName: media.lowQualityFileName,
                  messageId: message.id,
                })
              : ""
          }
          alt=""
          className="w-full h-full object-cover bg-gray-200"
        />
      )}
    </div>
  );
};

//
//
//
//
//
//
//

const firstPageRequestedAtForDocsAtom = atom(new Date());

const DocsTab = ({ discussion }: { discussion: Discussion }) => {
  const [firstPageRequestedAt, setFirstPageRequestedAt] = useAtom(
    firstPageRequestedAtForDocsAtom
  );

  useEffect(() => {
    setFirstPageRequestedAt(new Date());
  }, []);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
  });

  const { data, isLoading, isSuccess, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      initialPageParam: 1,
      queryKey: [discussionsQueryKey, discussion.id, messagesWithDocsQueryKey],
      queryFn: (query) =>
        getDiscussionMessagesWithDocsRequest(discussion.id, {
          page: query.pageParam,
          firstPageRequestedAt,
        }),
      getNextPageParam: (lastPage, _) => lastPage.nextPage,
    });

  return (
    <div className="h-[68vh] overflow-y-auto">
      <div className="">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-[52px] rounded" />
            <Skeleton className="h-[52px] rounded" />
            <Skeleton className="h-[52px] rounded" />
            <Skeleton className="h-[52px] rounded" />
            <Skeleton className="h-[52px] rounded" />
          </div>
        ) : isSuccess &&
          (data.pages[0].messages.length === 0 ||
            data.pages[0].messages[0].docs.length === 0) ? (
          <div className="pt-10 text-center text-sm text-gray-700">
            No document
          </div>
        ) : isSuccess ? (
          <div className="space-y-2">
            {data?.pages.map((page) =>
              page.messages.map((message) =>
                message.docs.map((doc) => (
                  <DocItem key={doc.fileName} message={message} doc={doc} />
                ))
              )
            )}
          </div>
        ) : null}
      </div>

      {isFetchingNextPage && (
        <div className="flex justify-center pb-2">
          <Loader />
        </div>
      )}
      {hasNextPage && <div className="h-16" ref={ref}></div>}
    </div>
  );
};

const DocItem = ({
  doc,
  message,
}: {
  message: Message;
  doc: Message["docs"][0];
}) => {
  const downloadDoc = () => {
    downloadFile(
      buildMessageFileUrl({
        discussionId: message.discussionId,
        messageId: message.id,
        fileName: doc.fileName,
      }),
      doc.originalFileName
    );
  };
  return (
    <div
      onClick={downloadDoc}
      className="pl-2 pt-1.5 pb-2 flex items-center cursor-pointer rounded border border-gray-200 hover:bg-gray-100 hover:shadow-sm transition-all"
    >
      <div className="mr-2 text-4xl text-gray-500">
        <PiFileFill />
      </div>
      <div className="flex-1">
        <div className="">
          <div className="font-medium leading-none text-gray-800">
            {doc.originalFileName}
          </div>
          <div className="text-xs leading-none mt-1.5 text-gray-500">
            {message.createdAt.toString()}
          </div>
        </div>
      </div>

      <div className="w-12 h-full flex items-center justify-center">
        <PiDownloadSimple />
      </div>
    </div>
  );
};
