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
import { signupRequest } from "@/services/auth-service";
import {
  SignupFormFields,
  signupFormSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { emailToVerifyAtom } from "./email-verification-form";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { emailVerificationPurposes } from "@/constants/email-verification-constants";

const SignupForm = () => {
  const router = useRouter();
  const form = useForm<SignupFormFields>({
    resolver: zodResolver(signupFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      email: "",
    },
  });

  const setEmailToVerify = useSetAtom(emailToVerifyAtom);

  const onSubmit: SubmitHandler<SignupFormFields> = async (data) => {
    try {
      await signupRequest(data);
      setEmailToVerify(data.email);
      router.push(
        `/email-verification?purpose=${emailVerificationPurposes.signup}`
      );
      // redirect(
      //   `/email-verification?purpose=${emailVerificationPurposes.signup}`
      // );
    } catch (err: any) {
      if (err.errors) {
        form.setError("root.serverCatch", {
          message: err.errors[0].message,
        });
      }
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onChange={() => form.clearErrors()}
        >
          <div className="mb-4">
            <div className="text-2xl font-semibold">Sign up</div>
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
            name="email"
            render={({ field }) => (
              <FormItem className="mb-3">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="xyz@mail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-5 text-sm text-gray-700">
            By registering you accept the&nbsp;
            <Link href="/terms" className="text-blue-500">
              Terms of use
            </Link>
            &nbsp;and the
            <Link href="/privacy-policy" className="text-blue-500 px-0">
              &nbsp;Privacy policy
            </Link>
          </div>
          <div className="mt-2">
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
      <div className="text-sm flex mt-2">
        <p className="text-gray-600">Already have an account ? &nbsp;</p>
        <Link href="/login" className="text-blue-500">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
