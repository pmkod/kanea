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
import { loginRequest } from "@/services/auth-service";
import {
  LoginFormFields,
  loginFormSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  emailVerificationPurposes,
  emailVerificationTokenFieldName,
} from "@/constants/email-verification-constants";
import { useSetAtom } from "jotai";
import { emailToVerifyAtom } from "./email-verification-form";
import { PasswordInput } from "../core/password-input";

const LoginForm = () => {
  const setEmailToVerify = useSetAtom(emailToVerifyAtom);

  const router = useRouter();

  const form = useForm<LoginFormFields>({
    resolver: zodResolver(loginFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormFields> = async (data) => {
    try {
      await loginRequest(data);

      setEmailToVerify(data.email);
      router.push(
        `/email-verification?purpose=${emailVerificationPurposes.login}`
      );
    } catch (err: any) {

      if (err.errors) {
        form.setError("root.serverCatch", {
          message: err.errors[0].message,
        });
        return;
      }
      form.setError("root.serverCatch", {
        message: "Error",
      });
    }
  };

  return (
    <div className="">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => form.clearErrors()}
        >
          <div className="mb-4">
            <div className="text-2xl font-semibold">Log in</div>
          </div>

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
            name="email"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
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
          <div className="mb-1 mt-1 flex justify-end">
            <Link
              href="/password-reset"
              className="text-sm text-gray-800 hover:text-blue-500 border-b border-transparent hover:border-blue-500"
            >
              Forgot your password ?
            </Link>
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              className="w-full"
              isLoading={
                form.formState.isSubmitting || form.formState.isSubmitSuccessful
              }
            >
              Log in
            </Button>
          </div>
        </form>
      </Form>
      <div className="text-sm flex mt-1">
        <p className="text-gray-600">No account ? &nbsp;</p>
        <Link href="/signup" className="text-blue-500">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
