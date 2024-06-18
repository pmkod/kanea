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
import { loggedInUserQueryKey } from "@/constants/query-keys";
import { changeUsernameRequest } from "@/services/user-service";
import { changeUsernameSchema } from "@/validation-schema/user-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "../core/use-toast";
import { PasswordInput } from "../core/password-input";

const ChangeUsernameForm = () => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof changeUsernameSchema>>({
    resolver: zodResolver(changeUsernameSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      password: "",
      newUsername: "",
    },
  });
  const { toast } = useToast();

  const onSubmit: SubmitHandler<z.infer<typeof changeUsernameSchema>> = async ({
    newUsername,
    password,
  }) => {
    try {
      const data = await changeUsernameRequest({ newUsername, password });
      toast({ colorScheme: "success", description: "Username changed" });
      form.reset({
        password: "",
        newUsername: "",
      });
      queryClient.setQueryData([loggedInUserQueryKey], (qData: any) => ({
        ...qData,
        user: {
          ...qData.user,
          userName: data.user.userName,
        },
      }));
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
            name="newUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New username</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    size="xl"
                    placeholder="Enter the new username"
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

export default ChangeUsernameForm;
