"use client";
import { Alert, AlertDescription } from "@/components/core/alert";
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
import { completeSignupRequest } from "@/services/auth-service";
import {
  CompleteSignupFormFields,
  completeSignupSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { PasswordInput } from "../core/password-input";

const CompleteSignupForm = () => {
  const router = useRouter();

  const form = useForm<CompleteSignupFormFields>({
    resolver: zodResolver(completeSignupSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      displayName: "",
      password: "",
      userName: "",
    },
  });
  const onSubmit: SubmitHandler<CompleteSignupFormFields> = async (data) => {
    try {
      await completeSignupRequest(data);
      router.replace("/home");
    } catch (err: any) {
      if (err.errors) {
        const error = err.errors[0];
        if (error.field === "userName") {
          form.setError("userName", { message: error.message });
        } else {
          form.setError("root.serverCatch", {
            message: error.message,
          });
        }
      }
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-4">
            <div className="text-2xl font-semibold">Complete signup</div>
          </div>

          {form.formState.errors.root && (
            <Alert colorScheme="destructive" className="mb-2">
              <AlertDescription>
                {form.formState.errors.root.serverCatch.message}
              </AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem className="mb-3 flex-1">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Type your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem className="mb-3 flex-1">
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose an username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-3">
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="At least 12 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-8">
            <Button
              type="submit"
              fullWidth
              isLoading={
                form.formState.isSubmitting || form.formState.isSubmitSuccessful
              }
            >
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CompleteSignupForm;
