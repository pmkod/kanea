"use client";
import { Button } from "@/components/core/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import EmailVerificationModal from "@/components/modals/email-verification-modal";
import { changeEmailRequest } from "@/services/user-service";
import { changeEmailSchema } from "@/validation-schema/user-schemas";
import NiceModal from "@ebay/nice-modal-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "../core/password-input";
import { Alert, AlertDescription } from "../core/alert";
import { emailVerificationPurposes } from "@/constants/email-verification-constants";

const ChangeEmailForm = () => {
  const form = useForm<z.infer<typeof changeEmailSchema>>({
    resolver: zodResolver(changeEmailSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      password: "",
      newEmail: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof changeEmailSchema>> = async ({
    newEmail,
    password,
  }) => {
    try {
      await changeEmailRequest({ newEmail, password });
      form.reset({
        password: "",
        newEmail: "",
      });
      NiceModal.show(EmailVerificationModal, {
        purpose: emailVerificationPurposes.changeEmail,
      });
    } catch (err: any) {
      if (err.errors) {
        if (err.errors.length === 1) {
          form.setError("root.serverCatch", {
            message: err.errors[0].message,
          });
        } else {
          for (const error of err.errors) {
            if (error.field) {
              form.setError(error.field, { message: error.message });
            }
          }
        }
      }
    }
  };

  return (
    <div className="w-full xl:w-[480px] mx-auto">
      <Form {...form}>
        {form.formState.errors.root &&
          form.formState.errors.root.serverCatch.message && (
            <Alert colorScheme="destructive" className="mb-5">
              <AlertDescription>
                {form.formState.errors.root.serverCatch.message}
              </AlertDescription>
            </Alert>
          )}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    size="xl"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    size="xl"
                    placeholder="Enter the new email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              size="lg"
              isLoading={form.formState.isSubmitting}
            >
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ChangeEmailForm;
