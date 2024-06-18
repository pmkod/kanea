"use client";
import { reportReasonsQueryKey } from "@/constants/query-keys";
import { getReportReasonsRequest } from "@/services/report-reason-service";
import { makeReportRequest } from "@/services/report-service";
import { Discussion } from "@/types/discussion";
import { Message } from "@/types/message";
import { Post } from "@/types/post";
import { PostComment } from "@/types/post-comment";
import { ReportReason } from "@/types/report-reason";
import { User } from "@/types/user";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Button } from "../core/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import Loader from "../core/loader";
import { useToast } from "../core/use-toast";
import { ReportReasonItem } from "../items/report-reason-item";

const ReportModal = NiceModal.create(
  ({
    post,
    postComment,
    discussion,
    message,
    user,
  }: {
    post?: Post;
    postComment?: PostComment;
    user?: User;
    message?: Message;
    discussion?: Discussion;
  }) => {
    const modal = useModal();
    const { toast } = useToast();

    const handleOpenChange = (open: boolean) =>
      open ? modal.show() : modal.hide();

    const { data, isSuccess, isLoading, isError } = useQuery({
      queryKey: [reportReasonsQueryKey],
      queryFn: getReportReasonsRequest,
    });

    const [selectedReportReason, setSelectedReportReason] =
      useState<ReportReason>();

    const selectReportReason = (reportReason: ReportReason) => {
      setSelectedReportReason(reportReason);
    };

    const { mutate: makeReport, isPending } = useMutation({
      mutationFn: () => {
        if (selectedReportReason === undefined) {
          throw Error("Your must select a reason");
        }
        const data = {
          reportReasonId: selectedReportReason.id,
        } as any;
        if (post !== undefined) {
          data.reportedPostId = selectedReportReason.id;
        } else if (postComment !== undefined) {
          data.reportedPostCommentId = selectedReportReason.id;
        } else if (discussion !== undefined) {
          data.reportedDiscussionId = selectedReportReason.id;
        } else if (message !== undefined) {
          data.reportedMessageId = selectedReportReason.id;
        } else if (user !== undefined) {
          data.reportedUserId = selectedReportReason.id;
        }
        return makeReportRequest(data);
      },

      onSuccess: () => {
        toast({
          colorScheme: "success",
          description: "Thanks for your report",
        });
        modal.hide();
        // modal.
      },
      onError: () => {
        toast({ colorScheme: "destructive", description: "Error" });
        modal.hide();
      },
    });

    useEffect(() => {
      setSelectedReportReason(undefined);
    }, [modal.visible]);

    return (
      <Dialog open={modal.visible} onOpenChange={handleOpenChange}>
        <DialogContent className="flex flex-col sm:h-[80vh]">
          <DialogHeader>
            <DialogClose />
            <DialogTitle>Report</DialogTitle>
          </DialogHeader>

          <div className="flex-1 px-8 overflow-y-auto pb-10">
            <div className="text-2xl font-semibold mb-4">
              What type of issue are you reporting?
            </div>
            {isLoading ? (
              <div className="flex justify-center pt-20">
                <Loader />
              </div>
            ) : (
              data?.reportReasons.map((reportReason) => (
                <ReportReasonItem
                  reportReason={reportReason}
                  selectedReportReason={selectedReportReason}
                  onClick={() => selectReportReason(reportReason)}
                />
              ))
            )}
          </div>
          <div className="px-8 pb-6">
            <Button
              fullWidth
              size="lg"
              onClick={() => makeReport()}
              isLoading={isPending}
              disabled={selectedReportReason === undefined}
            >
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default ReportModal;
