"use client";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";
import EmailVerificationForm from "../forms/email-verification-form";
import { emailVerificationPurposes } from "@/constants/email-verification-constants";
import {
  requestNewOtpForEmailChangeRequest,
  verificationForEmailChangeRequest,
} from "@/services/user-service";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "../core/use-toast";

interface EmailVerificationModalProps {
  purpose: string;
}

const EmailVerificationModal = NiceModal.create(
  ({ purpose }: EmailVerificationModalProps) => {
    const modal = useModal();
    const { toast } = useToast();

    // const onChange = async (value: string) => {
    //   try {
    //     const data = await requestToSend(value);
    //     modal.resolve(data);
    //     modal.hide();
    //   } catch (error) {
    //     setErrorMessage("Incorrect code");
    //   }
    //   setIsLoading(false);
    // };

    const notifyThatOtpWasSent = () => {
      toast({
        colorScheme: "success",
        description: "We have sent you a new otp",
        duration: 1500,
      });
    };

    const {
      mutate: requestNewOtpForEmailChange,
      isPending: isRequestNewOtpForEmailChangePending,
      error: requestNewOtpForEmailChangeError,
      reset: resetRequestNewOtpForEmailChange,
    } = useMutation({
      mutationFn: requestNewOtpForEmailChangeRequest,
      onSuccess: () => {
        notifyThatOtpWasSent();
      },
    });


    const sendOtp = async (otp: string) => {
      if (purpose === emailVerificationPurposes.changeEmail) {
        await verificationForEmailChangeRequest(otp);
        toast({
          colorScheme: "success",
          description: "Email changed",
          duration: 1500,
        });
        modal.hide();
      }
    };

    const requestNewOtp = () => {
      if (purpose === emailVerificationPurposes.changeEmail) {
        requestNewOtpForEmailChange();
      }
    };
    return (
      <Dialog open={modal.visible}>
        <DialogContent className="md:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Email verification</DialogTitle>
            <DialogClose onClick={modal.hide} />
          </DialogHeader>
          <div className="px-7 pb-5 pt-2">
            <EmailVerificationForm
              onSendOtp={sendOtp}
              onRequestNewOtp={requestNewOtp}
              isNewOtpSending={isRequestNewOtpForEmailChangePending}
              error={requestNewOtpForEmailChangeError}
              resetError={resetRequestNewOtpForEmailChange}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default EmailVerificationModal;
