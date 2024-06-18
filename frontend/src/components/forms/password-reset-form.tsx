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
import { passwordResetRequest } from "@/services/auth-service";
import {
  PasswordResetFormFields,
  passwordResetFormSchema,
} from "@/validation-schema/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { SubmitHandler, useForm } from "react-hook-form";
import { emailToVerifyAtom } from "./email-verification-form";

interface PasswordResetFormProps {
  formTitle?: string;
  onSuccess: () => void;
}

const PasswordResetForm = ({
  formTitle,
  onSuccess,
}: PasswordResetFormProps) => {
  const form = useForm<PasswordResetFormFields>({
    resolver: zodResolver(passwordResetFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  const setEmailToVerify = useSetAtom(emailToVerifyAtom);

  const onSubmit: SubmitHandler<PasswordResetFormFields> = async (data) => {
    try {
      await passwordResetRequest(data);
      setEmailToVerify(data.email);
      onSuccess();
    } catch (err: any) {
      if (err.errors) {
        form.setError("root.serverCatch", {
          message: err.errors[0].message,
        });
      }
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        onChange={() => form.clearErrors()}
      >
        {formTitle !== undefined && (
          <div className="text-2xl font-semibold mb-5">{formTitle}</div>
        )}

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
            <FormItem className="mb-6">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="xyz@mail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-1 mb-3">
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

        <Alert className="text-sm">A code will be sent to you by e-mail</Alert>
      </form>
    </Form>
  );
};

export default PasswordResetForm;
