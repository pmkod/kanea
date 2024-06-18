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
import { useToast } from "@/components/core/use-toast";
import { changePasswordRequest } from "@/services/user-service";
import { changePasswordSchema } from "@/validation-schema/user-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { PasswordInput } from "../core/password-input";

//
//

export const ChangePasswordForm = () => {
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      newPasswordConfirmation: "",
    },
  });

  const { toast } = useToast();

  const onSubmit: SubmitHandler<z.infer<typeof changePasswordSchema>> = async ({
    currentPassword,
    newPassword,
    newPasswordConfirmation,
  }) => {
    if (!newPasswordConfirmation) {
      form.setError("newPasswordConfirmation", {
        message: "Confirm password",
      });
      return;
    }
    if (newPassword !== newPasswordConfirmation) {
      form.setError("newPasswordConfirmation", {
        message: "Password don't match",
      });
      return;
    }

    try {
      await changePasswordRequest({ currentPassword, newPassword });
      toast({ colorScheme: "success", description: "Password changed" });
      form.reset({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirmation: "",
      });
    } catch (err: any) {
      if (err.errors) {
        for (const error of err.errors) {
          if (error.field) {
            form.setError(error.field, { message: error.message });
          }
        }
      }
    }
  };

  return (
    <div className="w-full xl:w-[480px] mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel>Current password</FormLabel>
                <FormControl>
                  <PasswordInput
                    size="xl"
                    placeholder="Type your current password here"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="mb-5">
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <PasswordInput
                    size="xl"
                    placeholder="Type the new password here"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPasswordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <PasswordInput
                    size="xl"
                    placeholder="Confirm the new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-3 text-gray-500 leading-4 text-sm">
            Changing your password will log you out of all your active sessions
            except the current session.
          </div>
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
