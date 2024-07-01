"use client";
import { Alert, AlertDescription } from "@/components/core/alert";
import { Button } from "../core/button";
import { atom } from "jotai";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../core/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EmailVerificationFormFields,
  emailVerificationFormSchema,
} from "@/validation-schema/auth-schemas";
import { Input } from "@/components/core/input";

export const emailToVerifyAtom = atom<string | undefined>(undefined);

interface EmailVerificationFormProps {
  onSendOtp: (otp: string) => Promise<void>;
  onRequestNewOtp: () => void;
  isNewOtpSending: boolean;
  error: any;
  resetError: () => void;
  formTitle?: string;
}

const EmailVerificationForm = ({
  formTitle,
  onSendOtp,
  onRequestNewOtp,
  isNewOtpSending,
  error,
  resetError,
}: EmailVerificationFormProps) => {
  // const { toast } = useToast();

  const form = useForm<EmailVerificationFormFields>({
    resolver: zodResolver(emailVerificationFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit: SubmitHandler<EmailVerificationFormFields> = async (data) => {
    try {
      await onSendOtp(data.otp);
    } catch (err: any) {
      if (err.errors) {
        const error = err.errors[0];
        if (error.field) {
          form.setError(error.field, {
            message: error.message,
          });
        } else {
          form.setError("root.serverCatch", {
            message: error.message,
          });
        }
        return;
      }
      form.setError("root.serverCatch", {
        message: "Error",
      });
    }
  };

  return (
    <div>
      {error !== null ? (
        <div>
          <Alert colorScheme="destructive">
            <AlertDescription className="font-medium">
              {(error as any).errors[0].message}
            </AlertDescription>
          </Alert>

          <div className="flex justify-center mt-3">
            <Button variant="outline" onClick={resetError}>
              Ok
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onChange={() => form.clearErrors()}
          >
            {formTitle && (
              <div className="text-2xl font-medium mb-4">{formTitle}</div>
            )}

            {form.formState.errors.root &&
              form.formState.errors.root.serverCatch.message && (
                <Alert colorScheme="destructive" className="mb-2">
                  <AlertDescription>
                    {form.formState.errors.root.serverCatch.message}
                  </AlertDescription>
                </Alert>
              )}
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Otp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the otp you received by e-mail here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-6">
              <Button
                type="submit"
                className="w-full"
                isLoading={
                  form.formState.isSubmitting ||
                  form.formState.isSubmitSuccessful
                }
              >
                Send
              </Button>
            </div>

            <div className="flex gap-x-2 items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                The otp expires after <br />
                <span className="text-xs">10</span> minutes
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="-mr-3"
                onClick={onRequestNewOtp}
                isLoading={isNewOtpSending}
                type="button"
              >
                Send a new code
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default EmailVerificationForm;
